import "server-only";

import type { Prisma, SubscriptionStatus, TransactionStatus, TransactionType } from "@/generated/prisma/client";

export type BillingProviderPurchaseContext = {
  transactionId: string;
  idempotencyKey: string;
  userId: string;
  creatorProfileId: string;
  creatorSlug: string;
  amountCents: number;
  currency: string;
};

export type BillingProviderSubscriptionPurchaseInput = BillingProviderPurchaseContext & {
  existingSubscriptionProviderRef?: string | null;
};

export type BillingProviderMessageUnlockPurchaseInput = BillingProviderPurchaseContext & {
  conversationId: string;
  messageId: string;
};

export type BillingProviderSubscriptionCancelInput = {
  subscriptionId: string;
  providerSubscriptionRef: string;
  userId: string;
  creatorProfileId: string;
  creatorSlug: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodStart?: Date | null;
  currentPeriodEnd?: Date | null;
  endsAt?: Date | null;
};

export type BillingProviderPurchaseResult = {
  provider: string;
  providerRef: string;
  status: TransactionStatus;
  amountCents: number;
  currency: string;
  billingReason: string;
  metadata: Prisma.InputJsonValue;
  providerCustomerRef?: string | null;
  providerPaymentMethodRef?: string | null;
  providerSubscriptionRef?: string | null;
  failureCode?: string | null;
  failureMessage?: string | null;
};

export type BillingSubscriptionLifecycleUpdate = {
  subscriptionStatus?: SubscriptionStatus;
  cancelAtPeriodEnd?: boolean;
  currentPeriodStart?: Date | null;
  currentPeriodEnd?: Date | null;
  endsAt?: Date | null;
  canceledAt?: Date | null;
  failureCode?: string | null;
  failureMessage?: string | null;
};

export type BillingProviderSubscriptionCancelResult = BillingSubscriptionLifecycleUpdate & {
  provider: string;
  providerSubscriptionRef: string;
  subscriptionStatus: SubscriptionStatus;
  cancelAtPeriodEnd: boolean;
};

export type BillingWebhookEvent = {
  provider: string;
  eventId: string;
  eventType: string;
  payload: Prisma.InputJsonValue;
  providerRef?: string | null;
  providerSubscriptionRef?: string | null;
  transactionStatus?: TransactionStatus;
} & BillingSubscriptionLifecycleUpdate;

export type BillingReconciliationInput = {
  transactionId: string;
  providerRef?: string | null;
  providerSubscriptionRef?: string | null;
  type: TransactionType;
  status: TransactionStatus;
  amountCents: number;
  currency: string;
};

export type BillingReconciliationResult = {
  providerRef?: string | null;
  providerSubscriptionRef?: string | null;
  transactionStatus?: TransactionStatus;
  metadata?: Prisma.InputJsonValue;
} & BillingSubscriptionLifecycleUpdate;

export interface BillingProviderAdapter {
  readonly name: string;
  readonly supportsWebhooks: boolean;
  readonly supportsReconciliation: boolean;
  isConfigured(): boolean;
  createSubscriptionPurchase(
    input: BillingProviderSubscriptionPurchaseInput,
  ): Promise<BillingProviderPurchaseResult>;
  cancelSubscription(
    input: BillingProviderSubscriptionCancelInput,
  ): Promise<BillingProviderSubscriptionCancelResult>;
  createMessageUnlockPurchase(
    input: BillingProviderMessageUnlockPurchaseInput,
  ): Promise<BillingProviderPurchaseResult>;
  parseWebhook(request: Request): Promise<BillingWebhookEvent>;
  reconcileTransaction(
    input: BillingReconciliationInput,
  ): Promise<BillingReconciliationResult | null>;
}
