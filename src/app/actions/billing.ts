"use server";

import { revalidatePath } from "next/cache";

import { AccessDeniedError } from "@/lib/auth/viewer";
import { BillingConfigurationError } from "@/lib/billing/errors";
import {
  cancelCreatorSubscription,
  purchaseCreatorSubscription,
  purchaseLockedMessageUnlock,
} from "@/lib/billing/service";
import { logError, logWarn } from "@/lib/observability/logger";
import { RateLimitExceededError } from "@/lib/security/rate-limit";

export type PurchaseActionState = {
  ok: boolean;
  message: string;
  creatorSlug?: string;
  conversationId?: string;
  messageId?: string;
  title?: string;
  alreadyOwned?: boolean;
  alreadyUnlocked?: boolean;
};

const defaultPurchaseState: PurchaseActionState = {
  ok: false,
  message: "",
};

function getActionErrorMessage(error: unknown) {
  if (
    error instanceof AccessDeniedError ||
    error instanceof BillingConfigurationError ||
    error instanceof RateLimitExceededError
  ) {
    return error.message;
  }

  return "Unable to complete that billing request right now.";
}

export async function purchaseCreatorSubscriptionAction(
  _previousState: PurchaseActionState = defaultPurchaseState,
  formData: FormData,
): Promise<PurchaseActionState> {
  const creatorSlug = formData.get("creatorSlug");

  if (typeof creatorSlug !== "string" || !creatorSlug) {
    return {
      ok: false,
      message: "Missing creator slug.",
    };
  }

  try {
    const result = await purchaseCreatorSubscription(creatorSlug);

    revalidatePath("/");
    revalidatePath("/fan");
    revalidatePath("/fan/subscriptions");
    revalidatePath("/fan/messages");
    revalidatePath("/fan/billing");
    revalidatePath(`/creators/${creatorSlug}`);

    if (result.conversationId) {
      revalidatePath(`/fan/messages/${result.conversationId}`);
    }

    return result;
  } catch (error) {
    const log = error instanceof BillingConfigurationError ? logError : logWarn;
    log({
      event: "billing.subscription.action_failed",
      message: "Subscription purchase action failed.",
      metadata: {
        creatorSlug,
        error,
      },
    });

    return {
      ok: false,
      message: getActionErrorMessage(error),
    };
  }
}

export async function purchaseMessageUnlockAction(
  _previousState: PurchaseActionState = defaultPurchaseState,
  formData: FormData,
): Promise<PurchaseActionState> {
  const messageId = formData.get("messageId");

  if (typeof messageId !== "string" || !messageId) {
    return {
      ok: false,
      message: "Missing message id.",
    };
  }

  try {
    const result = await purchaseLockedMessageUnlock(messageId);

    revalidatePath("/fan");
    revalidatePath("/fan/messages");
    revalidatePath("/fan/subscriptions");
    revalidatePath("/fan/billing");

    if (result.conversationId) {
      revalidatePath(`/fan/messages/${result.conversationId}`);
    }

    if (result.creatorSlug) {
      revalidatePath(`/creators/${result.creatorSlug}`);
    }

    return result;
  } catch (error) {
    const log = error instanceof BillingConfigurationError ? logError : logWarn;
    log({
      event: "billing.message_unlock.action_failed",
      message: "Message unlock action failed.",
      metadata: {
        error,
        messageId,
      },
    });

    return {
      ok: false,
      message: getActionErrorMessage(error),
    };
  }
}

export async function cancelCreatorSubscriptionAction(
  _previousState: PurchaseActionState = defaultPurchaseState,
  formData: FormData,
): Promise<PurchaseActionState> {
  const subscriptionId = formData.get("subscriptionId");

  if (typeof subscriptionId !== "string" || !subscriptionId) {
    return {
      ok: false,
      message: "Missing subscription id.",
    };
  }

  try {
    const result = await cancelCreatorSubscription(subscriptionId);

    revalidatePath("/");
    revalidatePath("/fan");
    revalidatePath("/fan/subscriptions");
    revalidatePath("/fan/messages");
    revalidatePath("/fan/billing");

    if (result.creatorSlug) {
      revalidatePath(`/creators/${result.creatorSlug}`);
    }

    return result;
  } catch (error) {
    const log = error instanceof BillingConfigurationError ? logError : logWarn;
    log({
      event: "billing.subscription.cancel_action_failed",
      message: "Subscription cancellation action failed.",
      metadata: {
        error,
        subscriptionId,
      },
    });

    return {
      ok: false,
      message: getActionErrorMessage(error),
    };
  }
}
