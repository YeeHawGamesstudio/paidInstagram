# Launch Checklist

This checklist is for moving `OnlyClaw` from a development or staging environment into a controlled production launch.

Use it as an execution document, not just a reference doc. If an item is not complete, it should either block launch or be explicitly accepted as launch risk.

## Release Decision

Before launch, confirm which of these is true:

- this is a closed internal test
- this is a limited beta with no live billing
- this is a public production launch with live billing

If the answer is the third option, every blocker in `docs/PRODUCTION_GAPS.md` should already be resolved.

Primary limited-beta execution document: `docs/BETA_LAUNCH_RUNBOOK.md`

Primary beta blocker reference: `docs/BETA_BLOCKERS_AND_RISKS.md`

## Ownership And Signoff

- [ ] Launch owner is named.
- [ ] Engineering owner is named.
- [ ] Moderation owner is named.
- [ ] Backup moderator is named.
- [ ] Support owner is named.
- [ ] Rollback owner is named.
- [ ] Database backup owner is named.
- [ ] Legal or policy escalation owner is named.
- [ ] Any unchecked item below is either scheduled before launch or explicitly accepted as beta risk by the launch owner.

## Environment And Infrastructure

- [ ] Production hosting environment exists and is isolated from development and staging.
- [ ] Production database is separate from all non-production databases.
- [ ] Production Supabase project is separate from all non-production projects.
- [ ] Runtime secrets are stored in a production-safe secret manager.
- [ ] `APP_ENV=production` and `NODE_ENV=production` are set in the deployed environment.
- [ ] `DATABASE_URL` points to the correct production Postgres instance.
- [ ] `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` point to the correct production Supabase project.
- [ ] `MEDIA_SIGNING_SECRET` is unique to production.
- [ ] `ALLOWED_MEDIA_HOSTS` is set to real approved media origins.
- [ ] Structured stdout and stderr logs are collected by the hosting platform.
- [ ] `GET /api/health` is connected to uptime monitoring and alerting.
- [ ] Database backups are enabled and owned by a named operator or team.
- [ ] A restore drill has been completed against a non-production environment.

## Environment Safety

- [ ] `ALLOW_DEMO_AUTH=false`.
- [ ] `ALLOW_DEMO_DATA_FALLBACK=false`.
- [ ] For staging beta, `BILLING_PROVIDER=mock` is used only for simulated purchases.
- [ ] For production launch, `BILLING_PROVIDER` is not `mock`.
- [ ] `BILLING_PROVIDER_WEBHOOK_SECRET` is set and unique to production.
- [ ] Production secrets are different from development and staging secrets.
- [ ] The app builds successfully with the production environment configuration.
- [ ] The app starts successfully with the production environment configuration.

## Database And Schema

- [ ] Prisma client has been regenerated for the target schema.
- [ ] Production schema is up to date before traffic is cut over.
- [ ] Seed data strategy is understood and does not accidentally inject development/demo data into production.
- [ ] Unique constraints and required relational records have been validated on real production-like data.
- [ ] Rollback expectations for schema and application compatibility have been documented.

## Authentication And Access

- [ ] Fan signup works in the production environment.
- [ ] Fan login works in the production environment.
- [ ] Supabase redirect URLs and allowed origins are configured correctly.
- [ ] Creator signup works in the production environment.
- [ ] Newly registered creators land in the pending-access flow until approved.
- [ ] Approved creators can access `/creator`.
- [ ] Admin accounts are provisioned manually through a controlled process.
- [ ] Non-admin users cannot access `/admin`.
- [ ] Route protection is verified for public, fan, creator, and admin sections.

## Billing

For beta launches without live billing, document the intentional scope reduction. Simulated purchases in staging can still be exercised with the `mock` provider, but they do not satisfy public paid-launch readiness.

- [ ] A real billing provider adapter is implemented and registered.
- [ ] Provider API credentials are set in production.
- [ ] Provider webhook endpoint is configured against the production deployment.
- [ ] Webhook signature verification succeeds with production secrets.
- [ ] Subscription purchase flow succeeds end to end.
- [ ] Locked-message purchase flow succeeds end to end.
- [ ] Subscription cancellation flow succeeds end to end.
- [ ] Failed payment behavior has been tested.
- [ ] Refund and dispute handling behavior is defined.
- [ ] Pending transaction reconciliation has an operational plan.
- [ ] Billing support runbooks exist for payment failures, webhook failures, and customer disputes.

## Media And Content Access

- [ ] Public media renders correctly.
- [ ] Subscriber-only media requires an active subscription.
- [ ] Locked message content requires purchase or proper participant access.
- [ ] Expired or invalid media signatures are rejected.
- [ ] Production media origins are included in `ALLOWED_MEDIA_HOSTS`.
- [ ] Media storage ownership, retention, and recovery procedures are documented.

## Moderation And Compliance

- Reference runbook: `docs/ADMIN_OPERATIONS_RUNBOOK.md`

- [ ] Placeholder legal pages have been replaced with reviewed production text.
- [ ] Terms, privacy, content policy, acceptable use, and DMCA/takedown content are production-ready.
- [ ] The 18+ access flow is reviewed for the actual launch jurisdiction and risk posture.
- [ ] Creator approval criteria are documented.
- [ ] Creator verification process is documented and assigned.
- [ ] Report intake workflow is staffed and understood.
- [ ] Admin moderation actions are tested from the UI.
- [ ] Audit logging expectations are defined for sensitive admin actions.
- [ ] Escalation process exists for urgent safety or legal issues.
- [ ] Named owners are assigned for launch, moderation, engineering, and legal/policy escalation.
- [ ] Admin account provisioning uses a controlled manual process with a second approver.
- [ ] Shift handoff process exists for unresolved moderation work during beta coverage.

## Abuse Prevention And Security

- [ ] Shared production-grade rate limiting exists at the edge or in a shared backend.
- [ ] Security headers are present in production responses.
- [ ] Secret rotation ownership is defined.
- [ ] Admin access is limited to intended operators only.
- [ ] Error logs do not expose secrets or unsafe internal data.
- [ ] Media origin restrictions are verified against production URLs.

## Observability And Support

- [ ] Support and engineering know how to use `x-request-id` for incident triage.
- [ ] A primary on-call or incident owner is defined for launch.
- [ ] Dashboard or query views exist for application logs.
- [ ] Alert routing is configured for health failures and critical app incidents.
- [ ] A support workflow exists for auth failures, billing issues, and moderation escalations.
- [ ] Admin users know to check `/admin` and `GET /api/health` first during incidents.

## Smoke Test Before Go-Live

Run this immediately before opening traffic:

- [ ] Load the public home page.
- [ ] Load `/discover`.
- [ ] Load a public creator page.
- [ ] Complete a fresh fan signup.
- [ ] Log in with an existing fan account.
- [ ] Verify fan access to `/fan`.
- [ ] Log in with an approved creator and verify access to `/creator`.
- [ ] Log in with an unapproved creator and verify redirect to `/creator-access`.
- [ ] Verify admin access to `/admin`.
- [ ] Call `GET /api/health` and confirm there are no failing checks.
- [ ] If billing is live, complete a real production-safe payment test.
- [ ] If protected media is live, verify both allowed and denied media access paths.

## Go-Live

- [ ] Launch owner explicitly signs off.
- [ ] Support team is notified that launch is starting.
- [ ] Monitoring dashboards are open during launch.
- [ ] Logs are actively watched during the initial traffic window.
- [ ] Rollback owner is identified before launch starts.

## First 24 Hours

- [ ] Review health endpoint status periodically.
- [ ] Review structured error and warning logs.
- [ ] Review billing webhook success and failure rates.
- [ ] Review auth failure trends.
- [ ] Review moderation reports and creator approval queue.
- [ ] Confirm backups completed as expected.
- [ ] Capture all launch issues in a post-launch follow-up list.

## Companion Docs

- `docs/PRODUCTION_GAPS.md`
- `docs/ARCHITECTURE.md`
- `docs/DEPLOYMENT.md`
- `docs/OPERATIONS.md`
- `docs/ENVIRONMENT_VARIABLES.md`
- `docs/BETA_LAUNCH_RUNBOOK.md`
- `docs/ADMIN_OPERATIONS_RUNBOOK.md`

## Execution Status

1. Ownership And Signoff: in progress
   The named-owner structure now exists in the checklist and beta launch runbook, but real people still need to be assigned before launch.
2. Environment And Infrastructure: in progress
   The documentation now calls out the required isolation, secret handling, monitoring, backups, and restore drill expectations, but those external systems still need to be confirmed in the real deployment.
3. Environment Safety: in progress
   The app already fails closed on the biggest unsafe config paths, and the docs now reflect the limited-beta billing rules clearly, but target-environment validation still needs to be performed.
4. Database And Schema: in progress
   The checklist is defined, but production-like validation, rollback expectations, and final cutover discipline remain operational work.
5. Authentication And Access: in progress
   Role protection and admin provisioning rules are documented, but final target-environment verification is still outstanding.
6. Billing: pending
   This remains intentionally out of scope for the limited beta in production, aside from documenting the staging-only mock-billing path.
7. Media And Content Access: in progress
   The required checks and ownership expectations are documented, but production media validation and recovery ownership still need to be confirmed.
8. Moderation And Compliance: in progress
   Admin process, staffing, escalation, and audit-note expectations are now documented, and the public legal routes now read as current beta policy surfaces instead of placeholders, but owner signoff and broader legal/compliance review are still open.
9. Abuse Prevention And Security: pending
   The checklist is present, but shared production controls and final security ownership still need follow-through outside the repo.
10. Observability And Support: in progress
   The repo now has an explicit beta launch runbook and operating guidance around `/admin`, `/api/health`, logs, and `x-request-id`, but actual dashboards, alert routing, and on-call ownership still need to be configured.
11. Smoke Test Before Go-Live: in progress
   The required smoke-test sequence is documented clearly now, but it still needs to be run in the real target environment.
12. Go-Live: pending
   The launch window procedure and signoff expectations are now documented, but no live launch has been executed yet.
13. First 24 Hours: pending
   The first-day monitoring checklist is defined, but it is naturally blocked until the actual launch window.
