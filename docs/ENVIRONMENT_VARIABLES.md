# Environment Variables

This document explains the runtime environment variables used by `OnlyClaw` based on the current app behavior.

For example values, see `.env.example`.

## Core Runtime

### `APP_ENV`

Allowed values:

- `development`
- `staging`
- `production`

Purpose:

- identifies the deployment environment for operational checks and structured logging

Notes:

- defaults to `development` when `NODE_ENV` is not `production`
- defaults to `production` when `NODE_ENV=production`

Recommended values:

- local: `development`
- staging: `staging`
- production: `production`

### `NODE_ENV`

Allowed values:

- `development`
- `test`
- `production`

Purpose:

- controls Next.js runtime mode and some app safety defaults

Recommended values:

- local: `development`
- staging: `production`
- production: `production`

## Database

### `DATABASE_URL`

Required:

- yes

Purpose:

- PostgreSQL connection string used by Prisma

Operational notes:

- use a separate database per environment
- treat this as a secret

## Logging

### `LOG_LEVEL`

Allowed values:

- `debug`
- `info`
- `warn`
- `error`

Purpose:

- controls which structured logs are emitted

Defaults:

- `debug` in development
- `info` otherwise

Recommended values:

- local: `debug`
- staging: `info`
- production: `info` or `warn`, depending on platform logging volume requirements

## Authentication

### `NEXT_PUBLIC_SUPABASE_URL`

Required:

- yes

Purpose:

- points the app at the correct Supabase project

Operational notes:

- required in every environment
- must match the project that owns both Supabase Auth and the Postgres instance used by Prisma

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Required:

- yes

Purpose:

- allows the app to perform browser and request-scoped Supabase Auth operations

Operational notes:

- required in every environment
- safe to expose to the browser
- still must be scoped to the correct Supabase project and environment

### `SUPABASE_SERVICE_ROLE_KEY`

Required:

- yes

Purpose:

- allows trusted server-side workflows such as provisioning auth users during signup

Operational notes:

- required in every environment
- server-only secret, never expose it to the browser
- use a separate value per environment

## Demo And Local Development Controls

### `ALLOW_DEMO_AUTH`

Required:

- no

Purpose:

- legacy local-development shortcut for auto-selecting a demo viewer without signing in

Operational notes:

- must be disabled in production
- should normally be disabled in staging

### `DEMO_VIEWER_EMAIL`

Required:

- required only when `ALLOW_DEMO_AUTH=true`

Purpose:

- identifies the demo user account used for local authenticated flows

### `DEMO_VIEWER_ROLE`

Allowed values:

- `FAN`
- `CREATOR`
- `ADMIN`

Required:

- no

Purpose:

- optionally constrains the selected demo viewer role

### `ALLOW_DEMO_DATA_FALLBACK`

Required:

- no

Purpose:

- allows some server data loaders to fall back to demo data when real data access fails

Operational notes:

- must be disabled in production
- should normally be disabled in staging so staging exercises real data paths

## Media Protection

### `MEDIA_SIGNING_SECRET`

Required:

- yes

Purpose:

- signs and verifies protected media URLs

Operational notes:

- build and runtime should fail closed if this is missing
- use a long random secret
- do not reuse between staging and production

### `ALLOWED_MEDIA_HOSTS`

Required:

- optional in development
- strongly recommended in staging
- expected in production

Purpose:

- allowlist of approved upstream media hostnames

Format:

- comma-separated hostnames

Example:

```env
ALLOWED_MEDIA_HOSTS="images.example.com,cdn.example.com"
```

Operational notes:

- production media proxying should not run with an empty allowlist

## Billing

### `BILLING_PROVIDER`

Required:

- optional in development
- required when enabling live billing outside development

Purpose:

- selects the billing provider adapter

Defaults:

- `mock` in local development when not set

Operational notes:

- `mock` is allowed in `staging` for simulated beta purchases
- `mock` is not allowed in `production`
- if no real provider is configured, billing should remain intentionally unavailable

### `BILLING_PROVIDER_WEBHOOK_SECRET`

Required:

- required when billing webhooks are enabled

Purpose:

- verifies incoming billing webhook signatures

Operational notes:

- treat as a secret
- use separate values per environment

### `BILLING_RECONCILIATION_BATCH_SIZE`

Required:

- no

Purpose:

- controls how many pending billing transactions are processed in one reconciliation run

Operational notes:

- this is only relevant once a real reconciliation process exists outside the request path

### `WEBHOOK_SIGNATURE_TOLERANCE_SECONDS`

Required:

- no

Purpose:

- allowed clock skew window for webhook signature validation

Default:

- `300`

## Recommended Environment Profiles

### Local development

```env
APP_ENV="development"
NODE_ENV="development"
LOG_LEVEL="debug"
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?schema=public"
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="replace-with-your-local-anon-key"
SUPABASE_SERVICE_ROLE_KEY="replace-with-your-local-service-role-key"
ALLOW_DEMO_AUTH="false"
ALLOW_DEMO_DATA_FALLBACK="true"
BILLING_PROVIDER="mock"
```

### Staging

```env
APP_ENV="staging"
NODE_ENV="production"
LOG_LEVEL="info"
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?schema=public"
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="replace-with-staging-anon-key"
SUPABASE_SERVICE_ROLE_KEY="replace-with-staging-service-role-key"
ALLOW_DEMO_AUTH="false"
ALLOW_DEMO_DATA_FALLBACK="false"
MEDIA_SIGNING_SECRET="replace-with-staging-secret"
BILLING_PROVIDER="mock"
BILLING_PROVIDER_WEBHOOK_SECRET="replace-with-a-staging-webhook-secret"
```

### Production

```env
APP_ENV="production"
NODE_ENV="production"
LOG_LEVEL="info"
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?schema=public"
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="replace-with-production-anon-key"
SUPABASE_SERVICE_ROLE_KEY="replace-with-production-service-role-key"
ALLOW_DEMO_AUTH="false"
ALLOW_DEMO_DATA_FALLBACK="false"
MEDIA_SIGNING_SECRET="replace-with-production-secret"
BILLING_PROVIDER="replace-with-a-real-provider"
BILLING_PROVIDER_WEBHOOK_SECRET="replace-with-a-production-webhook-secret"
```

## Launch Notes

For a limited beta without live billing:

- production must still keep `ALLOW_DEMO_AUTH="false"` and `ALLOW_DEMO_DATA_FALLBACK="false"`
- production must not use `BILLING_PROVIDER="mock"`
- staging may use `BILLING_PROVIDER="mock"` only for simulated purchase validation
- treat `docs/BETA_LAUNCH_RUNBOOK.md` and `docs/LAUNCH_CHECKLIST.md` as the operational source of truth for final go-live checks
