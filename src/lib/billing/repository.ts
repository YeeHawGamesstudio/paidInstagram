import "server-only";

import { Prisma, SubscriptionStatus, TransactionStatus, TransactionType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma/client";

function addMonth(date: Date) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + 1);
  return next;
}

export function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export const billingRepository = {
  async getSubscriptionPurchaseContext(viewerId: string, creatorSlug: string) {
    return prisma.creatorProfile.findFirst({
      where: {
        slug: creatorSlug,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        subscriptions: {
          where: {
            fanId: viewerId,
          },
          take: 1,
        },
        conversations: {
          where: {
            fanId: viewerId,
          },
          include: {
            messages: {
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
            },
          },
          take: 1,
        },
      },
    });
  },

  async getMessageUnlockPurchaseContext(viewerId: string, messageId: string) {
    return prisma.message.findUnique({
      where: {
        id: messageId,
      },
      include: {
        conversation: {
          include: {
            creatorProfile: true,
          },
        },
        unlocks: {
          where: {
            purchaserId: viewerId,
          },
          take: 1,
        },
      },
    });
  },

  async createPendingTransaction(input: {
    userId: string;
    type: TransactionType;
    amountCents: number;
    currency: string;
    idempotencyKey: string;
    billingReason: string;
    metadata: Prisma.InputJsonValue;
    provider?: string;
  }) {
    return prisma.transaction.create({
      data: {
        userId: input.userId,
        type: input.type,
        status: TransactionStatus.PENDING,
        amountCents: input.amountCents,
        currency: input.currency,
        provider: input.provider ?? "pending",
        idempotencyKey: input.idempotencyKey,
        billingReason: input.billingReason,
        metadata: input.metadata,
      },
    });
  },

  async updateTransactionFromProvider(input: {
    transactionId: string;
    provider: string;
    providerRef: string;
    amountCents: number;
    currency: string;
    status: TransactionStatus;
    metadata: Prisma.InputJsonValue;
    billingReason: string;
    providerCustomerRef?: string | null;
    providerPaymentMethodRef?: string | null;
    failureCode?: string | null;
    failureMessage?: string | null;
  }) {
    const now = new Date();

    return prisma.transaction.update({
      where: {
        id: input.transactionId,
      },
      data: {
        provider: input.provider,
        providerRef: input.providerRef,
        amountCents: input.amountCents,
        currency: input.currency,
        status: input.status,
        metadata: input.metadata,
        billingReason: input.billingReason,
        providerCustomerRef: input.providerCustomerRef,
        providerPaymentMethodRef: input.providerPaymentMethodRef,
        lastProviderSyncAt: now,
        processedAt: input.status === TransactionStatus.SUCCEEDED ? now : null,
        requiresActionAt: input.status === TransactionStatus.REQUIRES_ACTION ? now : null,
        failedAt: input.status === TransactionStatus.FAILED ? now : null,
        failureCode: input.failureCode,
        failureMessage: input.failureMessage,
      },
    });
  },

  async completeSubscriptionPurchase(input: {
    transactionId: string;
    userId: string;
    creatorProfileId: string;
    creatorUserId: string;
    creatorSlug: string;
    priceCents: number;
    currency: string;
    provider: string;
    providerCustomerRef?: string | null;
    providerSubscriptionRef?: string | null;
    now?: Date;
  }) {
    const now = input.now ?? new Date();
    const nextPeriodEnd = addMonth(now);

    return prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.upsert({
        where: {
          fanId_creatorProfileId: {
            fanId: input.userId,
            creatorProfileId: input.creatorProfileId,
          },
        },
        update: {
          provider: input.provider,
          providerCustomerRef: input.providerCustomerRef,
          providerSubscriptionRef: input.providerSubscriptionRef,
          status: SubscriptionStatus.ACTIVE,
          priceCents: input.priceCents,
          currency: input.currency,
          startedAt: now,
          endsAt: nextPeriodEnd,
          canceledAt: null,
          currentPeriodStart: now,
          currentPeriodEnd: nextPeriodEnd,
          cancelAtPeriodEnd: false,
          lastPaymentFailureAt: null,
          lastPaymentFailureCode: null,
          lastPaymentFailureMessage: null,
        },
        create: {
          fanId: input.userId,
          creatorProfileId: input.creatorProfileId,
          provider: input.provider,
          providerCustomerRef: input.providerCustomerRef,
          providerSubscriptionRef: input.providerSubscriptionRef,
          status: SubscriptionStatus.ACTIVE,
          priceCents: input.priceCents,
          currency: input.currency,
          startedAt: now,
          endsAt: nextPeriodEnd,
          billingAnchorAt: now,
          currentPeriodStart: now,
          currentPeriodEnd: nextPeriodEnd,
        },
      });

      const conversation = await tx.conversation.upsert({
        where: {
          fanId_creatorProfileId: {
            fanId: input.userId,
            creatorProfileId: input.creatorProfileId,
          },
        },
        update: {
          lastMessageAt: now,
        },
        create: {
          fanId: input.userId,
          creatorProfileId: input.creatorProfileId,
          lastMessageAt: now,
          messages: {
            create: {
              senderId: input.creatorUserId,
              body: "Thanks for subscribing. Your premium feed and future locked drops are now available.",
            },
          },
        },
      });

      await tx.transaction.update({
        where: {
          id: input.transactionId,
        },
        data: {
          status: TransactionStatus.SUCCEEDED,
          subscriptionId: subscription.id,
          processedAt: now,
          failedAt: null,
          failureCode: null,
          failureMessage: null,
        },
      });

      return {
        conversationId: conversation.id,
        subscriptionId: subscription.id,
      };
    });
  },

  async completeMessageUnlockPurchase(input: {
    transactionId: string;
    userId: string;
    messageId: string;
    now?: Date;
  }) {
    const now = input.now ?? new Date();

    return prisma.$transaction(async (tx) => {
      const unlock = await tx.messageUnlock.create({
        data: {
          purchaserId: input.userId,
          messageId: input.messageId,
        },
      });

      await tx.transaction.update({
        where: {
          id: input.transactionId,
        },
        data: {
          status: TransactionStatus.SUCCEEDED,
          messageUnlockId: unlock.id,
          processedAt: now,
          failedAt: null,
          failureCode: null,
          failureMessage: null,
        },
      });

      return unlock;
    });
  },

  async findMessageUnlockGrant(userId: string, messageId: string) {
    return prisma.messageUnlock.findFirst({
      where: {
        purchaserId: userId,
        messageId,
      },
      include: {
        transaction: true,
      },
    });
  },

  async attachExistingMessageUnlockToTransaction(input: {
    transactionId: string;
    messageUnlockId: string;
  }) {
    return prisma.transaction.update({
      where: {
        id: input.transactionId,
      },
      data: {
        status: TransactionStatus.SUCCEEDED,
        messageUnlockId: input.messageUnlockId,
        processedAt: new Date(),
        failedAt: null,
        failureCode: null,
        failureMessage: null,
      },
    });
  },

  async findTransactionByProviderRef(provider: string, providerRef: string) {
    return prisma.transaction.findFirst({
      where: {
        provider,
        providerRef,
      },
    });
  },

  async findSubscriptionByProviderRef(provider: string, providerSubscriptionRef: string) {
    return prisma.subscription.findFirst({
      where: {
        provider,
        providerSubscriptionRef,
      },
    });
  },

  async getFanSubscriptionById(viewerId: string, subscriptionId: string) {
    return prisma.subscription.findFirst({
      where: {
        id: subscriptionId,
        fanId: viewerId,
      },
      include: {
        creatorProfile: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });
  },

  async recordBillingEvent(input: {
    provider: string;
    eventId: string;
    eventType: string;
    payload: Prisma.InputJsonValue;
    transactionId?: string | null;
    subscriptionId?: string | null;
  }) {
    return prisma.billingEvent.upsert({
      where: {
        provider_eventId: {
          provider: input.provider,
          eventId: input.eventId,
        },
      },
      update: {
        eventType: input.eventType,
        payload: input.payload,
        transactionId: input.transactionId ?? null,
        subscriptionId: input.subscriptionId ?? null,
      },
      create: {
        provider: input.provider,
        eventId: input.eventId,
        eventType: input.eventType,
        payload: input.payload,
        transactionId: input.transactionId ?? null,
        subscriptionId: input.subscriptionId ?? null,
      },
    });
  },

  async markBillingEventProcessed(input: {
    billingEventId: string;
    status: "PROCESSED" | "FAILED" | "IGNORED";
    errorMessage?: string | null;
  }) {
    return prisma.billingEvent.update({
      where: {
        id: input.billingEventId,
      },
      data: {
        status: input.status,
        processedAt: new Date(),
        errorMessage: input.errorMessage ?? null,
      },
    });
  },

  async updateTransactionLifecycle(input: {
    transactionId: string;
    status: TransactionStatus;
    failureCode?: string | null;
    failureMessage?: string | null;
    reconciled?: boolean;
  }) {
    const now = new Date();

    return prisma.transaction.update({
      where: {
        id: input.transactionId,
      },
      data: {
        status: input.status,
        failureCode: input.failureCode ?? null,
        failureMessage: input.failureMessage ?? null,
        processedAt: input.status === TransactionStatus.SUCCEEDED ? now : undefined,
        requiresActionAt: input.status === TransactionStatus.REQUIRES_ACTION ? now : undefined,
        failedAt: input.status === TransactionStatus.FAILED ? now : undefined,
        refundedAt:
          input.status === TransactionStatus.REFUNDED ||
          input.status === TransactionStatus.PARTIALLY_REFUNDED
            ? now
            : undefined,
        disputedAt: input.status === TransactionStatus.DISPUTED ? now : undefined,
        reconciledAt: input.reconciled ? now : undefined,
        lastProviderSyncAt: now,
      },
    });
  },

  async updateSubscriptionLifecycle(input: {
    subscriptionId: string;
    status: SubscriptionStatus;
    provider?: string;
    providerSubscriptionRef?: string | null;
    cancelAtPeriodEnd?: boolean;
    currentPeriodStart?: Date | null;
    currentPeriodEnd?: Date | null;
    endsAt?: Date | null;
    canceledAt?: Date | null;
    failureCode?: string | null;
    failureMessage?: string | null;
  }) {
    const now = new Date();

    return prisma.subscription.update({
      where: {
        id: input.subscriptionId,
      },
      data: {
        provider: input.provider,
        providerSubscriptionRef: input.providerSubscriptionRef,
        status: input.status,
        cancelAtPeriodEnd: input.cancelAtPeriodEnd,
        currentPeriodStart: input.currentPeriodStart,
        currentPeriodEnd: input.currentPeriodEnd,
        endsAt: input.endsAt,
        canceledAt:
          input.canceledAt ?? (input.status === SubscriptionStatus.CANCELED ? now : undefined),
        lastPaymentFailureAt: input.failureCode || input.failureMessage ? now : null,
        lastPaymentFailureCode: input.failureCode ?? null,
        lastPaymentFailureMessage: input.failureMessage ?? null,
      },
    });
  },

  async listTransactionsNeedingReconciliation(limit: number) {
    return prisma.transaction.findMany({
      where: {
        status: {
          in: [TransactionStatus.PENDING, TransactionStatus.REQUIRES_ACTION],
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: limit,
      include: {
        subscription: true,
      },
    });
  },
};
