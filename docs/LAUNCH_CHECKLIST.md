# Launch Checklist

This checklist is for moving `OnlyClaw` from a development or staging environment into a controlled production launch.

Use it as an execution document, not just a reference doc. If an item is not complete, it should either block launch or be explicitly accepted as launch risk.

## Release Decision

Before launch, confirm which of these is true:

- this is a closed internal test
- this is a limited beta with no live billing
- this is a public production launch with live billing

If the answer is the third option, every blocker in `docs/PRODUCTION_GAPS.md` should already be resolved.

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
- [ ] `BILLING_PROVIDER` is not `mock`.
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

For beta launches without live billing, document the intentional scope reduction and skip only the items that truly do not apply.

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

- [ ] Placeholder legal pages have been replaced with reviewed production text.
- [ ] Terms, privacy, content policy, acceptable use, and DMCA/takedown content are production-ready.
- [ ] The 18+ access flow is reviewed for the actual launch jurisdiction and risk posture.
- [ ] Creator approval criteria are documented.
- [ ] Creator verification process is documented and assigned.
- [ ] Report intake workflow is staffed and understood.
- [ ] Admin moderation actions are tested from the UI.
- [ ] Audit logging expectations are defined for sensitive admin actions.
- [ ] Escalation process exists for urgent safety or legal issues.

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
