import "server-only";

import { randomUUID } from "node:crypto";

import { SubscriptionStatus, TransactionStatus, type Prisma } from "@/generated/prisma/client";
import type {
  BillingProviderAdapter,
  BillingProviderSubscriptionCancelInput,
  BillingProviderSubscriptionCancelResult,
  BillingProviderMessageUnlockPurchaseInput,
  BillingProviderPurchaseResult,
  BillingProviderSubscriptionPurchaseInput,
  BillingReconciliationInput,
  BillingReconciliationResult,
  BillingWebhookEvent,
} from "@/lib/billing/provider";
import { BillingProcessingError } from "@/lib/billing/errors";
import { env } from "@/lib/config/env";
import { verifySignedPayload } from "@/lib/security/signatures";

function parseDateValue(value: unknown) {
  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export class MockBillingProvider implements BillingProviderAdapter {
  readonly name = "mock";
  readonly supportsWebhooks = true;
  readonly supportsReconciliation = true;

  isConfigured() {
    return true;
  }

  async createSubscriptionPurchase(
    input: BillingProviderSubscriptionPurchaseInput,
  ): Promise<BillingProviderPurchaseResult> {
    return {
      provider: this.name,
      providerRef: `mock-sub-${randomUUID()}`,
      providerSubscriptionRef: input.existingSubscriptionProviderRef ?? `mock-subscription-${randomUUID()}`,
      status: TransactionStatus.SUCCEEDED,
      amountCents: input.amountCents,
      currency: input.currency,
      billingReason: "subscription_purchase",
      metadata: {
        mode: "mock",
        kind: "subscription",
        idempotencyKey: input.idempotencyKey,
        creatorProfileId: input.creatorProfileId,
        creatorSlug: input.creatorSlug,
        fanId: input.userId,
        chargedAt: new Date().toISOString(),
      },
      providerCustomerRef: `mock-customer-${input.userId}`,
      providerPaymentMethodRef: "mock-card-4242",
    };
  }

  async cancelSubscription(
    input: BillingProviderSubscriptionCancelInput,
  ): Promise<BillingProviderSubscriptionCancelResult> {
    return {
      provider: this.name,
      providerSubscriptionRef: input.providerSubscriptionRef,
      subscriptionStatus: input.cancelAtPeriodEnd ? "ACTIVE" : "CANCELED",
      cancelAtPeriodEnd: input.cancelAtPeriodEnd,
      currentPeriodStart: input.currentPeriodStart ?? null,
      currentPeriodEnd: input.currentPeriodEnd ?? input.endsAt ?? null,
      endsAt: input.endsAt ?? input.currentPeriodEnd ?? null,
      canceledAt: input.cancelAtPeriodEnd ? null : new Date(),
    };
  }

  async createMessageUnlockPurchase(
    input: BillingProviderMessageUnlockPurchaseInput,
  ): Promise<BillingProviderPurchaseResult> {
    return {
      provider: this.name,
      providerRef: `mock-msg-${randomUUID()}`,
      status: TransactionStatus.SUCCEEDED,
      amountCents: input.amountCents,
      currency: input.currency,
      billingReason: "message_unlock",
      metadata: {
        mode: "mock",
        kind: "message_unlock",
        idempotencyKey: input.idempotencyKey,
        conversationId: input.conversationId,
        creatorProfileId: input.creatorProfileId,
        creatorSlug: input.creatorSlug,
        fanId: input.userId,
        messageId: input.messageId,
        chargedAt: new Date().toISOString(),
      },
      providerCustomerRef: `mock-customer-${input.userId}`,
      providerPaymentMethodRef: "mock-card-4242",
    };
  }

  async parseWebhook(request: Request): Promise<BillingWebhookEvent> {
    const signature = request.headers.get("x-onlyclaw-signature");
    const timestamp = request.headers.get("x-onlyclaw-timestamp");
    const body = await request.text();
    const webhookSecret = env.billingProviderWebhookSecret;

    if (!signature || !timestamp) {
      throw new BillingProcessingError("Webhook signature headers are required.");
    }

    const parsedTimestamp = Number(timestamp);

    if (!Number.isFinite(parsedTimestamp)) {
      throw new BillingProcessingError("Webhook timestamp is invalid.");
    }

    const ageSeconds = Math.abs(Date.now() - parsedTimestamp * 1000) / 1000;

    if (ageSeconds > env.webhookSignatureToleranceSeconds) {
      throw new BillingProcessingError("Webhook timestamp is outside the allowed verification window.");
    }

    if (!webhookSecret) {
      throw new BillingProcessingError("Webhook signing secret is unavailable.");
    }

    if (!verifySignedPayload(webhookSecret, `${timestamp}.${body}`, signature)) {
      throw new BillingProcessingError("Webhook signature verification failed.");
    }

    let payload: Prisma.InputJsonObject;

    try {
      payload = JSON.parse(body) as Prisma.InputJsonObject;
    } catch {
      throw new BillingProcessingError("Webhook payload must be valid JSON.");
    }

    return {
      provider: this.name,
      eventId: typeof payload.eventId === "string" ? payload.eventId : `mock-event-${randomUUID()}`,
      eventType: typeof payload.eventType === "string" ? payload.eventType : "mock.event",
      payload,
      providerRef: typeof payload.providerRef === "string" ? payload.providerRef : null,
      providerSubscriptionRef:
        typeof payload.providerSubscriptionRef === "string" ? payload.providerSubscriptionRef : null,
      transactionStatus:
        typeof payload.transactionStatus === "string"
          ? (payload.transactionStatus as TransactionStatus)
          : undefined,
      subscriptionStatus:
        typeof payload.subscriptionStatus === "string"
          ? (payload.subscriptionStatus as SubscriptionStatus)
          : undefined,
      cancelAtPeriodEnd:
        typeof payload.cancelAtPeriodEnd === "boolean" ? payload.cancelAtPeriodEnd : undefined,
      currentPeriodStart: parseDateValue(payload.currentPeriodStart),
      currentPeriodEnd: parseDateValue(payload.currentPeriodEnd),
      endsAt: parseDateValue(payload.endsAt),
      canceledAt: parseDateValue(payload.canceledAt),
      failureCode: typeof payload.failureCode === "string" ? payload.failureCode : null,
      failureMessage: typeof payload.failureMessage === "string" ? payload.failureMessage : null,
    };
  }

  async reconcileTransaction(
    input: BillingReconciliationInput,
  ): Promise<BillingReconciliationResult | null> {
    return {
      providerRef: input.providerRef,
      providerSubscriptionRef: input.providerSubscriptionRef,
      transactionStatus:
        input.status === TransactionStatus.PENDING ? TransactionStatus.SUCCEEDED : input.status,
      metadata: {
        mode: "mock",
        reconciledAt: new Date().toISOString(),
      },
    };
  }
}

export const mockBillingProvider = new MockBillingProvider();
