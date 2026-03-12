# Billing Architecture

OnlyClaw now uses a provider-agnostic billing architecture that preserves the current subscription and locked-message purchase UX while separating provider concerns from app business logic.

## Current design

- `src/lib/billing/service.ts`
  Orchestrates subscription purchases, locked-message unlock purchases, webhook processing, and reconciliation.
- `src/lib/billing/repository.ts`
  Owns Prisma persistence for transaction attempts, successful grants, webhook events, and lifecycle updates.
- `src/lib/billing/provider.ts`
  Defines the adapter contract that any real payment provider must implement.
- `src/lib/billing/providers/mock-provider.ts`
  Keeps local/dev UX working with a mock adapter that behaves like an immediate-success provider.
- `src/lib/billing/providers/unconfigured-provider.ts`
  Makes production misconfiguration explicit instead of silently falling back to fake charges.
- `src/app/api/billing/webhooks/[provider]/route.ts`
  Generic webhook entry point that records provider events and applies lifecycle changes.

## Persisted billing state

The Prisma billing model now supports:

- pending and requires-action transactions
- succeeded, failed, canceled, refunded, and disputed transactions
- provider references and idempotency keys
- subscription lifecycle fields for current period, cancellation intent, and failed payment details
- webhook event persistence and de-duplication through `BillingEvent`
- reconciliation timestamps on transactions

## Safe state derivation

- Subscription access is derived from `Subscription.status` plus `currentPeriodEnd` or `endsAt`, not just the existence of a row.
- Locked-message access is derived from `MessageUnlock` grants, which are only created after a successful transaction outcome.
- Pending or failed transactions never grant subscription or unlock access.

## Real provider integration TODOs

These boundaries still must be completed before live billing is enabled:

1. Register a real adapter in `src/lib/billing/registry.ts`.
2. Implement `BillingProviderAdapter` methods for:
   - subscription checkout or payment intent creation
   - one-off locked-message unlock purchases
   - webhook parsing and signature verification
   - transaction reconciliation lookups
3. Add provider-specific environment variables for API keys, webhook secrets, and optional retry settings.
4. Wire a queue or cron job to call `reconcilePendingBillingTransactions()` for transactions that remain pending or require action.
5. Add refund and dispute event mapping in the real provider adapter so provider callbacks update local `Transaction` and `Subscription` lifecycle state correctly.
6. Apply a Prisma migration or `prisma db push` so the database schema matches the new billing domain model.

## Operational notes

- In non-production environments, `BILLING_PROVIDER` defaults to `mock` so the current UX remains usable.
- In production, billing must be explicitly configured. If it is not, purchase attempts fail safely with a configuration error.
- Webhook handling is intentionally generic; real signature verification is still a required production task.
