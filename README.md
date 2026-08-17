# Nudge Scheduler

Nudge is structured as a stable, boring SaaS collaboration platform:

- Next.js App Router with React Server Components by default
- Supabase Auth with HTTP-only cookie sessions and middleware refresh
- PostgreSQL through Prisma as the only database access layer
- Server Actions for mutations, Zod for validation, and no ad hoc API calls
- Small local client components only where interactivity is needed

Email confirmation is not part of this app flow. New accounts are signed in immediately. In Supabase, keep **Authentication -> Sign In / Providers -> Email -> Confirm email** turned off.

## Architecture

```txt
src/
  app/               routes, layouts, loading/error boundaries
  actions/           server actions for forms and mutations
  components/        auth, board, dashboard, layout, and ui components
  lib/               auth/session, Prisma, and Supabase clients
  services/          workspace database logic
  types/             shared domain types
  utils/             pure helpers
  prisma/            seed script
prisma/schema.prisma normalized PostgreSQL schema
```

## Environment

Copy `.env.example` into `.env.local` and fill:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=
DIRECT_URL=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Core Flows

Auth uses Supabase only. Browser code never stores tokens manually; sessions are persisted with Supabase SSR cookies and refreshed in `middleware.ts`. Server Components and Server Actions re-check the user through `src/lib/auth/session.ts`.

Boards are loaded in Server Components through Prisma services. The kanban board is the only interactive client island, using HTML5 drag/drop and a Server Action to persist moves.

## Health Check

Use `/api/health` to confirm database reachability and applied schema. It runs `SELECT 1` and lists existing `public` tables.

```bash
curl http://localhost:3000/api/health
```

## Commands

```bash
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
npm run build
```

## Deploy

Use Vercel for the Next.js app and Supabase for Auth/PostgreSQL. Set the same variables from `.env.example` in Vercel Project Settings before deploying.

Before pushing:

```bash
npm run db:generate
npx tsc --noEmit
npm run build
```

Apply the Prisma schema to Supabase before first production login:

```bash
npm run db:push
```

Then verify:

```bash
curl http://localhost:3000/api/health
```
