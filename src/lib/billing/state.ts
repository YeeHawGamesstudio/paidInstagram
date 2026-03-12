import "server-only";

import { SubscriptionStatus, TransactionStatus } from "@/generated/prisma/client";

type SubscriptionAccessShape = {
  status: SubscriptionStatus;
  startedAt: Date;
  endsAt: Date | null;
  currentPeriodEnd?: Date | null;
};

export function getSubscriptionAccessEndsAt(subscription: SubscriptionAccessShape) {
  if (subscription.currentPeriodEnd) {
    return subscription.currentPeriodEnd;
  }

  if (subscription.endsAt) {
    return subscription.endsAt;
  }

  const derived = new Date(subscription.startedAt);
  derived.setMonth(derived.getMonth() + 1);
  return derived;
}

export function hasActiveSubscriptionAccess(subscription: SubscriptionAccessShape) {
  if (subscription.status !== SubscriptionStatus.ACTIVE) {
    return false;
  }

  return getSubscriptionAccessEndsAt(subscription).getTime() > Date.now();
}

export function isPendingTransactionStatus(status: TransactionStatus) {
  return status === TransactionStatus.PENDING || status === TransactionStatus.REQUIRES_ACTION;
}

export function isSuccessfulTransactionStatus(status: TransactionStatus) {
  return status === TransactionStatus.SUCCEEDED;
}
