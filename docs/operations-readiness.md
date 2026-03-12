# Operations Readiness

This document covers the application-level production assumptions for `OnlyClaw`. It does not define a full SRE platform, but it does describe what the app now exposes for safer production operation and what infrastructure still needs to exist around it.

## What the app now provides

- structured server logs with event names, timestamps, environment, and optional request IDs
- request correlation through the `x-request-id` header on middleware and API responses
- a lightweight readiness endpoint at `GET /api/health` with database and environment checks
- React App Router error boundaries through `src/app/error.tsx` and `src/app/global-error.tsx`
- better server-route error responses with stable error codes and request IDs
- admin-facing readiness visibility on `/admin`

## Environment assumptions

Use separate infrastructure, secrets, and databases for each environment.

- `APP_ENV=development`
  Use local developer infrastructure, demo auth, demo data fallback, and mock billing if needed.
- `APP_ENV=staging`
  Keep `NODE_ENV=production`, but point at isolated staging infrastructure. Disable demo auth and demo data fallback unless a specific test requires them.
- `APP_ENV=production`
  Use production-only secrets and infrastructure. Demo auth and demo data fallback must remain disabled. Billing must not use the mock provider.

`NODE_ENV` should stay aligned with the runtime (`development` locally, `production` for staging and production deploys). `APP_ENV` exists so staging can behave like production without pretending to be the live environment.

## Monitoring hooks

Monitor these signals first:

- `GET /api/health`
  Expect `200` for healthy or warning states and `503` for failing readiness checks.
- structured log events
  Key events include `app.startup`, `billing.webhook.received`, `billing.webhook.processed`, `billing.webhook.failed`, `media.request.denied`, `media.upstream.unavailable`, `media.upstream.invalid_content_type`, `media.request.failed`, `healthcheck.warn`, and `healthcheck.failed`.
- request IDs
  Support and engineering should capture the `x-request-id` value from failed API responses when investigating incidents.

## Required surrounding infrastructure

The application is more production-friendly now, but production still requires external infrastructure:

- a managed PostgreSQL database with automated backups and restore validation
- deployment-level log shipping or collection so structured stdout/stderr logs are retained
- uptime and alerting on `GET /api/health`
- ingress or edge rate limiting for public endpoints
- secret management for runtime environment variables
- a real billing adapter before live billing is enabled

## Backup and restore expectations

Backup and restore are infrastructure responsibilities, but the app assumes they exist.

- Run automated database backups on a schedule appropriate to the business.
- Test restore procedures regularly in a non-production environment.
- Treat billing tables, moderation data, and admin action history as operationally important data.
- Keep media storage retention and restore plans aligned with database restore strategy so references do not recover without the underlying assets.

## Known limitations

- webhook and purchase rate limiting is currently in-memory per instance, so it is not sufficient as the only control for horizontally scaled production
- there is no external error reporting integration yet
- no background reconciliation worker is included for billing; a cron or queue-based runner is still required for full live billing operations
- health checks are intentionally lightweight and do not probe every third-party dependency

## Minimum production checklist

Before calling the app production-ready, confirm:

1. `APP_ENV=production` and `NODE_ENV=production`
2. demo auth and demo data fallback are disabled
3. `ALLOWED_MEDIA_HOSTS` is set for real media origins
4. a real billing provider is configured, or billing remains intentionally unavailable
5. database backups and restore drills are owned by the hosting team
6. logs and `/api/health` are connected to monitoring and alerting
