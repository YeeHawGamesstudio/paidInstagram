# Production Gaps

This document lists the major gaps between the current repository state and a safer real-world production launch for `OnlyClaw`.

It is written from the current codebase, not from an aspirational roadmap. Some areas are already scaffolded well, but scaffolding is not the same thing as production readiness.

## Summary

The app already has a solid product shell:

- role-based route separation
- Supabase-backed auth
- Prisma-backed data model
- protected media access
- moderation and admin surfaces
- structured logging and a health endpoint
- environment guardrails that fail closed on unsafe config

The largest launch gaps are not basic UI gaps. They are production systems gaps:

- real billing
- real compliance and legal readiness
- production-grade infrastructure and monitoring
- distributed abuse controls and background processing

## Launch Blockers

These should be treated as blockers before a public paid launch.

### 1. Live Billing Is Not Implemented

Current state:

- the billing system has a good provider abstraction
- the only registered provider is `mock`
- non-development environments are prevented from using `mock`
- unconfigured production billing fails closed

Gap:

- there is no real billing adapter registered in `src/lib/billing/registry.ts`
- no live checkout, payment intent, refund, dispute, or provider-specific webhook mapping exists yet

Why it matters:

- subscriptions and locked-message purchases cannot be launched safely without a real payment provider
- operational flows like failed payment recovery and dispute handling remain incomplete

Minimum production work:

- implement a real `BillingProviderAdapter`
- register it in the provider registry
- wire provider secrets and webhook verification
- validate subscription purchase, message unlock purchase, cancellation, refunds, and webhook replay handling

### 2. Compliance And Legal Surfaces Are Still Placeholder Content

Current state:

- public legal routes exist
- the 18+ gate exists
- creator approval and moderation scaffolding exists

Gap:

- policy pages explicitly describe themselves as placeholders
- DMCA handling is not a finalized notice-and-action workflow
- the current 18+ gate is self-attestation only

Why it matters:

- this product category needs counsel-reviewed legal language and operational policy alignment
- placeholder policy pages should not be treated as sufficient launch coverage

Minimum production work:

- replace placeholder policy content with reviewed legal text
- define real notice, takedown, and appeals workflows
- align product behavior, moderation operations, and published policy language

### 3. Age Verification And Creator Verification Are Not Production-Complete

Current state:

- adult access status and creator verification fields exist in the schema
- the app has an adult-access acknowledgment gate
- admin and creator approval surfaces exist

Gap:

- the public gate is not identity verification or age verification
- the repo does not include an integrated KYC or creator verification pipeline
- there is no strong enforcement workflow for jurisdiction-specific age or recordkeeping requirements

Why it matters:

- an adult-content platform cannot rely on a simple cookie acknowledgment as its primary control
- creator onboarding and compliance exposure are high-risk launch areas

Minimum production work:

- choose and integrate a real verification process for creators
- define the user-side age and eligibility standard required for launch jurisdictions
- document review ownership, exception handling, and audit retention

### 4. Production Operations Infrastructure Is Assumed, Not Delivered

Current state:

- the app exposes logs and `GET /api/health`
- deployment and operations docs describe expected infrastructure

Gap:

- the repository does not provision managed infrastructure
- monitoring, alerting, secret management, backup policy, restore drills, and centralized log retention all depend on external setup

Why it matters:

- a production app is not launchable on app code alone
- incident response, data recovery, and secret handling must exist before customer traffic

Minimum production work:

- set up environment-specific hosting and secret management
- connect `/api/health` to monitoring and paging
- enable structured log collection and retention
- define database backup and restore ownership

## High-Priority Gaps

These may not block a tightly controlled soft launch if deliberately constrained, but they should be considered very near-term work.

### 5. Rate Limiting Is In-Memory And Per Instance

Current state:

- billing and moderation-sensitive flows use an in-memory rate limiter

Gap:

- limits do not coordinate across multiple instances
- protection resets on process restarts

Why it matters:

- abuse controls weaken immediately in a horizontally scaled deployment
- webhook endpoints and purchase actions deserve stronger protections

Recommended next step:

- move rate limiting to a shared backend such as Redis or an edge gateway control

### 6. No Background Worker Or Scheduled Reconciliation Layer

Current state:

- billing service supports reconciliation concepts
- webhook processing exists

Gap:

- no queue, cron runner, or worker process is included to reconcile pending transactions or perform periodic sweeps

Why it matters:

- payment lifecycle recovery should not depend only on request-time actions
- pending states can become stranded without a background process

Recommended next step:

- add a scheduled reconciliation runner and operational alerting for stuck billing states

### 7. Health Checks Are Lightweight

Current state:

- `GET /api/health` verifies database access and environment safety assumptions

Gap:

- it does not deeply probe every dependency
- it is not a synthetic transaction or end-to-end readiness test

Why it matters:

- an app can be "healthy" by this endpoint while still failing in billing, media delivery, or auth edge cases

Recommended next step:

- keep the current health endpoint, but add deeper staging smoke tests and platform-level monitors

### 8. External Error Reporting Is Not Wired

Current state:

- structured logs and request IDs exist

Gap:

- there is no external error aggregation or alerting service configured in the repo

Why it matters:

- logs help after the fact, but real production needs proactive visibility into crashes and recurring failures

Recommended next step:

- integrate an error monitoring platform and include request IDs in event metadata

## Medium-Priority Gaps

These are important, but they can follow immediately after an initial controlled launch if the launch scope is narrow and the higher-risk items are already solved.

### 9. Media Pipeline Ownership Is External

Current state:

- protected media access and host allowlisting are implemented

Gap:

- the repository does not define upload processing, storage lifecycle management, antivirus scanning, transcoding, or retention enforcement

Why it matters:

- media handling is a major operational and abuse surface for creator platforms

### 10. Admin Provisioning And Internal Process Hardening Need Definition

Current state:

- admin routes and admin actions exist
- the signup flow states that admin accounts are provisioned manually

Gap:

- the repo does not define a hardened admin provisioning workflow, approval SOPs, or incident escalation process

Why it matters:

- operational controls are only as good as the team process around them

### 11. Staging Validation Still Depends On Manual Discipline

Current state:

- environment variables and readiness checks enforce several important safety rules

Gap:

- there is no CI or release automation in this repo that guarantees migration checks, smoke tests, or staging signoff before promotion

Why it matters:

- manual production promotion is error-prone, especially for a platform with auth, media, and billing dependencies

## Suggested Launch Bar

Treat the following as the minimum bar for a public paid launch:

1. real billing adapter implemented and validated
2. placeholder legal pages replaced with approved production content
3. creator verification and age/compliance approach formally defined
4. production infrastructure, monitoring, backups, and secret handling operational
5. shared rate limiting and at least one background reconciliation path in place

## Notable Strengths Already Present

The repo is not starting from zero. It already has several good production-minded patterns:

- explicit environment safety validation
- clean role-based route boundaries
- provider-based billing design instead of hardcoding one processor into UI code
- request correlation support
- admin-facing readiness visibility
- moderation and audit concepts already represented in the data model

That means the next phase is less about redesigning the product and more about finishing the operational and regulatory parts around it.
