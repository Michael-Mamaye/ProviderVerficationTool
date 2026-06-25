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

## Scripts

- `pnpm dev` — start the dev server with hot reload
- `pnpm build` — compile TypeScript to `dist/`
- `pnpm start` — run the compiled server
- `pnpm prisma:generate` — regenerate the Prisma client
- `pnpm prisma:migrate` — run dev migrations against `DATABASE_URL`
- `pnpm prisma:studio` — open Prisma Studio
