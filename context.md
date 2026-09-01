# ICT Mavi Imiliya Club — Context

> Recruitment & hackathon portal. Production-ready. Vercel + Neon Postgres.

## Stack

- **Next 16.3.3** (App Router, Turbopack, `proxy.ts`), **React 19.2.8**, **TS 5 strict**, `@/* -> ./src/*`
- **Tailwind 4.3.3** (`@import "tailwindcss"`, `@custom-variant dark`), IBM Plex Sans/Mono via `next/font`
- **DB:** Neon (`@neondatabase/serverless` + `ws`), `drizzle-orm 0.45.2`, `drizzle-kit 0.31.10` (`drizzle.config.ts` -> `./src/db/schema.ts`, `./drizzle`)
- **Auth:** `jose` HS256 JWT (7d) + `bcryptjs`, cookie `auth_token` httpOnly lax
- **Email:** `nodemailer` Brevo SMTP (`SMTP_HOST/PORT/USER/PASS`), mock fallback
- **Forms:** `zod` + `react-hook-form` + `@hookform/resolvers`
- **Tooling:** eslint `nextVitals`, prettier, `tsx`, `dotenv`

## Structure

```
src/
  proxy.ts                          # auth proxy (replaces middleware), matcher [/admin/*, /login]
  app/
    layout.tsx, globals.css, page.tsx (home, settings-driven)
    about/  login/ (client)  dashboard/ (client unified lookup + NoteModal)
    board-recruitment/ (server) -> apply/ (server + ApplyForm 5-step client) + status/ (client)
    hackathon/ (server) -> register/ (static Closed + unused HackathonForm) + status/ (client) + success/ (?teamNumber)
    admin/ layout (requireAdmin guard) -> page (stats) + applications/ (list + [id] empty) + teams/ (list + [id] empty) + broadcast/ + settings/
    api/ auth/login, auth/logout, board/status, hackathon/status, user/dashboard, export/applications, export/teams
  components/ ui.tsx (Button/Input/Textarea/Select/Label/Card/Badge), Navbar.tsx, Footer.tsx, ThemeProvider.tsx, NoteModal.tsx
  db/ schema.ts, index.ts (drizzle neon), seed.ts (positions + admin + settings)
  lib/ constants.ts, validation.ts, auth.ts, email.ts, email-templates.ts, ratelimit.ts, utils.ts (cn, registrationStatus, hackathonStatus=CLOSED)
  actions/ board.ts, hackathon.ts (stub Closed), admin.ts
scripts/setup.ts  # hardcode admin + open registrations
drizzle.config.ts, next.config.ts ({allowedDevOrigins}), postcss.config.mjs, tsconfig.json
```

## Database (Neon Postgres, Drizzle)

- `users` (id uuid PK, name, email unique, password_hash, role default ADMIN)
- `board_positions` (id, name unique, description, isActive, sortOrder) — seed 13, only `Member` isActive
- `board_applications` (id, applicationNumber `ICT-BOARD-YYYY-XXXX` unique, fullName/email/phone/grade/section, studentId, dateOfBirth, profilePhoto, firstChoicePositionId FK, technicalInterests/expertise/experience/leadershipExperience/projects/competitions, githubUrl/portfolioUrl/otherLinks, motivation/positionReason/contribution/proposedActivities NOT NULL, timeCommitment, status default SUBMITTED, adminNotes text, timestamps) indexes: email, status, studentId
- `hackathon_teams` (id, teamNumber `ICT-HACK-YYYY-XXXX` unique, teamName, projectTitle, category, description, problemStatement/solution/technologyStack, status default REGISTERED, adminNotes text) indexes: status, category
- `hackathon_members` (id, teamId FK cascade, fullName/email/phone/grade/section/studentId/role, githubUrl, isLeader) unique: studentId, email; index teamId
- `settings` (id, key unique, value, updatedAt) — keys: club_name, club_description, contact_email, board_opens/closes, hackathon_opens/closes/date/categories
- Relations: `hackathonTeams many hackathonMembers`, `hackathonMembers one hackathonTeams` (boardApplications no relation, manual Map)

## Features

**Board Recruitment:** landing (active positions -> only Member, deadline 2026-08-31), 5-step ApplyForm (Personal/Position/Experience/Motivation/Confirm, rhf+zod, progress bar, fallback-member handling), `submitBoardApplication` (rate limit ip 3/60s + email 2/60s, sequential `ICT-BOARD-YYYY-` numbering), status lookup by ID **or** email.

**Hackathon:** landing (hackathonStatus always CLOSED -> register disabled), register page is static Closed (HackathonForm exists but unused, would enforce 4 members), status lookup by Team ID **or** email (via members).

**Dashboard (`/dashboard`):** unified search `?q` (ID uppercased, alias `applicationId`) + `?email` (lowercased), merges board+team results, clickable cards -> NoteModal.

**Admin (guard `requireAdmin` in layout, redirect /login):** dashboard counts (8 cards via count(*)), applications/teams lists (filter q/status/category, pagination, CSV export via `toCsv`), detail `[id]` pages currently empty placeholders but `StatusUpdate`/`TeamStatusUpdate` components exist (Select status + Textarea adminNotes + notify checkbox -> `updateApplicationStatus`/`updateTeamStatus` which persist adminNotes + optional `boardStatusEmail`/`hackathonStatusEmail` with yellow note box + revalidate). Broadcast (audience board/hackathon/all, statusFilter, sendBulk 300ms), Settings (club meta, open/close dates, categories, test email, positions toggle/add).

**Auth:** `lib/auth.ts` createToken/verifyToken/getSession/requireAdmin/setAuthCookie/clearAuthCookie/validateLogin. `proxy.ts` verifies `auth_token` via `jose.jwtVerify`, redirects /admin->/login, /login->/admin|/dashboard by role. `POST /api/auth/login` (5/min), `POST /api/auth/logout`. `login/page.tsx` role-based push.

**Email:** `getTransport` (Brevo), `sendEmail` + `sendBulk throttled`, templates in `email-templates.ts` (wrap purple header, boardSubmitted/boardStatus/hackathonRegistered/hackathonStatus/broadcast, adminNotes yellow box).

**Rate Limit:** in-memory Map `rateLimit(key,limit,windowMs)` — LIMITS: boardSubmit 3/60s, hackathonSubmit 3/60s, statusLookup 10/60s, dashboard 15/60s, login 5/60s, broadcast 1/5m, testEmail 5/60s. `getClientIp` from x-forwarded-for.

## Routes

| Route | Type |
|-------|------|
| `/`, `/about` | server/static |
| `/login` | client |
| `/dashboard` | client ID/email + NoteModal |
| `/board-recruitment`, `/board-recruitment/apply`, `/board-recruitment/status` | server, server+client, client ID/email + NoteModal |
| `/hackathon`, `/hackathon/register` (Closed), `/hackathon/status`, `/hackathon/success?teamNumber` | server, static, client, server |
| `/admin`, `/admin/applications`, `/admin/applications/[id]` (empty), `/admin/teams`, `/admin/teams/[id]` (empty), `/admin/broadcast`, `/admin/settings` | server guarded |
| `POST /api/auth/login`, `POST /api/auth/logout` | login 5/min |
| `GET /api/board/status?applicationNumber=&email=` | statusLookup 10/min, ID or email |
| `GET /api/hackathon/status?teamNumber=&email=` | statusLookup 10/min, ID or email |
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
Setup: `npm i` -> `cp .env.example .env` -> `npx drizzle-kit push` -> `npx tsx src/db/seed.ts` -> `npm run dev` (also `npx tsx scripts/setup.ts` opens registrations).

## Recent Changes

- **Navbar blur fix (Navbar.tsx):** header `bg-white` solid on mobile, `md:bg-white/80 md:backdrop-blur` only from md, `isolate`, `env(safe-area-inset-top)`, body overflow hidden + Esc + pathname auto-close, hamburger 18x14 animated, mobile nav solid `md:hidden`, overlay `bg-zinc-900/20` (no backdrop-blur).
- **Status search ID or email:** `board/status`, `hackathon/status`, `user/dashboard` APIs now accept ID alone OR email alone (email-only returns array if multiple). UIs have `— or leave blank` labels, `hasQuery` gate, disabled button, list header counts, `View admin note →`.
- **Admin notes + NoteModal:** `admin_notes` text on both tables, `updateApplicationStatus`/`updateTeamStatus` persist + email yellow box, APIs return `adminNotes`, new `components/NoteModal.tsx` (fixed z-50, dim bg, scaleIn, Esc+overflow lock, Badge+pre-wrap note), used in dashboard, board/status, hackathon/status — cards are now buttons opening modal.

## Conventions & Gotchas

- Styling: zinc palette, indigo CTA, rounded 16-20px, `touch-manipulation min-h-11`, `supports-[backdrop-filter]`, animations `fadeUp/scaleIn/shimmer`, `var(--ease-out)`.
- ThemeProvider defaults `dark`, toggles `documentElement.classList`, persisted localStorage (html has `dark` forced initially).
- `hackathonStatus()` hardcoded `CLOSED` in `lib/utils.ts:31` — registration always closed regardless of settings.
- `boardApplicationSchema` uses single `firstChoicePositionId` (secondChoice legacy), confirm `literal(true)`.
- Admin `[id]` detail pages are 0-byte — StatusUpdate components ready but route blank.
- IDs uppercased, emails lowercased in APIs.
- `AGENTS.md` note: Next 16 breaking changes, docs at `node_modules/next/dist/docs/`, regenerated by `next dev`.
