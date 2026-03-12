# Deployment

This document describes the expected deployment shape for `OnlyClaw`.

The app is a `Next.js` App Router application that runs with `next build` and `next start`. The repository does not define a full infrastructure stack, so this document records the assumptions required to deploy it safely.

## Deployment Model

- application runtime: Next.js server
- data store: Supabase Postgres accessed through Prisma
- auth provider: Supabase Auth
- app health surface: `GET /api/health`
- app logs: structured JSON to stdout and stderr
- protected route groups: `fan`, `creator`, and `admin` are server-rendered on demand

Protected app sections are intentionally dynamic so production builds do not attempt to prerender authenticated pages.

## Environment Separation

Use separate infrastructure for:

- development
- staging
- production

That separation should include:

- database instances
- environment variables and secrets
- media origins or buckets
- billing credentials and webhook endpoints
- monitoring and alert routing

`APP_ENV` should identify the environment as `development`, `staging`, or `production`.

`NODE_ENV` should be:

- `development` locally
- `production` in staging
- `production` in production

## Pre-Deploy Requirements

Before deploying, confirm:

1. required environment variables are present
2. `DATABASE_URL` is set in the target environment before the build starts
3. `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` are set
4. `MEDIA_SIGNING_SECRET` is set
5. staging and production do not enable demo auth
6. staging and production do not enable demo data fallback
7. production does not use the mock billing provider
8. database schema is up to date
9. `/api/health` is monitored by the hosting platform

## Build And Start

Use the standard flow:

```bash
npm install
npm run build
npm run start
```

The build now fails closed on missing critical configuration instead of silently starting with unsafe defaults.

## Post-Deploy Validation

After deployment:

1. call `GET /api/health`
2. confirm the readiness payload has no failing checks
3. confirm structured logs are being collected by the hosting platform
4. load a public page
5. verify fan signup and login succeed
6. verify a creator account can sign in but is redirected to the pending-access page until approved
7. load a protected route and verify it behaves correctly for authenticated access
8. if billing is enabled, verify webhook delivery and logging in the target environment

## Rollback And Recovery Notes

This repo does not implement automated rollback logic.

Operationally, rollback should include:

- reverting the application release
- validating database compatibility before rollback
- confirming `/api/health` after rollback
- reviewing logs for recurring startup or dependency failures

If a database restore is ever required, ensure media storage and database state remain aligned.

## Infrastructure Still Required Around The App

The app is more deployable than before, but production still requires external systems:

- managed PostgreSQL
- Supabase Auth configuration and redirect URL allowlists
- secret management
- an approval workflow for creator applications
- centralized log retention
- uptime checks and alerting
- ingress or edge rate limiting
- scheduled database backups and restore testing
- a real billing provider integration before live payments are turned on
