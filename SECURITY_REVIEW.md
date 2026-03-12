# Security Review

## Practical Audit Summary

This review focused on the server-side controls that matter most for an adult-content subscription platform:

- authentication and authorization boundaries
- role-based route protection
- subscriber-only post protection
- locked-message and paid-media protection
- billing webhook trust
- upload risk surface
- environment/secret handling
- admin route protection and auditability
- rate limiting
- CSRF/XSS and untrusted content handling

## Critical Vulnerabilities And Weak Points Found

### 1. Demo auth could silently bind privileged access to the wrong account

`src/lib/auth/viewer.ts` previously auto-selected the first active user when demo auth was enabled without a specific viewer email. That made all server-side role checks depend on environment state rather than a user-bound identity.

Impact:

- accidental privilege escalation
- admin/fan/creator access bound to config instead of a session
- unsafe for any environment beyond controlled local development

### 2. Premium media URLs were exposed directly to the client

Protected posts and locked-message media were being returned as raw `MediaAsset.url` or `thumbnailUrl` strings from server-side loaders.

Impact:

- subscriber-only and locked content could be extracted or replayed once the browser saw the origin URL
- no per-request entitlement enforcement on media delivery
- no SSRF/media-origin allowlist for proxied fetches

### 3. Billing webhook verification was effectively missing

`src/app/api/billing/webhooks/[provider]/route.ts` explicitly left signature verification as TODO, and the mock provider accepted arbitrary JSON.

Impact:

- forged webhook events could mutate billing state
- replayed or spammed events could be processed
- billing event ingestion trusted unverified input

### 4. No meaningful rate limiting on sensitive flows

There was no app-level throttling on:

- billing webhook ingestion
- fan purchase attempts for subscriptions or message unlocks

Impact:

- brute-force or abuse traffic had no built-in dampening
- webhook endpoint could be spammed
- billing actions could be hammered

### 5. Unsafe URL handling for user/content-controlled display URLs

The UI used inline `backgroundImage: url(...)` with values ultimately sourced from profile/media data. React escaping helps for text, but URL values still needed protocol restrictions.

Impact:

- weak protection against malformed or dangerous URL schemes
- unnecessary exposure to CSS/URL injection style issues

### 6. Admin audit surface existed in schema but not in real runtime flow

The app had an `AdminActionLog` model, but admin pages were using demo data instead of loading real audit records.

Impact:

- weak audit visibility for actual moderation/admin actions
- no real operational audit surface even when logs exist in the database

## What Was Fixed

### Auth And Env Hardening

- `src/lib/auth/viewer.ts`
  - removed the unsafe fallback that auto-selected the first active account
  - demo auth now requires an explicit configured viewer email

- `src/lib/config/env.ts`
  - added fail-closed production checks
  - disallowed `ALLOW_DEMO_AUTH` in production
  - disallowed `ALLOW_DEMO_DATA_FALLBACK` in production
  - disallowed the mock billing provider in production
  - required explicit secrets/settings for webhook verification and signed media
  - added `ALLOWED_MEDIA_HOSTS`, `MEDIA_SIGNING_SECRET`, and webhook signature tolerance handling

- `.env.example`
  - documented the new security-relevant environment variables

### Protected Media Delivery

- added `src/app/api/media/[assetId]/route.ts`
  - media is now served through a server-controlled route
  - protected assets require signed URLs
  - subscriber-only and locked-message access is re-checked server-side before media is streamed
  - message media requires conversation ownership and, where appropriate, an unlock grant
  - media origin fetches are constrained by protocol checks and `ALLOWED_MEDIA_HOSTS`
  - protected responses are marked `private, no-store`

- added `src/lib/media/protection.ts`
  - creates short-lived signed media URLs
  - verifies asset/variant/expiry signatures server-side

- updated:
  - `src/lib/public/server-data.ts`
  - `src/lib/fan/server-data.ts`

  These loaders now return internal media proxy URLs instead of raw storage URLs for protected assets.

### Webhook Trust And Rate Limiting

- `src/lib/billing/providers/mock-provider.ts`
  - now verifies HMAC-signed webhook payloads using timestamped headers
  - rejects missing, invalid, stale, or forged webhook signatures

- `src/app/api/billing/webhooks/[provider]/route.ts`
  - added IP-based rate limiting
  - returns `429` with `Retry-After` when throttled

- added `src/lib/security/rate-limit.ts`
  - shared in-memory rate limit primitive

- updated `src/lib/billing/service.ts`
  - added per-user throttling for subscription purchase attempts
  - added per-user throttling for locked-message unlock attempts

- updated `src/app/actions/billing.ts`
  - returns rate-limit errors cleanly to the caller

### Safer Handling Of Untrusted URLs And Basic Browser Hardening

- added `src/lib/security/url.ts`
  - rejects non-http(s) and invalid display URLs before rendering

- updated server-side data shaping to use safe display URLs for profile/avatar surfaces that come from stored data

- updated `middleware.ts`
  - added baseline security headers
  - includes `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, permissions restrictions, and a baseline CSP

### Admin Audit Visibility

- added `src/lib/admin/audit.ts`
  - loads recent admin action logs from Prisma for real admin users
  - includes a reusable `recordAdminAction()` helper for future admin mutations

- updated:
  - `src/app/(admin)/admin/page.tsx`
  - `src/app/(admin)/admin/audit/page.tsx`

  Admin surfaces now prefer real database-backed audit entries instead of demo-only log data.

## What Remains

These are still real risks or gaps, but they were not safely solvable in this pass without adding larger product/infrastructure systems.

### 1. Real user authentication is still missing

The app still does not have a production-grade auth/session system. The changes in this pass make it fail closed more safely, but they do not replace proper authentication.

Needed:

- real sign-in
- cryptographically secure sessions
- passwordless/provider auth or equivalent identity layer
- session rotation, revocation, and device/session management

### 2. Upload validation is not implemented because there is no real server upload endpoint yet

The creator upload UIs are still mock/local-only UI surfaces.

Needed once uploads become real:

- server-side MIME sniffing, not just extension/accept checks
- file size limits
- image/video transcoding pipeline
- malware scanning or quarantine flow
- metadata stripping
- content moderation pipeline
- storage bucket separation for public vs protected assets

### 3. Admin write paths still need to emit audit logs

This pass created a real audit-loading path and helper, but there are no real admin mutation actions wired yet.

Needed:

- every approve/suspend/review/admin enforcement action should call `recordAdminAction()`
- include actor, target, reason, metadata, and request correlation

### 4. CSRF posture should be revisited when real session auth is added

Current state:

- server actions are better than ad hoc client posts
- the adult-access cookie is `httpOnly` and `sameSite=lax`
- no obvious `dangerouslySetInnerHTML` sink was found in app code

Still needed with real auth:

- explicit CSRF strategy for authenticated state-changing requests
- origin/referer enforcement where appropriate
- session cookie hardening and anti-replay controls

### 5. XSS review is improved but not “done forever”

React escaping is doing most of the heavy lifting for user-generated text right now. That is good, but future rich text, markdown, embeds, or HTML rendering would require dedicated sanitization.

## What Requires Infra Or Provider Work

These cannot be fully solved in application code alone.

### 1. Production-grade rate limiting

The current rate limiter is intentionally basic and in-memory. It is useful as a first barrier, but it is not enough for multi-instance or horizontally scaled deployment.

Infra requirement:

- Redis or equivalent shared store
- edge/WAF rate limiting
- provider/IP reputation controls

### 2. Media storage security

The new proxy protects app delivery, but real media security needs storage/provider support too.

Infra requirement:

- private storage buckets
- origin access policies
- per-object signed fetch or CDN token auth
- short-lived CDN URLs
- hotlink protection

### 3. Real billing provider integration

Webhook verification is now enforced for the mock provider, but live billing still needs provider-native integration.

Provider work:

- real provider adapter
- official webhook signature verification
- replay defense using provider event IDs and timestamps
- dispute/refund lifecycle coverage
- reconciliation against provider APIs

### 4. Age/identity/compliance verification

The 18+ gate remains a self-attestation gate only.

Infra/provider requirement:

- identity/age verification vendor if legally required
- jurisdiction-aware controls
- compliance retention and review workflows

### 5. Centralized audit and monitoring

App-level audit records are useful, but production operations need centralized observability.

Infra requirement:

- immutable audit export or SIEM ingestion
- alerting for admin actions, billing failures, and repeated access denials
- request correlation IDs and structured logs

## Recommended Next Security Milestones

1. Replace demo auth with a real session-based authentication system.
2. Move protected media into private storage/CDN backed by provider-side signed access.
3. Add real upload APIs with validation, scanning, and moderation.
4. Wire all future admin mutations to `recordAdminAction()`.
5. Replace in-memory rate limits with Redis or edge rate limiting before production launch.
