# Beta Blockers And Risks

This document separates what must be true before a limited beta launch from what can be intentionally deferred until a later public paid launch.

Use it with:

- `docs/LAUNCH_CHECKLIST.md`
- `docs/BETA_LAUNCH_RUNBOOK.md`
- `docs/PRODUCTION_GAPS.md`

## Beta Launch Blockers

These should be treated as blockers before opening a controlled production beta.

### 1. Environment isolation must be real

The beta must run on infrastructure that is separate from development and staging:

- production hosting must be isolated
- production database must be isolated
- production Supabase project must be isolated
- production secrets must be unique and stored safely

### 2. Unsafe runtime modes must stay off

These are non-negotiable for beta:

- `ALLOW_DEMO_AUTH=false`
- `ALLOW_DEMO_DATA_FALLBACK=false`
- `BILLING_PROVIDER` must not be `mock` in production
- `MEDIA_SIGNING_SECRET` must be unique to production
- `ALLOWED_MEDIA_HOSTS` must be configured for real media origins

### 3. Monitoring and recovery ownership must exist

Before beta:

- `GET /api/health` must be monitored
- structured logs must be retained
- alert routing must reach a real owner
- database backups must be enabled
- restore ownership must be assigned
- a restore drill must already have been completed in a non-production environment

### 4. Named operators must exist

The team must assign real people for:

- launch owner
- engineering owner
- moderation owner
- backup moderator
- support owner
- rollback owner
- database backup owner
- legal or policy escalation owner

### 5. Access and moderation paths must work

Before beta:

- fan login and signup must work in the target environment
- creator pending-access routing must work
- admin access must be limited to intended operators
- moderation and audit surfaces must reflect real data
- creator approval and report-handling coverage must be staffed

### 6. Beta legal pack still needs owner signoff

The public legal and compliance pages now describe the current beta rules and notices instead of presenting as obvious scaffolding.

Before launch, the current beta policy pack should still be reviewed and explicitly accepted by the launch owner and legal or policy escalation owner. The affected routes are:

- `/terms`
- `/privacy`
- `/content-policy`
- `/acceptable-use`
- `/adult-disclaimer`
- `/dmca`
- `/18-plus`
- `/cookies`

For a limited beta, the blocker is no longer "placeholder UI copy." The blocker is whether the team is willing to stand behind the current beta policy set for the planned audience and jurisdiction scope.

## Acceptable Beta Deferrals

These are important, but they can remain out of scope for the limited beta if they are explicitly documented and not presented as live capability.

### 1. Live billing

These can remain deferred for the limited beta:

- real billing provider adapter
- production webhook handling for live billing
- refunds and disputes
- reconciliation workflows for real payment states

### 2. Public paid-launch readiness

These are later-launch requirements, not limited-beta requirements:

- public paid subscriptions at full production readiness
- live locked-message purchases in production
- public financial support workflows

### 3. Stronger verification stack

These can remain later-launch work if the beta scope stays constrained:

- stronger age verification
- full creator KYC pipeline
- jurisdiction-specific compliance expansion
- counsel-reviewed final public legal pack

### 4. Platform hardening beyond beta minimum

These are still important, but they can follow immediately after a controlled beta if risk is accepted:

- shared distributed rate limiting
- external error monitoring platform
- background reconciliation workers
- broader media-pipeline ownership and automation

## How To Use This Document

When preparing the beta launch decision:

1. Treat every item in `Beta Launch Blockers` as a stop/go question.
2. Treat every item in `Acceptable Beta Deferrals` as something that must either stay hidden, stay disabled, or be honestly documented as out of scope.
3. Record any unresolved blocker as either completed, delayed launch work, or an explicit launch-owner risk decision.
