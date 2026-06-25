# Provider Verification Tool

Monorepo for the Provider Verification Tool, managed with pnpm workspaces.

```
apps/
  web/   Next.js (App Router) frontend, Tailwind CSS + shadcn/ui
  api/   Express + TypeScript backend, Prisma ORM + PostgreSQL
```

## Prerequisites

- Node.js >= 20
- pnpm (`corepack enable` or `npm install -g pnpm`)
- A running PostgreSQL instance (local install or Docker)

## 1. Install dependencies

From the repo root, install everything for both apps in one go:

```bash
pnpm install
```

This also runs `prisma generate` automatically for `apps/api`.

## 2. Configure environment variables

Each app has its own `.env.example`. Copy them and fill in real values.

**Backend** (`apps/api/.env`):

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env` and set `DATABASE_URL` to point at your Postgres instance:

```
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/provider_verification_tool
PORT=4000
```

**Frontend** (`apps/web/.env.local`):

```bash
cp apps/web/.env.example apps/web/.env.local
```

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## 3. Set up the database

Create the database referenced in `DATABASE_URL` if it doesn't exist yet, then run the Prisma migration from `apps/api`:

```bash
cd apps/api
pnpm prisma:migrate
cd ../..
```

This creates the `Provider` and `Verification` tables defined in `apps/api/prisma/schema.prisma`.

## 4. Run the apps in development

From the repo root, in two separate terminals:

```bash
pnpm dev:api   # http://localhost:4000
pnpm dev:web   # http://localhost:3000
```

Check the backend is up:

```bash
curl http://localhost:4000/health
```

## Other useful commands

Run from the repo root unless noted otherwise.

| Command | Description |
| --- | --- |
| `pnpm install` | Install all dependencies for every app |
| `pnpm dev:web` | Start the Next.js dev server |
| `pnpm dev:api` | Start the Express dev server (hot reload via `tsx watch`) |
| `pnpm build` | Build both apps for production |
| `pnpm lint` | Lint/typecheck both apps |

Backend-only (run from `apps/api`):

| Command | Description |
| --- | --- |
| `pnpm prisma:generate` | Regenerate the Prisma client after a schema change |
| `pnpm prisma:migrate` | Create/apply a dev migration from `schema.prisma` |
| `pnpm prisma:studio` | Open Prisma Studio to browse the database |
| `pnpm start` | Run the production build (`dist/index.js`) |

## Production build

```bash
pnpm build
```

- `apps/web` is built with `next build` (output in `apps/web/.next`)
- `apps/api` runs `prisma generate` then compiles with `tsc` (output in `apps/api/dist`)

To run the built backend: `cd apps/api && pnpm start`.
To run the built frontend: `cd apps/web && pnpm start`.
