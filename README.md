# ICT Mavi Imiliya Club — Portal

Production-ready recruitment & hackathon portal. Next.js 16, TypeScript, Tailwind, Neon PostgreSQL, Drizzle ORM.

## Setup

```bash
npm install
cp .env.example .env   # fill DATABASE_URL, AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npx drizzle-kit push   # create tables
npx tsx src/db/seed.ts # seed positions + admin user
npm run dev
```

Seed creates 12 board positions and admin user from `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## Env

| Var | Description |
|-----|-------------|
| `DATABASE_URL` | Neon Postgres connection string |
| `AUTH_SECRET` | Random 32+ char secret (`openssl rand -base64 32`) |
| `ADMIN_EMAIL` | Admin login email |
| `ADMIN_PASSWORD` | Admin password (hashed on seed) |

## Scripts

| Script | Action |
|--------|--------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npx drizzle-kit push` | Push schema to DB |
| `npx drizzle-kit studio` | Drizzle Studio |

## Admin

Login at `/login` with seeded credentials. Manage applications, teams, and settings at `/admin`.

## Deploy (Vercel)

Set env vars in Vercel, push schema via `drizzle-kit push`, seed once, deploy.

## Structure

```
src/
  app/          # pages (/, about, board-recruitment, hackathon, admin, login, api)
  components/   # ui, Navbar, Footer
  db/           # schema, index, seed
  lib/          # auth, validation, constants, utils, email, ratelimit
  actions/      # board, hackathon, admin server actions
  proxy.ts      # admin auth
```
