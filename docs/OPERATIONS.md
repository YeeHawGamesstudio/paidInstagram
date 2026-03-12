# Operations

This document is the application-level runbook for `OnlyClaw`.

It focuses on operating the app in production without pretending the repo already includes a full SRE platform. The codebase now exposes the minimum hooks needed to monitor, debug, and support the application more safely.

## What Exists In The App

- structured server logs emitted as JSON
- request correlation via the `x-request-id` header
- readiness endpoint at `GET /api/health`
- App Router error boundaries in `src/app/error.tsx` and `src/app/global-error.tsx`
- safer API error responses with stable error codes and request IDs
- admin-facing readiness status on `/admin`

## Primary Operational Signals

Monitor these first:

- `GET /api/health`
  Returns `200` for healthy or warning states and `503` for failing readiness checks.
- structured log events
  Important events include:
  - `app.startup`
  - `billing.webhook.received`
  - `billing.webhook.processed`
  - `billing.webhook.failed`
  - `media.request.denied`
  - `media.upstream.unavailable`
  - `media.upstream.invalid_content_type`
  - `media.request.failed`
  - `healthcheck.warn`
  - `healthcheck.failed`
- `x-request-id`
  Capture this from failed API responses and use it to correlate support reports with server logs.

## Health Endpoint

Use `GET /api/health` for uptime checks and quick readiness validation.

The endpoint currently checks:

- database connectivity
- environment-level readiness assumptions such as demo mode, billing mode, and media host allowlisting

It is intentionally lightweight. It does not deeply probe every external dependency.

## Support And Admin Workflow

When a user reports an operational failure:

1. Capture the `x-request-id` from the failing response if available.
2. Check `GET /api/health`.
3. Review structured logs for the matching request ID or event window.
4. Review `/admin` for readiness warnings and operational context.
5. If billing-related, inspect webhook and billing action logs first.
6. If media-related, inspect media denial and upstream failure logs first.

## Backup And Restore Assumptions

Backup and restore are infrastructure responsibilities, but the application assumes they exist.

- Database backups must be automated.
- Restore testing should happen regularly in a non-production environment.
- Billing records, moderation data, admin action history, and account state should be treated as operationally important data.
- Media storage retention and restore processes should stay aligned with database restore procedures so restored rows do not point to missing assets.

## Known Limits

- in-memory rate limiting is per instance and is not sufficient as the only production control in a multi-instance deployment
- there is no external error reporting service wired yet
- no background billing reconciliation runner is included yet
- the health endpoint is intentionally shallow, not a full synthetic test

## Minimum Readiness Checklist

Before calling the system production-ready, confirm:

1. `APP_ENV=production` and `NODE_ENV=production`
2. `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `MEDIA_SIGNING_SECRET` are set
3. demo auth and demo data fallback are disabled
4. `ALLOWED_MEDIA_HOSTS` is set for real media origins
5. billing is either intentionally unavailable or backed by a real provider
6. fan signup, fan login, and creator pending-access routing have been validated
7. logs and `/api/health` are connected to monitoring and alerting
8. database backup and restore ownership is defined
