# Provider Verification Tool

Looks up healthcare providers by NPI number or name against the public
[NPPES NPI Registry](https://npiregistry.cms.hhs.gov/api-page), shows name,
credentials, state, and primary specialty, and keeps a history of every
search performed (including failed ones).

## Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Express 5, TypeScript
- **Database**: PostgreSQL via Prisma ORM
- Monorepo managed with pnpm workspaces:

```
apps/
  web/   Next.js frontend - search page + history page
  api/   Express backend - /api/lookups (search + history), Prisma + Postgres
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

This creates the `Lookup` table defined in `apps/api/prisma/schema.prisma`.

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

## Design decisions

**Single `Lookup` table, no provider directory.** The brief asks to persist
every *search*, not to build a CRM of providers, so there's one table:
query, query type, status, result count, normalized result JSON, error
message, timestamp. No relations, no provider/verification tables - that
would be solving a problem the brief didn't ask for.

**NPI checksum validated before calling NPPES.** NPPES only rejects numbers
that aren't 10 digits; it returns `result_count: 0` for a well-formed but
non-existent NPI *and* for a 10-digit number that fails the NPI check-digit
algorithm. Validating the checksum ourselves (`apps/api/src/lib/npi.ts`)
catches the "obviously typo'd NPI" case before spending an API call, and is
what lets the UI say "invalid NPI" instead of lumping it in with "no
results" - that distinction was explicit in the requirements.

**Errors are a value, not just a try/catch.** The NPPES API returns HTTP 200
for both malformed requests and zero results - the only signal is the shape
of the JSON body. `searchNppes()` returns a discriminated result instead of
throwing, and the route maps that to one of `SUCCESS`, `NOT_FOUND`,
`INVALID_QUERY`, or `API_ERROR`, all of which get persisted and rendered
differently. An 8-second `AbortController` timeout treats a slow/hanging
NPPES as `API_ERROR` rather than letting the request hang indefinitely.

**Normalized results, not the raw NPPES payload.** Each NPPES record carries
addresses, identifiers, endpoints, etc. that the UI never shows. The backend
extracts just `{ npi, name, credential, state, primaryTaxonomy }` before
persisting, so what's stored matches what's displayed - one less place for
the two to drift apart.

**Free-text name parsing is a heuristic, not NLP.** A single input box has
to become `first_name`/`last_name` for NPPES. The rule is: the last
whitespace-separated token is the surname, everything before it is the
first name; a single word is treated as a surname-only search. This covers
the common "First Last" case and is honest about not handling suffixes,
multi-word surnames, or organization name search - those were consciously
skipped given the time box.

**What I'd build next:** pagination on the history view (currently capped
at the 50 most recent rows), a loading skeleton instead of a button label
swap, surfacing the *other* (non-primary) taxonomies when a provider has
more than one, and a basic integration test for the NPI checksum and the
three error-path branches in the lookups route.

### If this had to handle 50,000 lookups/day

Average load is small (~35/min), so raw throughput isn't the issue - the
two real changes would be **caching** and **moving persistence off the
request path**. Provider directory data barely changes day to day, so a
cache (Redis, or even a `nppes_cache` table keyed by NPI/name with a TTL)
in front of `searchNppes()` would eliminate the majority of outbound calls
to a third-party API we don't control and that has no published SLA - it
also protects us if NPPES rate-limits or has an outage. Second, writing the
`Lookup` row is on the critical path today; at this volume I'd write the
search result to the response immediately and persist asynchronously
(a queue, or at minimum `prisma.lookup.create()` fired without awaiting it
inside the request), so a slow database write never adds latency to a
search. I'd also switch the history endpoint from `take: 50` to cursor-based
pagination, since "last 50 of an unbounded table" stops being free once
the table has millions of rows, and put a connection pooler (PgBouncer or
Prisma's pool tuning) in front of Postgres rather than assuming the schema
itself needs to change - it's a single narrow table with one index, so the
database isn't the bottleneck, the access pattern around it is.
