# ICT Mavi Imiliya Club — Context

> Recruitment & hackathon portal. Production-ready. Vercel + Neon Postgres.

## Stack

- **Next 16.3.3** (App Router, Turbopack, `proxy.ts`), **React 19.2.8**, **TS 5 strict**, `@/* -> ./src/*`
- **Tailwind 4.3.3** (`@import "tailwindcss"`, `@custom-variant dark`), IBM Plex Sans/Mono via `next/font`
- **DB:** Neon (`@neondatabase/serverless` + `ws`), `drizzle-orm 0.45.2`, `drizzle-kit 0.31.10` (`drizzle.config.ts` -> `./src/db/schema.ts`, `./drizzle`; loads `.env.local` with override first)
- **Auth:** `jose` HS256 JWT (7d) + `bcryptjs`, cookie `auth_token` httpOnly lax
- **Email:** `nodemailer` Brevo SMTP (`SMTP_HOST/PORT/USER/PASS`), mock fallback
- **Forms:** `zod` + `react-hook-form` + `@hookform/resolvers`
- **Tooling:** eslint `nextVitals`, prettier, `tsx`, `dotenv`; scripts `db:generate/migrate/studio/push/seed`

## Structure

```
src/
  proxy.ts                          # auth proxy (replaces middleware), matcher [/admin/*, /login]
  app/
    layout.tsx, globals.css, page.tsx (home, settings-driven)
    about/  login/ (client)  dashboard/ (client unified lookup + NoteModal)
    board-recruitment/ (server) -> apply/ (server + ApplyForm 5-step client) + status/ (client)
    hackathon/ (server) -> register/ (settings-gated + HackathonForm 5-step client) + status/ (client) + final/ (client final submission) + success/ (?teamNumber)
    admin/ layout (requireAdmin guard) -> page (13 stat cards) + applications/ (list + [id] detail + StatusUpdate) + teams/ (list + [id] detail + IdeaStatusUpdate/FinalUnlockButton/TeamStatusUpdate) + broadcast/ + settings/
    api/ auth/login, auth/logout, board/status, hackathon/status, user/dashboard, export/applications, export/teams
  components/ ui.tsx (Button/Input/Textarea/Select/Label/Card/Badge), Navbar.tsx, Footer.tsx, ThemeProvider.tsx, NoteModal.tsx
  db/ schema.ts, index.ts (drizzle neon), seed.ts (positions + admin + settings)
  lib/ constants.ts (statuses, MEMBER_ROLES, DEFAULT_CATEGORIES, JUDGING_CRITERIA, MAX_TEAMS=9, MEMBERS_PER_TEAM=3), validation.ts, auth.ts, email.ts, email-templates.ts, ratelimit.ts, utils.ts (cn, registrationStatus, hackathonStatus=registrationStatus)
  actions/ board.ts, hackathon.ts (submitHackathonTeam, submitFinal, unlockFinalSubmission), admin.ts (incl. updateIdeaStatus)
scripts/  # setup.ts + .mjs helpers: create-admin, migrate, open-registration, verify-login, one-off fix-*/check-* codemods
drizzle.config.ts, next.config.ts ({allowedDevOrigins}), postcss.config.mjs, tsconfig.json
```

## Database (Neon Postgres, Drizzle)

- `users` (id uuid PK, name, email unique, password_hash, role default ADMIN)
- `board_positions` (id, name unique, description, isActive, sortOrder) — seed 13, only `Member` isActive
- `board_applications` (id, applicationNumber `ICT-BOARD-YYYY-XXXX` unique, fullName/email/phone/grade/section, studentId, dateOfBirth, profilePhoto, firstChoicePositionId FK, technicalInterests/expertise/experience/leadershipExperience/projects/competitions, githubUrl/portfolioUrl/otherLinks, motivation/positionReason/contribution/proposedActivities NOT NULL, timeCommitment, status default SUBMITTED, adminNotes text, timestamps) indexes: email, status, studentId
- `hackathon_teams` (id, teamNumber `ICT-HACK-YYYY-XXXX` unique, teamName unique, projectTitle, category, description, problemStatement/solution/technologyStack nullable, **projectIdeaSummary**, **ideaStatus default PENDING**, **finalDemoUrl/repositoryUrl/documentationUrl/aiToolsUsed**, **originalWorkConfirmed bool**, **finalSubmittedAt timestamp**, **isFinalSubmitted bool default false**, status default REGISTERED, adminNotes text) indexes: status, category, **ideaStatus, isFinalSubmitted**
- `hackathon_members` (id, teamId FK cascade, fullName/email/phone/grade/section/studentId NOT NULL/role, githubUrl, isLeader) unique: studentId, email; index teamId
- `settings` (id, key unique, value, updatedAt) — keys: club_name, club_description, contact_email, board_opens/closes, hackathon_opens/closes/date/working_hours/break_minutes/categories
- Relations: `hackathonTeams many hackathonMembers`, `hackathonMembers one hackathonTeams` (boardApplications no relation, manual Map)

## Features

**Board Recruitment:** landing (active positions -> only Member, deadline 2026-08-31), 5-step ApplyForm (Personal/Position/Experience/Motivation/Confirm, rhf+zod, progress bar, fallback-member handling), `submitBoardApplication` (rate limit ip 3/60s + email 2/60s, sequential `ICT-BOARD-YYYY-` numbering), status lookup by ID **or** email. `[id]` admin detail page renders full field grid + StatusUpdate (Select status + Textarea adminNotes + notify checkbox).

**Hackathon (3-stage): School Management theme, exactly 3 members, one leader (laptop owner), built from scratch, max 9 teams / 27 participants.**
1. *Registration* (`/hackathon/register`, settings-gated OPEN/COMING_SOON/CLOSED, shows registered-team count): 5-step HackathonForm — teamName unique, projectTitle, category (16 fallback `DEFAULT_CATEGORIES`), description ≥20, projectIdeaSummary ≥20 (problem/solution/stack optional), 3 members with global-unique email+studentId (case-insensitive checks in `submitHackathonTeam` raw-neon transaction), first member forced Team Leader (`superRefine`), confirmInfo + confirmScratch literals; sequential teamNumber, leader email via `hackathonRegisteredEmail`.
2. *Idea review* (admin): `updateIdeaStatus` sets `ideaStatus` (PENDING/APPROVED/NEEDS_REVISION/REJECTED) + adminNotes on team detail page; ideaStatus shows in teams list table, status API, and NoteModal subtitle. No email sent on idea updates.
3. *Final submission* (`/hackathon/final`, client): Team ID + repositoryUrl + documentationUrl required (finalDemoUrl/finalDescription/aiToolsUsed optional) + originalWorkConfirmed checkbox -> `submitFinal` (rate limit 5/60s) sets isFinalSubmitted/finalSubmittedAt/originalWorkConfirmed, status=FINAL_SUBMITTED, emails leader (`finalSubmissionEmail`). **Locked once submitted** — admin `FinalUnlockButton` (`unlockFinalSubmission`, clears isFinalSubmitted + timestamp only; status stays FINAL_SUBMITTED until changed manually).

**Hackathon landing:** rules grid, required-documentation checklist (Team/Project/Members/Problem/Target Users/Solution/Features/Tech Stack/How It Works/Screenshots/Challenges/Future Improvements), categories, `JUDGING_CRITERIA` (7 weighted items = 100%), prohibited/disqualification panel, working hours from settings (`hackathon_working_hours`/`hackathon_break_minutes`, default 4h + 30min).

**Dashboard (`/dashboard`):** unified search `?q` (ID uppercased, alias `applicationId`) + `?email` (lowercased), merges board+team results, clickable cards -> NoteModal.

**Admin (guard `requireAdmin` in layout, redirect /login):** dashboard 13 cards (board counts, teams `x / 9`, participants `x / 27`, Approved/Pending Teams, Pending Ideas, Needs Revision, Final Submissions, Disqualified); applications/teams lists (teams filter q/status/category/ideaStatus/final via URL params — form exposes q+status only, table shows Idea + Final columns, CSV export via `toCsv`); team detail page shows badges, project card, Idea Review card, members grid (leader highlighted), Final Submission card (links + unlock), TeamStatusUpdate; Broadcast (audience board/hackathon/all, statusFilter, sendBulk 300ms); Settings (club meta, open/close dates, categories, test email, positions toggle/add).

**Auth:** `lib/auth.ts` createToken/verifyToken/getSession/requireAdmin/setAuthCookie/clearAuthCookie/validateLogin. `proxy.ts` verifies `auth_token` via `jose.jwtVerify`, redirects /admin->/login, /login->/admin|/dashboard by role. `POST /api/auth/login` (5/min), `POST /api/auth/logout`. `login/page.tsx` role-based push.

**Email:** `getTransport` (Brevo), `sendEmail` + `sendBulk throttled`, templates in `email-templates.ts` (wrap purple header, boardSubmitted/boardStatus/hackathonRegistered/hackathonStatus/finalSubmissionLocked/broadcast, adminNotes yellow box).

**Rate Limit:** in-memory Map `rateLimit(key,limit,windowMs)` — LIMITS: boardSubmit 3/60s, hackathonSubmit 3/60s (+email 2/60s), statusLookup 10/60s, dashboard 15/60s, login 5/60s, broadcast 1/5m, finalSubmission 5/60s, testEmail 5/60s. `getClientIp` from x-forwarded-for.

## Routes

| Route | Type |
|-------|------|
| `/`, `/about` | server/static |
| `/login` | client |
| `/dashboard` | client ID/email + NoteModal |
| `/board-recruitment`, `/board-recruitment/apply`, `/board-recruitment/status` | server, server+client, client ID/email + NoteModal |
| `/hackathon`, `/hackathon/register` (settings-gated), `/hackathon/status`, `/hackathon/final`, `/hackathon/success?teamNumber` | server, server+client, client, client, server |
| `/admin`, `/admin/applications`, `/admin/applications/[id]` (full detail + StatusUpdate), `/admin/teams`, `/admin/teams/[id]` (full detail + Idea/Final/Status controls), `/admin/broadcast`, `/admin/settings` | server guarded |
| `POST /api/auth/login`, `POST /api/auth/logout` | login 5/min |
| `GET /api/board/status?applicationNumber=&email=` | statusLookup 10/min, ID or email |
| `GET /api/hackathon/status?teamNumber=&email=` | statusLookup 10/min, returns ideaStatus/isFinalSubmitted/finalSubmittedAt |
| `GET /api/user/dashboard?email=&q=` | dashboard 15/min, returns {applications[], teams[]} with adminNotes |
| `GET /api/export/applications`, `/api/export/teams` | requireAdmin CSV |

## Env

```
DATABASE_URL=postgresql://...neondb...?sslmode=require
AUTH_SECRET=...
ADMIN_EMAIL / ADMIN_PASSWORD  (seed creates admin)
NEXT_PUBLIC_CLUB_NAME / NEXT_PUBLIC_SITE_URL=http://localhost:3000
SMTP_HOST=smtp-relay.brevo.com SMTP_PORT=587 SMTP_USER SMTP_PASS EMAIL_FROM=ict@sorvx.com EMAIL_FROM_NAME
```
Setup: `npm i` -> `cp .env.example .env` -> `npm run db:push` -> `npm run db:seed` -> `npm run dev` (also `npx tsx scripts/open-registration.mjs` / `scripts/setup.ts` opens registrations, `scripts/create-admin.mjs` makes admin).

## Recent Changes

- **Idea review + final submission workflow (9578c55):** hackathon_teams gained projectIdeaSummary, ideaStatus (default PENDING), final fields (repositoryUrl/documentationUrl/finalDemoUrl/aiToolsUsed/originalWorkConfirmed/finalSubmittedAt/isFinalSubmitted) + indexes; `hackathonStatus()` no longer hardcoded CLOSED — delegates to `registrationStatus()` (settings-driven); register page re-enabled with 3-member HackathonForm (confirmScratch, projectIdeaSummary); new `/hackathon/final` client page + `submitFinal`/`unlockFinalSubmission` actions; admin team detail page fully built (IdeaStatusUpdate, FinalUnlockButton, TeamStatusUpdate); admin dashboard 13 cards; teams list filters + Idea/Final columns; `finalSubmissionEmail` template; `finalSubmission` rate limit; scripts/*.mjs helpers.
- **Status search ID or email:** `board/status`, `hackathon/status`, `user/dashboard` APIs accept ID alone OR email alone (email-only returns array if multiple). UIs have `— or leave blank` labels, `hasQuery` gate, disabled button, list header counts, `View admin note →`.
- **Admin notes + NoteModal:** `admin_notes` text on both tables, APIs return `adminNotes`, `NoteModal.tsx` (fixed z-50, dim bg, scaleIn, Esc+overflow lock), used in dashboard, board/status, hackathon/status — cards are buttons opening modal.
- **Navbar blur fix:** header solid `bg-white` on mobile, `md:bg-white/80 md:backdrop-blur` from md only, `isolate`, safe-area-inset-top, Esc + pathname auto-close, animated hamburger, no backdrop-blur on overlay.

## Conventions & Gotchas

- Styling: zinc palette, indigo CTA, rounded 16-20px, `touch-manipulation min-h-11`, `supports-[backdrop-filter]`, animations `fadeUp/scaleIn/shimmer`, `var(--ease-out)`.
- ThemeProvider defaults `dark`, toggles `documentElement.classList`, persisted localStorage (html has `dark` forced initially).
- Hackathon caps are hardcoded in admin UI: 9 teams / 27 participants (`HACKATHON_MAX_TEAMS`, `HACKATHON_MEMBERS_PER_TEAM`); submission action does NOT enforce the 9-team cap.
- `finalDescription` is in `finalSubmissionSchema` but `submitFinal` never persists it (no DB column).
- `submitHackathonTeam` scans ALL members/teams in-transaction for case-insensitive duplicate email/studentId/teamName (fine at this scale).
- `updateIdeaStatus` overwrites the same `adminNotes` column as team status updates (single shared notes field per team).
- `unlockFinalSubmission` clears isFinalSubmitted but leaves status=FINAL_SUBMITTED.
- Hackathon registration requires settings `hackathon_opens`/`hackathon_closes` to be in window; falls back to 2026-01-01→2026-12-31 (open) if settings rows missing.
- `boardApplicationSchema` uses single `firstChoicePositionId` (secondChoice legacy), confirm `literal(true)`.
- IDs uppercased, emails lowercased in APIs.
- `AGENTS.md` note: Next 16 breaking changes, docs at `node_modules/next/dist/docs/`, regenerated by `next dev`.
