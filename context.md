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
    hackathon/ (server) -> guide/ (server handbook, 15 sections, GuideNav/FAQ/Checklist islands) + register/ (settings-gated + HackathonForm 5-step client) + status/ (client) + final/ (client final submission, teamNumber+email verified) + success/ (?teamNumber)
    admin/ layout (requireAdmin guard) -> page (13 stat cards) + applications/ (list + [id] detail + StatusUpdate) + teams/ (list + [id] detail + IdeaStatusUpdate/FinalUnlockButton/TeamStatusUpdate) + broadcast/ + settings/
    api/ auth/login (loginSchema, safe JSON), auth/logout, board/status (ID+email required), hackathon/status (ID+email required), user/dashboard (email required; q-only rejected), export/applications, export/teams
  components/ ui.tsx (Button/Input/Textarea/Select/Label/Card/Badge), Navbar.tsx, Footer.tsx, ThemeProvider.tsx, NoteModal.tsx, LocaleProvider.tsx, LanguageSwitcher.tsx, hackathon/GuideNav.tsx (sticky on-this-page + progress), FAQAccordion.tsx, ChecklistCard.tsx (localStorage)
  db/ schema.ts, index.ts (drizzle neon), seed.ts (positions + admin + settings)
  lib/ constants.ts (statuses, MEMBER_ROLES, DEFAULT_CATEGORIES, JUDGING_CRITERIA, MAX_TEAMS=9, MEMBERS_PER_TEAM=3), validation.ts (max lengths: motivation etc 5000, password 128; notInTeam/teamEmailRequired), auth.ts (email normalized lower), email.ts, email-templates.ts (esc HTML), ratelimit.ts, utils.ts (cn, registrationStatus, toCsv with formula-escape), i18n.ts (makeT supports arrays/objects for structured keys), i18n/en.ts+ne.ts (hackathonGuide.* full EN/NE), i18n-server.ts
  actions/ board.ts (withTransaction advisory 9203119), hackathon.ts (submitHackathonTeam advisory 9203117, submitFinal with optional email membership check + LIMITS.finalSubmission, unlockFinalSubmission), admin.ts (incl. updateIdeaStatus, quota advisory 9203118)
scripts/  # setup.ts + .mjs helpers: create-admin, migrate, open-registration, verify-login, one-off fix-*/check-* codemods
drizzle.config.ts, next.config.ts ({allowedDevOrigins, poweredByHeader false, security headers}), postcss.config.mjs, tsconfig.json
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

**Board Recruitment:** landing (active positions -> only Member, deadline settings-driven), 5-step ApplyForm (Personal/Position/Experience/Motivation/Confirm, rhf+zod, progress bar, fallback-member handling), `submitBoardApplication` (rate limit ip 3/60s + email 2/60s, advisory-lock `9203119` sequential `ICT-BOARD-YYYY-` numbering inside `withTransaction`), status lookup requires **ID + email** (ID-only returns 400). `[id]` admin detail page renders full field grid + StatusUpdate (Select status + Textarea adminNotes + notify checkbox).

**Hackathon (3-stage): School Management theme, exactly 3 members, one leader (laptop owner), built from scratch, max 9 teams / 27 participants.**
1. *Registration* (`/hackathon/register`, settings-gated OPEN/COMING_SOON/CLOSED, shows registered-team count): 5-step HackathonForm — teamName unique, projectTitle, category (16 fallback `DEFAULT_CATEGORIES`), description ≥20 max 5000, projectIdeaSummary ≥20 max 5000 (problem/solution/stack optional capped), 3 members with global-unique email+studentId (case-insensitive checks in `submitHackathonTeam` raw-neon transaction `pg_advisory_xact_lock(9203117)`), first member forced Team Leader (`superRefine`), confirmInfo + confirmScratch literals; sequential teamNumber, leader email via `hackathonRegisteredEmail`.
2. *Idea review* (admin): `updateIdeaStatus` sets `ideaStatus` (PENDING/APPROVED/NEEDS_REVISION/REJECTED) + adminNotes on team detail page; ideaStatus shows in teams list table, status API, and NoteModal subtitle. No email sent on idea updates beyond leader notify (escaped HTML).
3. *Final submission* (`/hackathon/final`, client): Team ID + **member email** + repositoryUrl + documentationUrl required (finalDemoUrl/finalDescription/aiToolsUsed optional) + originalWorkConfirmed checkbox -> `submitFinal(teamNumber, data, ip, locale, requesterEmail)` (rate limit `LIMITS.finalSubmission` 5/60s, `buildFinalSubmissionSchema` max caps, membership check if email supplied) sets isFinalSubmitted/finalSubmittedAt/originalWorkConfirmed, status=FINAL_SUBMITTED, emails leader (`finalSubmissionEmail`). **Locked once submitted** — admin `FinalUnlockButton` (`unlockFinalSubmission`, clears isFinalSubmitted + timestamp only; status reverts to APPROVED/REGISTERED).

**Hackathon landing:** rules grid, required-documentation checklist (Team/Project/Members/Problem/Target Users/Solution/Features/Tech Stack/How It Works/Screenshots/Challenges/Future Improvements), categories, `JUDGING_CRITERIA` (7 weighted items = 100%), prohibited/disqualification panel, working hours from settings (`hackathon_working_hours`/`hackathon_break_minutes`, default 4h + 30min). CTA row now links **Guide & Preparation →** (`/hackathon/guide`).

**Hackathon Guide (`/hackathon/guide`, server):** student-friendly preparation handbook — 15 anchored sections (Overview 8 cards, Rules, How It Works 7-step timeline, Project Ideas from settings/`DEFAULT_CATEGORIES`, Prepare Before You Arrive, YouTube titles Beginner/Intermediate (no fake URLs), AI Guide, Team Prep, Team Roles, What to Bring / NOT Bring, Documentation 12 items, Judging `JUDGING_CRITERIA`, Mindset, FAQ accordion, Checklist). Uses `hackathonStatus` gating for Register CTA, `MAX_TEAMS`/`MEMBERS_PER_TEAM` as source of truth, `overflow-x-hidden` + `min-w-0` + `max-w-[100vw]` on mobile to prevent horizontal scroll; hero `break-words`, mobile GuideNav sticky `top-[57px]` horizontal pill rail with `overflow-y-hidden` + momentum scroll. Islands: `GuideNav` (IntersectionObserver + progress bar + `t(hackathonGuide.onThisPage)`), `FAQAccordion`, `ChecklistCard` (frontend-only `localStorage` `hackathon-guide-checklist`, hydrated post-mount to avoid mismatch). `generateMetadata` from `hackathonGuide.metaTitle/metaDesc`. Fully i18n via `hackathonGuide.*` in `en.ts`/`ne.ts` and `makeT` array/object support; final submission `teamEmail` + `validation.notInTeam/teamEmailRequired` also translated.

**Dashboard (`/dashboard`):** unified search `?q` (ID uppercased, alias `applicationId`) + `?email` (lowercased), merges board+team results, clickable cards -> NoteModal. **Email is required** — `q`-only without email returns 400 (anti-enumeration).

**Admin (guard `requireAdmin` in layout, redirect /login):** dashboard 13 cards (board counts, teams `x / 9`, participants `x / 27`, Approved/Pending Teams, Pending Ideas, Needs Revision, Final Submissions, Disqualified); applications/teams lists (teams filter q/status/category/ideaStatus/final via URL params — form exposes q+status only, table shows Idea + Final columns, CSV export via `toCsv` with `=+-@` prefix sanitization); team detail page shows badges, project card, Idea Review card, members grid (leader highlighted), Final Submission card (links + unlock), TeamStatusUpdate; Broadcast (audience board/hackathon/all, statusFilter, sendBulk 300ms); Settings (club meta, open/close dates, categories, test email, positions toggle/add).

**Auth:** `lib/auth.ts` createToken/verifyToken/getSession/requireAdmin/setAuthCookie/clearAuthCookie(overwrites + deletes)/validateLogin(normalized lower). `proxy.ts` verifies `auth_token` via `jose.jwtVerify`, redirects /admin->/login, /login->/admin|/dashboard by role. `POST /api/auth/login` validates `loginSchema` + safe JSON parse (5/min), `POST /api/auth/logout` clears with maxAge 0 overwrite. `login/page.tsx` role-based push.

**Email:** `getTransport` (Brevo), `sendEmail` + `sendBulk throttled`, templates in `email-templates.ts` (wrap purple header, boardSubmitted/boardStatus/hackathonRegistered/hackathonStatus/finalSubmissionLocked/broadcast, adminNotes yellow box) — all user content via `esc()` HTML escaping, `kvTable` escapes both columns.

**Rate Limit:** in-memory Map `rateLimit(key,limit,windowMs)` — LIMITS: boardSubmit 3/60s, hackathonSubmit 3/60s (+email 2/60s), statusLookup 10/60s, dashboard 15/60s, login 5/60s, broadcast 1/5m, finalSubmission 5/60s, testEmail 5/60s. `getClientIp` from x-forwarded-for. Note: per-process (Vercel lambda); spoofable if not behind trusted proxy.

## Routes

| Route | Type |
|-------|------|
| `/`, `/about` | server/static |
| `/login` | client |
| `/dashboard` | client — email required, ID+email |
| `/board-recruitment`, `/board-recruitment/apply`, `/board-recruitment/status` | server, server+client, client ID+email |
| `/hackathon`, `/hackathon/guide` (handbook 15 sections), `/hackathon/register` (settings-gated), `/hackathon/status` (ID+email), `/hackathon/final` (teamId+email), `/hackathon/success?teamNumber` | server (guide is server), server+client, client, client, server |
| `/admin`, `/admin/applications`, `/admin/applications/[id]` (full detail + StatusUpdate), `/admin/teams`, `/admin/teams/[id]` (full detail + Idea/Final/Status controls), `/admin/broadcast`, `/admin/settings` | server guarded |
| `POST /api/auth/login`, `POST /api/auth/logout` | loginSchema validated, 5/min |
| `GET /api/board/status?applicationNumber=&email=` | requires both; 10/min; `eq` parameterized |
| `GET /api/hackathon/status?teamNumber=&email=` | requires both; 10/min; membership check |
| `GET /api/user/dashboard?email=&q=` | requires email; q-only 400; 15/min |
| `GET /api/export/applications`, `/api/export/teams` | requireAdmin CSV (formula prefix sanitized) |

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

- **Hackathon Guide & Preparation handbook (`/hackathon/guide`):** server page 15 anchored sections (Overview/Rules/How-It-Works/Ideas/Prepare/YouTube/AI/TeamPrep/Roles/Bring/Docs/Judging/Mindset/FAQ/Checklist); settings-driven categories + `JUDGING_CRITERIA` + `MAX_TEAMS`/`MEMBERS_PER_TEAM`; mobile-first `overflow-x-hidden`/`min-w-0`/`max-w-[100vw]` + `break-words` hero; sticky GuideNav rail + progress; `FAQAccordion` + `ChecklistCard` (`localStorage`, hydration-safe); i18n `hackathonGuide.*` EN/NE + `makeT` structured-key fix + `final.teamEmail` + `validation.notInTeam/teamEmailRequired`; `Guide & Preparation →` CTA on `/hackathon`.
- **Idea review + final submission workflow (9578c55):** hackathon_teams gained projectIdeaSummary, ideaStatus (default PENDING), final fields (repositoryUrl/documentationUrl/finalDemoUrl/aiToolsUsed/originalWorkConfirmed/finalSubmittedAt/isFinalSubmitted) + indexes; `hackathonStatus()` delegates to `registrationStatus()` (settings-driven); register page 3-member HackathonForm; new `/hackathon/final` + `submitFinal`/`unlockFinalSubmission`; admin detail fully built; `finalSubmission` rate limit.
- **Status search hardened:** `board/status`, `hackathon/status`, `user/dashboard` now require **email with ID** (AND/membership check); `q`-only on dashboard 400. UIs updated accordingly.
- **Admin notes + NoteModal:** `admin_notes` text, APIs return `adminNotes`, `NoteModal.tsx` (z-50, scaleIn, Esc+overflow lock).
- **Navbar blur fix:** solid `bg-white` on mobile, `md:bg-white/80 md:backdrop-blur` from md, `isolate`, safe-area, Esc auto-close, hamburger.

## Production Hardening (2026-09-04)

- **Security headers:** `next.config.ts` `poweredByHeader:false` + `headers()` (nosniff, DENY frame, strict referrer, Permissions-Policy, HSTS 2y).
- **Email XSS:** `email-templates.ts` `esc()` for all interpolations (`&<>"`), yellow admin notes `esc().replace(/\n/g,"<br/>")`, `kvTable` escapes.
- **CSV injection:** `utils.ts:toCsv` prefixes `=+-@\t\r` values with `'`.
- **Auth:** `validateLogin` lowercases email, `login` route uses `loginSchema` + try/catch JSON, `clearAuthCookie` overwrites with maxAge 0.
- **IDOR/enumeration:** `/api/board/status` + `/api/hackathon/status` require `email` when `id` supplied (AND/membership check); `/api/user/dashboard` rejects `q`-only without email (400). Status APIs 10/min rate limit retained.
- **Final submission auth:** `/hackathon/final` now collects `teamEmail` (`t(final.teamEmail)`), `submitFinal(..., requesterEmail)` verifies membership (`validation.notInTeam/teamEmailRequired`); `LIMITS.finalSubmission` used consistently.
- **Board numbering race:** `submitBoardApplication` now `withTransaction` + `pg_advisory_xact_lock(9203119)` (hackathon uses `9203117`, quota `9203118`).
- **Validation caps:** `validation.ts` max lengths (motivation etc 5000, techStack 3000, aiTools 2000, phone 30, grade 50, password 128).
- **i18n fix:** `makeT` now returns arrays/objects for structured keys (so `t("hackathonGuide.checklistItems")` etc. don't stringify); `ChecklistCard` hydrates `localStorage` post-mount to avoid server/client mismatch; guide metadata + all sections fully EN/NE via `hackathonGuide.*`.
- **Mobile overflow fix:** guide `overflow-x-hidden` + `min-w-0` on containers/grid, hero `break-words`, mobile rail `max-w-[100vw] overflow-hidden` + `overflow-y-hidden` momentum scroll; tightened cards (`p-4` mobile / `p-7` desktop), 2-col Overview, single-col Checklist.
- **Build/tests:** `next build` ✓ (26 routes incl. `/hackathon/guide`), `eslint` 0 errors 8 warnings, `tsc --noEmit` ✓, `npm audit` 4 moderate (esbuild dev-only via drizzle-kit, no prod impact).

## Conventions & Gotchas

- Styling: zinc palette, indigo CTA, rounded 16-20px, `touch-manipulation min-h-11`, `supports-[backdrop-filter]`, animations `fadeUp/scaleIn/shimmer`, `var(--ease-out)`.
- ThemeProvider defaults `dark`, toggles `documentElement.classList`, persisted localStorage (html has `dark` forced initially).
- Hackathon caps are hardcoded in admin UI: 9 teams / 27 participants (`HACKATHON_MAX_TEAMS`, `HACKATHON_MEMBERS_PER_TEAM`); submission action does NOT enforce the 9-team cap (enforced at approval quota gate with advisory lock).
- `finalDescription` is in `finalSubmissionSchema` but only persisted if provided (column exists).
- `submitHackathonTeam` scans ALL members/teams in-transaction for case-insensitive duplicate email/studentId/teamName (fine at this scale).
- `updateIdeaStatus` overwrites `ideaReviewNotes` per team (separate from `adminNotes` used by team status) — idea notes no longer collide with team status notes.
- `unlockFinalSubmission` clears isFinalSubmitted but leaves final_* fields persisted (repoUrl etc not cleared) and reverts status to APPROVED/REGISTERED.
- Hackathon registration requires settings `hackathon_opens`/`hackathon_closes` to be in window; falls back to 2026-01-01→2026-12-31 (open) if settings rows missing.
- `boardApplicationSchema` uses single `firstChoicePositionId` (secondChoice legacy), confirm `literal(true)`.
- IDs uppercased, emails lowercased in APIs; login normalizes lower.
- Rate limit is in-memory per lambda; for multi-instance prod consider Redis/Upstash.
- `AGENTS.md` note: Next 16 breaking changes, docs at `node_modules/next/dist/docs/`, regenerated by `next dev`.
