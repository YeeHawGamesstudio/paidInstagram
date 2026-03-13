# Architecture

This document describes the current application architecture for `OnlyClaw` as it exists in this repository today.

It is intentionally practical. It explains what the codebase already implements, how the main subsystems fit together, and where the architecture still depends on external infrastructure or future product work.

## System Overview

`OnlyClaw` is a `Next.js` App Router application with server-rendered route groups for public browsing, fan experiences, creator tools, and admin operations.

Primary platform responsibilities in the app:

- public creator discovery and profile pages
- fan authentication, subscriptions, billing views, and messages
- creator publishing, pricing, subscribers, messages, and settings
- admin review, moderation, audit visibility, and operational readiness
- protected media delivery
- billing orchestration through a provider adapter boundary

Primary external dependencies:

- Supabase Auth for identity and session handling
- PostgreSQL accessed through Prisma
- hosting/runtime for `next build` and `next start`
- external media hosting or storage origins
- future live billing provider

## Runtime Stack

- framework: `Next.js 16` with the App Router
- UI: `React 19`
- styling: Tailwind CSS plus shared UI components
- validation: `zod`
- auth/session transport: `@supabase/ssr` and `@supabase/supabase-js`
- ORM and data access: `Prisma` with `@prisma/adapter-pg`

The app is designed to run as a server application rather than a static export. Protected areas are intentionally dynamic so authentication and database-backed state are evaluated at request time.

## Route Topology

The app is split into route groups that map directly to product surfaces:

- `(public)`
  Public landing, discovery, creator profile pages, authentication pages, report flow, and policy pages.
- `(fan)`
  Authenticated fan dashboard, subscriptions, billing history, account area, and conversations.
- `(creator)`
  Authenticated creator dashboard, posts, pricing, compliance, settings, subscribers, and creator messaging.
- `(admin)`
  Internal operations area for readiness, creator review, reports, audit, and user management.
- `api`
  Operational and integration endpoints such as health checks, billing webhooks, and media delivery.
- `actions`
  Server Actions for billing, moderation, and compliance flows.

This separation gives the app a clean product boundary:

- public routes can stay broadly accessible
- fan, creator, and admin routes are access-controlled at the layout level
- APIs remain focused on operational or integration workflows instead of page composition

## Authentication And Access Control

Authentication is handled through Supabase session cookies. The app reads the current auth user on the server and links that Supabase identity to an application-level `User` row.

The main access model is role-based:

- `FAN`
- `CREATOR`
- `ADMIN`

Creator access has an additional approval gate:

- creators can register and sign in
- creator routes remain blocked until their creator profile is approved
- unapproved creators are redirected to `/creator-access`

Access enforcement happens in two layers:

1. middleware
   Adds request IDs, refreshes Supabase session state, applies security headers, and enforces the adult-access gate for public adult-content entry points.
2. server-side route protection
   Layouts for fan, creator, and admin sections call role-aware access helpers before rendering protected content.

This means unauthorized users are redirected before protected route trees render.

## Data Layer

The app uses Prisma against PostgreSQL and models the product domain directly in the schema.

Core data groups:

- identity and user records: `User`, `Profile`, `Account`, `Session`
- creator operations: `CreatorProfile`, `CreatorApplication`
- audience and messaging: `Subscription`, `Conversation`, `Message`
- monetized content access: `MessageUnlock`, `Transaction`, `BillingEvent`
- publishing and media: `Post`, `MediaAsset`
- moderation and internal oversight: `Report`, `AdminActionLog`

Important domain characteristics:

- creator state is separate from approval and verification-oriented fields
- subscription access is lifecycle-aware, not just presence-based
- message unlocks are represented as explicit grants
- moderation actions and admin actions can be persisted for traceability

Prisma client creation is centralized and environment-aware. Local non-production execution reuses a global Prisma client to reduce development churn.

## Rendering And Data Flow

The application primarily uses server rendering and server data loading. The general request flow is:

1. request enters middleware
2. request ID and security headers are applied
3. Supabase session state is refreshed
4. route-level access checks run when needed
5. server components and server data helpers query Prisma
6. UI shells render the route group around the requested page

Mutating actions use Server Actions rather than pushing all changes through a separate API layer. This is how billing, moderation, and compliance acknowledgments are currently handled.

The result is a fairly direct architecture:

- reads happen mostly in server components and server-side helpers
- writes happen mostly through server actions and selected API routes
- domain logic is pushed into `src/lib` so page files remain composition-oriented

## Billing Architecture

Billing is intentionally provider-agnostic inside the application layer.

Key pieces:

- `src/lib/billing/provider.ts`
  Defines the adapter contract.
- `src/lib/billing/registry.ts`
  Resolves the active provider from environment configuration.
- `src/lib/billing/service.ts`
  Orchestrates subscription purchases, message unlock purchases, cancellations, webhook handling, and reconciliation.
- `src/lib/billing/repository.ts`
  Owns persistence and lifecycle updates.
- `src/app/actions/billing.ts`
  Exposes the purchase and cancellation flows to the UI.
- `src/app/api/billing/webhooks/[provider]/route.ts`
  Generic webhook entry point.

Current provider state:

- local development can use the `mock` provider
- non-development environments are prevented from using `mock`
- if no real provider is registered, billing fails closed through the `unconfigured` provider

This is good launch discipline, but it also means live billing is not ready until a real adapter is implemented and registered.

## Media Protection

Protected media is served through `GET /api/media/[assetId]`.

The media subsystem combines:

- signed access URLs
- per-asset authorization checks
- role-aware checks for public, subscriber-only, and message-locked assets
- optional host allowlisting through `ALLOWED_MEDIA_HOSTS`

Behaviorally:

- public assets can flow without subscription checks
- protected assets require a valid signature
- subscriber-only assets require active subscription access
- message assets are limited to the relevant conversation participants or admins

The application does not own a full storage pipeline in this repository. It assumes media files exist at approved upstream origins and are safe to proxy or redirect against.

## Moderation And Admin Operations

The admin area is more than a placeholder shell. It includes working surfaces for:

- creator review
- report intake and report status updates
- creator suspension and restoration
- user suspension and restoration
- audit visibility
- operational readiness visibility

Moderation logic lives in `src/lib/moderation/service.ts`, while admin audit logging is separated into dedicated helper code.

This gives the app an internal control plane, even though some policy and compliance workflows are still scaffolded rather than legally complete.

## Compliance And Policy Surface

The codebase includes a visible compliance shell:

- 18+ gate
- policy pages
- DMCA placeholder page
- creator approval and verification state fields
- adult-access status fields

However, the legal and compliance implementation is intentionally incomplete today:

- policy text is placeholder content
- the adult gate is self-attestation, not true age verification
- the repository does not represent a finalized KYC, identity, or regulatory workflow

Architecturally, this means the UI and data model have room for future compliance expansion, but compliance should not be treated as finished simply because the routes exist.

## Observability And Operations

The app has a lightweight internal observability layer:

- structured logs
- request correlation via `x-request-id`
- `GET /api/health`
- admin dashboard visibility into readiness checks
- route-level error boundaries

Current health checks cover:

- database connectivity
- environment safety assumptions such as demo mode, media allowlisting, and billing mode

This is enough for basic deploy safety and support triage, but not a full production operations platform.

## Deployment Shape

The repository expects a standard Node-hosted Next.js deployment flow:

```bash
npm install
npm run build
npm run start
```

Required environment foundations:

- isolated database per environment
- Supabase project per environment
- environment-specific secrets
- monitoring and alerting around `/api/health`
- log collection from stdout and stderr

The environment loader deliberately fails closed when unsafe launch settings are detected, such as demo auth outside development or mock billing outside development.

## Architectural Strengths

- clear separation between public, fan, creator, and admin route groups
- server-side access control at layout boundaries
- explicit environment safety checks
- provider boundary around billing
- explicit protected media access path
- moderation and audit concepts already exist in the domain model
- operational readiness is visible both through an API and the admin UI

## Current Architectural Limits

- no live billing adapter is implemented yet
- no queue, worker, or cron-based background processing layer is included
- rate limiting is in-memory and per instance
- health checks are intentionally shallow
- compliance pages are placeholders, not final legal deliverables
- adult access is self-attested, not verified
- the repository assumes external media storage and broader infrastructure ownership

## Recommended Companion Docs

- `docs/PRODUCTION_GAPS.md`
- `docs/LAUNCH_CHECKLIST.md`
- `docs/DEPLOYMENT.md`
- `docs/OPERATIONS.md`
- `docs/ENVIRONMENT_VARIABLES.md`
