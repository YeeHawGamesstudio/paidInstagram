# Beta Launch Runbook

This runbook is for launching `OnlyClaw` as a limited beta without live billing.

It turns the broader launch and operations docs into a concrete execution flow for the first real deployment window. Use it together with:

- `docs/LAUNCH_CHECKLIST.md`
- `docs/BETA_BLOCKERS_AND_RISKS.md`
- `docs/OPERATIONS.md`
- `docs/DEPLOYMENT.md`
- `docs/ADMIN_OPERATIONS_RUNBOOK.md`

## Beta Scope

This runbook assumes:

- production beta is controlled and intentionally limited
- live billing is still off
- staging may use `BILLING_PROVIDER=mock` for simulated purchases
- production must not use the `mock` billing provider

If launch scope changes to a public paid launch, stop using this document as the primary launch procedure and treat the billing and legal blockers in `docs/PRODUCTION_GAPS.md` as hard blockers.

## Named Owners

Assign real names before launch:

- launch owner:
- engineering owner:
- moderation owner:
- backup moderator:
- support owner:
- rollback owner:
- database backup owner:
- legal or policy escalation owner:

Do not begin the launch window until every slot is assigned.

## Preflight

Complete this before the launch day window starts.

### Environment and hosting

- confirm production hosting is isolated from development and staging
- confirm production database and Supabase project are separate from non-production systems
- confirm production secrets are stored in the intended secret manager
- confirm `APP_ENV=production` and `NODE_ENV=production`
- confirm `ALLOW_DEMO_AUTH=false`
- confirm `ALLOW_DEMO_DATA_FALLBACK=false`
- confirm `MEDIA_SIGNING_SECRET` is unique to production
- confirm `ALLOWED_MEDIA_HOSTS` is set to real approved media origins
- confirm `BILLING_PROVIDER` is not `mock` in production

### Monitoring and recovery

- connect `GET /api/health` to uptime monitoring
- confirm alert routing reaches the launch owner or engineering owner
- confirm structured stdout and stderr logs are retained by the hosting platform
- confirm database backups are enabled
- confirm a restore drill has already been completed in a non-production environment
- confirm rollback ownership and communication path

### Access and moderation

- confirm fan login and signup work in the target environment
- confirm creator pending-access routing works in the target environment
- confirm admin accounts are provisioned manually through the controlled process in `docs/ADMIN_OPERATIONS_RUNBOOK.md`
- confirm creator approval criteria and report coverage are staffed
- confirm the moderation owner knows the urgent escalation path

## Launch-Day Sequence

Use this order during the live launch window.

1. Confirm all named owners are available.
2. Open monitoring dashboards and log search.
3. Call `GET /api/health` and confirm there are no failing checks.
4. Run the smoke test in `docs/LAUNCH_CHECKLIST.md`.
5. If any smoke-test blocker appears, stop and either fix it or delay launch.
6. If the smoke test passes, the launch owner gives explicit go-ahead.
7. Open traffic to the planned beta audience.
8. Keep logs and health status under active review during the initial window.

## Smoke Test Focus

The minimum smoke test for limited beta is:

- load the public home page
- load `/discover`
- load a public creator page
- complete a fresh fan signup
- log in with an existing fan account and verify `/fan`
- log in with an approved creator and verify `/creator`
- log in with an unapproved creator and verify redirect to `/creator-access`
- log in with an admin account and verify `/admin`
- call `GET /api/health`
- if protected media is live, verify both allowed and denied paths

For staging only:

- exercise simulated purchase, unlock, and cancellation flows with `BILLING_PROVIDER=mock`

## Launch Window Monitoring

During the initial traffic window, watch:

- `GET /api/health`
- structured error and warning logs
- auth failures
- readiness warnings shown on `/admin`
- moderation reports and creator approval queue
- media denial and upstream failures if protected media is enabled

Use `x-request-id` to correlate support issues with logs.

## First 24 Hours

Repeat these checks during the first day:

1. Review health endpoint status periodically.
2. Review error and warning logs.
3. Review auth failure trends.
4. Review moderation reports and creator approval queue.
5. Confirm backups completed as expected.
6. Capture issues in a follow-up list with owner and priority.

If staging uses mock billing for validation, keep that testing isolated to staging and do not treat it as production billing readiness.

## Rollback Triggers

Rollback should be actively considered if any of these occur:

- `GET /api/health` returns failing checks that cannot be resolved quickly
- auth failures block sign-in for core roles
- admin access is broken for intended operators
- creator or fan route protection behaves incorrectly
- media access failures are widespread
- moderation or audit surfaces stop reflecting real state

## Rollback Procedure

1. Launch owner and engineering owner decide whether to halt or roll back.
2. Rollback owner reverts the application release.
3. Confirm database compatibility before any schema rollback decision.
4. Call `GET /api/health` after rollback.
5. Verify public, fan, creator, and admin access on the rolled-back build.
6. Capture the incident and follow-up actions in the launch issue log.

## Risk Acceptance

Any unchecked item in `docs/LAUNCH_CHECKLIST.md` must be one of two things:

- completed before launch
- explicitly accepted by the launch owner as a beta risk

Do not leave unresolved items in an ambiguous state.
