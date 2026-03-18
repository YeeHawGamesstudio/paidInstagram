import "server-only";

import { randomUUID } from "node:crypto";

import {
  CreatorState,
  SubscriptionStatus,
  TransactionStatus,
  TransactionType,
  type Prisma,
  type Transaction,
} from "@/generated/prisma/client";
import { requireRole } from "@/lib/auth/viewer";
import { BillingConfigurationError, BillingProcessingError } from "@/lib/billing/errors";
import type { BillingProviderPurchaseResult, BillingReconciliationResult, BillingWebhookEvent } from "@/lib/billing/provider";
import { billingRepository, isUniqueConstraintError } from "@/lib/billing/repository";
import { getBillingProvider } from "@/lib/billing/registry";
import { getSubscriptionAccessEndsAt, hasActiveSubscriptionAccess, isPendingTransactionStatus } from "@/lib/billing/state";
import { env } from "@/lib/config/env";
import { formatShortDate } from "@/lib/formatting";
import { prisma } from "@/lib/prisma/client";
import { enforceRateLimit } from "@/lib/security/rate-limit";

type SubscriptionActionResult = {
  ok: boolean;
  creatorSlug?: string;
  creatorName?: string;
  alreadyOwned?: boolean;
  conversationId?: string;
  message: string;
};

type PurchaseMessageUnlockResult = {
  ok: boolean;
  conversationId: string;
  messageId: string;
  creatorSlug?: string;
  title?: string;
  alreadyUnlocked?: boolean;
  message: string;
};

type PendingSubscriptionMetadata = {
  kind: "subscription";
  fanId: string;
  creatorProfileId: string;
  creatorSlug: string;
};

type PendingMessageUnlockMetadata = {
  kind: "message_unlock";
  fanId: string;
  creatorProfileId: string;
  creatorSlug: string;
  conversationId: string;
  messageId: string;
};

type PendingBillingMetadata = PendingSubscriptionMetadata | PendingMessageUnlockMetadata;

function toJsonObject(value: Prisma.JsonValue | Prisma.InputJsonValue | null | undefined) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function mergeMetadata(base: PendingBillingMetadata, providerMetadata: Prisma.InputJsonValue) {
  return {
    ...base,
    ...toJsonObject(providerMetadata),
  } satisfies Prisma.InputJsonValue;
}

function assertConfiguredProvider() {
  const provider = getBillingProvider();

  if (!provider.isConfigured()) {
    throw new BillingConfigurationError(
      "Billing provider is not configured. Connect a live adapter before enabling real purchases in production.",
    );
  }

  return provider;
}

function getFailureMessage(result: BillingProviderPurchaseResult) {
  return result.failureMessage ?? "Payment could not be completed.";
}

async function finalizeSuccessfulTransactionGrant(transaction: Transaction) {
  const metadata = toJsonObject(transaction.metadata) as Partial<PendingBillingMetadata>;

  if (metadata.kind === "subscription") {
    if (!metadata.creatorProfileId || !metadata.creatorSlug) {
      throw new BillingProcessingError("Subscription transaction metadata is incomplete.");
    }

    const creator = await prisma.creatorProfile.findFirst({
      where: {
        id: metadata.creatorProfileId,
        state: CreatorState.APPROVED,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!creator?.user.profile) {
      throw new BillingProcessingError("Creator is unavailable for subscription activation.");
    }

    return billingRepository.completeSubscriptionPurchase({
      transactionId: transaction.id,
      userId: transaction.userId,
      creatorProfileId: creator.id,
      creatorUserId: creator.userId,
      creatorSlug: metadata.creatorSlug,
      priceCents: transaction.amountCents,
      currency: transaction.currency,
      provider: transaction.provider,
      providerCustomerRef: transaction.providerCustomerRef,
      providerSubscriptionRef:
        typeof toJsonObject(transaction.metadata).providerSubscriptionRef === "string"
          ? (toJsonObject(transaction.metadata).providerSubscriptionRef as string)
          : undefined,
    });
  }

  if (metadata.kind === "message_unlock") {
    if (!metadata.messageId) {
      throw new BillingProcessingError("Unlock transaction metadata is incomplete.");
    }

    if (transaction.messageUnlockId) {
      return null;
    }

    try {
      await billingRepository.completeMessageUnlockPurchase({
        transactionId: transaction.id,
        userId: transaction.userId,
        messageId: metadata.messageId,
      });
      return null;
    } catch (error) {
      if (!isUniqueConstraintError(error)) {
        throw error;
      }

      const existingUnlock = await billingRepository.findMessageUnlockGrant(transaction.userId, metadata.messageId);

      if (existingUnlock && !existingUnlock.transaction) {
        await billingRepository.attachExistingMessageUnlockToTransaction({
          transactionId: transaction.id,
          messageUnlockId: existingUnlock.id,
        });
      } else {
        await billingRepository.updateTransactionLifecycle({
          transactionId: transaction.id,
          status: TransactionStatus.SUCCEEDED,
        });
      }

      return null;
    }
  }

  throw new BillingProcessingError("Unknown billing transaction kind.");
}

async function applyLifecycleUpdateFromProvider(
  transaction: Transaction,
  input: {
    transactionStatus: TransactionStatus;
    failureCode?: string | null;
    failureMessage?: string | null;
    reconciled?: boolean;
  },
) {
  await billingRepository.updateTransactionLifecycle({
    transactionId: transaction.id,
    status: input.transactionStatus,
    failureCode: input.failureCode,
    failureMessage: input.failureMessage,
    reconciled: input.reconciled,
  });

  if (input.transactionStatus === TransactionStatus.SUCCEEDED) {
    await finalizeSuccessfulTransactionGrant(transaction);
  }
}

async function applyWebhookEvent(
  transaction: Transaction | null,
  event: BillingWebhookEvent,
  reconciliation = false,
) {
  if (transaction && event.transactionStatus) {
    await applyLifecycleUpdateFromProvider(transaction, {
      transactionStatus: event.transactionStatus,
      failureCode: event.failureCode,
      failureMessage: event.failureMessage,
      reconciled: reconciliation,
    });
  }

  if (event.providerSubscriptionRef) {
    const subscription = await billingRepository.findSubscriptionByProviderRef(
      event.provider,
      event.providerSubscriptionRef,
    );

    const hasSubscriptionLifecycleUpdate =
      Boolean(event.subscriptionStatus) ||
      event.cancelAtPeriodEnd !== undefined ||
      event.currentPeriodStart !== undefined ||
      event.currentPeriodEnd !== undefined ||
      event.endsAt !== undefined ||
      event.canceledAt !== undefined ||
      event.failureCode !== undefined ||
      event.failureMessage !== undefined;

    if (subscription && hasSubscriptionLifecycleUpdate) {
      await billingRepository.updateSubscriptionLifecycle({
        subscriptionId: subscription.id,
        status: event.subscriptionStatus ?? subscription.status,
        provider: event.provider,
        providerSubscriptionRef: event.providerSubscriptionRef,
        cancelAtPeriodEnd: event.cancelAtPeriodEnd,
        currentPeriodStart: event.currentPeriodStart,
        currentPeriodEnd: event.currentPeriodEnd,
        endsAt: event.endsAt,
        canceledAt: event.canceledAt,
        failureCode: event.failureCode,
        failureMessage: event.failureMessage,
      });
    }
  }
}

export async function purchaseCreatorSubscription(
  creatorSlug: string,
): Promise<SubscriptionActionResult> {
  const viewer = await requireRole("FAN");
  const provider = assertConfiguredProvider();

  enforceRateLimit({
    key: `purchase:subscription:${viewer.id}`,
    limit: 5,
    windowMs: 60 * 1000,
    message: "Too many subscription attempts. Please wait a minute before trying again.",
  });

  const creator = await billingRepository.getSubscriptionPurchaseContext(viewer.id, creatorSlug);

  if (!creator?.user.profile || creator.state !== CreatorState.APPROVED) {
    return {
      ok: false,
      creatorSlug,
      message: "That creator is unavailable right now.",
    };
  }

  const existingSubscription = creator.subscriptions[0];

  if (existingSubscription && hasActiveSubscriptionAccess(existingSubscription)) {
    return {
      ok: true,
      creatorSlug,
      creatorName: creator.user.profile.displayName,
      alreadyOwned: true,
      conversationId: creator.conversations[0]?.id,
      message: `You already have access to ${creator.user.profile.displayName}.`,
    };
  }

  const idempotencyKey = randomUUID();
  const metadata: PendingSubscriptionMetadata = {
    kind: "subscription",
    fanId: viewer.id,
    creatorProfileId: creator.id,
    creatorSlug: creator.slug,
  };

  const pendingTransaction = await billingRepository.createPendingTransaction({
    userId: viewer.id,
    type: TransactionType.SUBSCRIPTION,
    amountCents: creator.subscriptionPriceCents,
    currency: creator.currency,
    idempotencyKey,
    billingReason: "subscription_purchase",
    metadata,
    provider: provider.name,
  });

  const charge = await provider.createSubscriptionPurchase({
    transactionId: pendingTransaction.id,
    idempotencyKey,
    userId: viewer.id,
    creatorProfileId: creator.id,
    creatorSlug: creator.slug,
    amountCents: creator.subscriptionPriceCents,
    currency: creator.currency,
    existingSubscriptionProviderRef: existingSubscription?.providerSubscriptionRef,
  });

  await billingRepository.updateTransactionFromProvider({
    transactionId: pendingTransaction.id,
    provider: charge.provider,
    providerRef: charge.providerRef,
    amountCents: charge.amountCents,
    currency: charge.currency,
    status: charge.status,
    metadata: mergeMetadata(metadata, {
      ...toJsonObject(charge.metadata),
      providerSubscriptionRef: charge.providerSubscriptionRef,
    }),
    billingReason: charge.billingReason,
    providerCustomerRef: charge.providerCustomerRef,
    providerPaymentMethodRef: charge.providerPaymentMethodRef,
    failureCode: charge.failureCode,
    failureMessage: charge.failureMessage,
  });

  if (charge.status === TransactionStatus.SUCCEEDED) {
    const result = await billingRepository.completeSubscriptionPurchase({
      transactionId: pendingTransaction.id,
      userId: viewer.id,
      creatorProfileId: creator.id,
      creatorUserId: creator.userId,
      creatorSlug: creator.slug,
      priceCents: charge.amountCents,
      currency: charge.currency,
      provider: charge.provider,
      providerCustomerRef: charge.providerCustomerRef,
      providerSubscriptionRef: charge.providerSubscriptionRef,
    });

    return {
      ok: true,
      creatorSlug,
      creatorName: creator.user.profile.displayName,
      conversationId: result.conversationId,
      message: `${creator.user.profile.displayName} membership is active now.`,
    };
  }

  if (isPendingTransactionStatus(charge.status)) {
    return {
      ok: false,
      creatorSlug,
      creatorName: creator.user.profile.displayName,
      conversationId: creator.conversations[0]?.id,
      message:
        "Billing is still confirming this membership. Access will update automatically once that finishes.",
    };
  }

  return {
    ok: false,
    creatorSlug,
    creatorName: creator.user.profile.displayName,
    message: getFailureMessage(charge),
  };
}

export async function cancelCreatorSubscription(
  subscriptionId: string,
): Promise<SubscriptionActionResult> {
  const viewer = await requireRole("FAN");
  const provider = assertConfiguredProvider();

  enforceRateLimit({
    key: `cancel:subscription:${viewer.id}`,
    limit: 10,
    windowMs: 60 * 1000,
    message: "Too many cancellation attempts. Please wait a minute before trying again.",
  });

  const subscription = await billingRepository.getFanSubscriptionById(viewer.id, subscriptionId);

  if (!subscription?.creatorProfile.user.profile) {
    return {
      ok: false,
      message: "That subscription could not be found.",
    };
  }

  const creatorName = subscription.creatorProfile.user.profile.displayName;
  const creatorSlug = subscription.creatorProfile.slug;

  if (!hasActiveSubscriptionAccess(subscription)) {
    return {
      ok: false,
      creatorSlug,
      creatorName,
      message: `${creatorName} membership is already inactive.`,
    };
  }

  const accessEndsAt = getSubscriptionAccessEndsAt(subscription);

  if (subscription.cancelAtPeriodEnd) {
    return {
      ok: true,
      creatorSlug,
      creatorName,
      message: `${creatorName} already ends on ${formatShortDate(accessEndsAt)}.`,
    };
  }

  if (!subscription.providerSubscriptionRef) {
    throw new BillingProcessingError("Subscription is missing a provider reference.");
  }

  const result = await provider.cancelSubscription({
    subscriptionId: subscription.id,
    providerSubscriptionRef: subscription.providerSubscriptionRef,
    userId: viewer.id,
    creatorProfileId: subscription.creatorProfileId,
    creatorSlug,
    cancelAtPeriodEnd: true,
    currentPeriodStart: subscription.currentPeriodStart,
    currentPeriodEnd: subscription.currentPeriodEnd ?? accessEndsAt,
    endsAt: subscription.endsAt ?? accessEndsAt,
  });

  const effectiveEndAt =
    result.currentPeriodEnd ??
    result.endsAt ??
    subscription.currentPeriodEnd ??
    subscription.endsAt ??
    accessEndsAt;

  await billingRepository.updateSubscriptionLifecycle({
    subscriptionId: subscription.id,
    status: result.subscriptionStatus,
    provider: result.provider,
    providerSubscriptionRef: result.providerSubscriptionRef,
    cancelAtPeriodEnd: result.cancelAtPeriodEnd,
    currentPeriodStart: result.currentPeriodStart ?? subscription.currentPeriodStart,
    currentPeriodEnd: result.currentPeriodEnd ?? subscription.currentPeriodEnd ?? effectiveEndAt,
    endsAt: result.endsAt ?? subscription.endsAt ?? effectiveEndAt,
    canceledAt: result.canceledAt,
    failureCode: result.failureCode,
    failureMessage: result.failureMessage,
  });

  return {
    ok: true,
    creatorSlug,
    creatorName,
    message: `${creatorName} stays active until ${formatShortDate(effectiveEndAt)}.`,
  };
}

export async function purchaseLockedMessageUnlock(
  messageId: string,
): Promise<PurchaseMessageUnlockResult> {
  const viewer = await requireRole("FAN");
  const provider = assertConfiguredProvider();

  enforceRateLimit({
    key: `purchase:message-unlock:${viewer.id}`,
    limit: 10,
    windowMs: 60 * 1000,
    message: "Too many unlock attempts. Please wait a minute before trying again.",
  });

  const message = await billingRepository.getMessageUnlockPurchaseContext(viewer.id, messageId);

  if (!message?.conversation.creatorProfile || !message.isLocked) {
    return {
      ok: false,
      conversationId: message?.conversationId ?? "",
      messageId,
      message: "That locked message could not be found.",
    };
  }

  if (message.conversation.fanId !== viewer.id) {
    return {
      ok: false,
      conversationId: message.conversationId,
      messageId,
      message: "This conversation does not belong to the active fan account.",
    };
  }

  if (message.unlocks[0]) {
    return {
      ok: true,
      conversationId: message.conversationId,
      messageId,
      creatorSlug: message.conversation.creatorProfile.slug,
      title: message.previewText ?? "premium message",
      alreadyUnlocked: true,
      message: "That paid drop is already unlocked.",
    };
  }

  const amountCents = message.unlockPriceCents ?? 0;
  const idempotencyKey = randomUUID();
  const metadata: PendingMessageUnlockMetadata = {
    kind: "message_unlock",
    fanId: viewer.id,
    creatorProfileId: message.conversation.creatorProfileId,
    creatorSlug: message.conversation.creatorProfile.slug,
    conversationId: message.conversationId,
    messageId: message.id,
  };

  const pendingTransaction = await billingRepository.createPendingTransaction({
    userId: viewer.id,
    type: TransactionType.MESSAGE_UNLOCK,
    amountCents,
    currency: message.currency,
    idempotencyKey,
    billingReason: "message_unlock",
    metadata,
    provider: provider.name,
  });

  const charge = await provider.createMessageUnlockPurchase({
    transactionId: pendingTransaction.id,
    idempotencyKey,
    userId: viewer.id,
    creatorProfileId: message.conversation.creatorProfileId,
    creatorSlug: message.conversation.creatorProfile.slug,
    conversationId: message.conversationId,
    messageId: message.id,
    amountCents,
    currency: message.currency,
  });

  await billingRepository.updateTransactionFromProvider({
    transactionId: pendingTransaction.id,
    provider: charge.provider,
    providerRef: charge.providerRef,
    amountCents: charge.amountCents,
    currency: charge.currency,
    status: charge.status,
    metadata: mergeMetadata(metadata, charge.metadata),
    billingReason: charge.billingReason,
    providerCustomerRef: charge.providerCustomerRef,
    providerPaymentMethodRef: charge.providerPaymentMethodRef,
    failureCode: charge.failureCode,
    failureMessage: charge.failureMessage,
  });

  if (charge.status === TransactionStatus.SUCCEEDED) {
    try {
      await billingRepository.completeMessageUnlockPurchase({
        transactionId: pendingTransaction.id,
        userId: viewer.id,
        messageId: message.id,
      });
    } catch (error) {
      if (!isUniqueConstraintError(error)) {
        throw error;
      }

      const existingUnlock = await billingRepository.findMessageUnlockGrant(viewer.id, message.id);

      if (existingUnlock?.transaction) {
        return {
          ok: true,
          conversationId: message.conversationId,
          messageId,
          creatorSlug: message.conversation.creatorProfile.slug,
          title: message.previewText ?? "premium message",
          alreadyUnlocked: true,
          message: "That paid drop is already unlocked.",
        };
      }

      if (existingUnlock) {
        await billingRepository.attachExistingMessageUnlockToTransaction({
          transactionId: pendingTransaction.id,
          messageUnlockId: existingUnlock.id,
        });
      }
    }

    return {
      ok: true,
      conversationId: message.conversationId,
      messageId,
      creatorSlug: message.conversation.creatorProfile.slug,
      title: message.previewText ?? "premium message",
      message: "Paid drop unlocked and added to your billing history.",
    };
  }

  if (isPendingTransactionStatus(charge.status)) {
    return {
      ok: false,
      conversationId: message.conversationId,
      messageId,
      creatorSlug: message.conversation.creatorProfile.slug,
      title: message.previewText ?? "premium message",
      message:
        "Billing is still confirming this unlock. It will appear automatically once that finishes.",
    };
  }

  return {
    ok: false,
    conversationId: message.conversationId,
    messageId,
    creatorSlug: message.conversation.creatorProfile.slug,
    title: message.previewText ?? "premium message",
    message: getFailureMessage(charge),
  };
}

export async function processBillingWebhook(providerName: string, request: Request) {
  const provider = getBillingProvider(providerName);

  if (!provider.isConfigured()) {
    throw new BillingConfigurationError(
      `Billing provider "${providerName}" is not registered. Add a provider adapter before wiring live webhooks.`,
    );
  }

  const event = await provider.parseWebhook(request);
  const transaction =
    event.providerRef
      ? await billingRepository.findTransactionByProviderRef(event.provider, event.providerRef)
      : null;
  const subscription =
    event.providerSubscriptionRef
      ? await billingRepository.findSubscriptionByProviderRef(event.provider, event.providerSubscriptionRef)
      : null;

  const billingEvent = await billingRepository.recordBillingEvent({
    provider: event.provider,
    eventId: event.eventId,
    eventType: event.eventType,
    payload: event.payload,
    transactionId: transaction?.id,
    subscriptionId: subscription?.id,
  });

  try {
    await applyWebhookEvent(transaction, event);

    await billingRepository.markBillingEventProcessed({
      billingEventId: billingEvent.id,
      status: transaction || subscription ? "PROCESSED" : "IGNORED",
    });

    return {
      ok: true,
      provider: event.provider,
      eventId: event.eventId,
      eventType: event.eventType,
      handled: Boolean(transaction || subscription),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook processing failed.";

    await billingRepository.markBillingEventProcessed({
      billingEventId: billingEvent.id,
      status: "FAILED",
      errorMessage: message,
    });

    throw error;
  }
}

function toWebhookEvent(provider: string, transaction: Transaction, result: BillingReconciliationResult): BillingWebhookEvent {
  return {
    provider,
    eventId: `reconcile-${transaction.id}-${Date.now()}`,
    eventType: "billing.reconciled",
    payload: result.metadata ?? {
      reconciledTransactionId: transaction.id,
      reconciledAt: new Date().toISOString(),
    },
    providerRef: result.providerRef ?? transaction.providerRef,
    providerSubscriptionRef: result.providerSubscriptionRef,
    transactionStatus: result.transactionStatus,
    subscriptionStatus: result.subscriptionStatus,
    cancelAtPeriodEnd: result.cancelAtPeriodEnd,
    currentPeriodStart: result.currentPeriodStart,
    currentPeriodEnd: result.currentPeriodEnd,
    endsAt: result.endsAt,
    canceledAt: result.canceledAt,
    failureCode: result.failureCode,
    failureMessage: result.failureMessage,
  };
}

export async function reconcilePendingBillingTransactions(limit = env.billingReconciliationBatchSize) {
  const provider = getBillingProvider();

  if (!provider.isConfigured() || !provider.supportsReconciliation) {
    return [];
  }

  const transactions = await billingRepository.listTransactionsNeedingReconciliation(limit);
  const results = [];

  for (const transaction of transactions) {
    const reconciliation = await provider.reconcileTransaction({
      transactionId: transaction.id,
      providerRef: transaction.providerRef,
      providerSubscriptionRef: transaction.subscription?.providerSubscriptionRef,
      type: transaction.type,
      status: transaction.status,
      amountCents: transaction.amountCents,
      currency: transaction.currency,
    });

    if (!reconciliation?.transactionStatus && !reconciliation?.subscriptionStatus) {
      continue;
    }

    const event = toWebhookEvent(provider.name, transaction, reconciliation);
    await applyWebhookEvent(transaction, event, true);
    results.push({
      transactionId: transaction.id,
      status: reconciliation.transactionStatus ?? transaction.status,
    });
  }

  return results;
}
