# Provider Verification Tool — API

Express + TypeScript backend with Prisma ORM and PostgreSQL.

## Setup

```bash
cp .env.example .env
# edit .env with your local Postgres credentials and database name

pnpm install
pnpm prisma:migrate
pnpm dev
```

The API runs on `http://localhost:4000` by default.

## Endpoints

- `GET /health` — liveness check
- `POST /api/lookups` — body `{ "query": string }`, accepts an NPI number or a provider name, queries the NPPES NPI Registry, persists the lookup (success or failure), and returns the saved record
- `GET /api/lookups` — the 50 most recent lookups, newest first

## Scripts

- `pnpm dev` — start the dev server with hot reload
- `pnpm build` — compile TypeScript to `dist/`
- `pnpm start` — run the compiled server
- `pnpm prisma:generate` — regenerate the Prisma client
- `pnpm prisma:migrate` — run dev migrations against `DATABASE_URL`
- `pnpm prisma:studio` — open Prisma Studio
