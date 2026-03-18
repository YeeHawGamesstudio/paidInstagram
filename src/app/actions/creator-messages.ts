"use server";

import { revalidatePath } from "next/cache";

import { AccessDeniedError } from "@/lib/auth/viewer";
import { sendCreatorLockedMessage, sendCreatorReply } from "@/lib/creator/messaging";
import { logWarn } from "@/lib/observability/logger";
import { RateLimitExceededError } from "@/lib/security/rate-limit";

export type CreatorReplyActionState = {
  ok: boolean;
  message: string;
  conversationId?: string;
};

const defaultReplyState: CreatorReplyActionState = {
  ok: false,
  message: "",
};

export type CreatorPaidDropActionState = {
  ok: boolean;
  message: string;
  conversationId?: string;
};

const defaultPaidDropState: CreatorPaidDropActionState = {
  ok: false,
  message: "",
};

function getReplyErrorMessage(error: unknown) {
  if (error instanceof AccessDeniedError || error instanceof RateLimitExceededError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to send that reply right now.";
}

export async function sendCreatorReplyAction(
  _previousState: CreatorReplyActionState = defaultReplyState,
  formData: FormData,
): Promise<CreatorReplyActionState> {
  const conversationId = formData.get("conversationId");
  const body = formData.get("body");

  if (typeof conversationId !== "string" || !conversationId) {
    return {
      ok: false,
      message: "Missing conversation id.",
    };
  }

  if (typeof body !== "string") {
    return {
      ok: false,
      message: "Reply text is required.",
    };
  }

  try {
    const result = await sendCreatorReply({
      conversationId,
      body,
    });

    revalidatePath("/creator");
    revalidatePath("/creator/messages");
    revalidatePath("/fan");
    revalidatePath("/fan/messages");
    revalidatePath(`/fan/messages/${result.conversationId}`);

    return {
      ok: true,
      conversationId: result.conversationId,
      message: `Reply sent to ${result.fanName}.`,
    };
  } catch (error) {
    logWarn({
      event: "creator.reply.action_failed",
      message: "Creator reply action failed.",
      metadata: {
        conversationId,
        error,
      },
    });

    return {
      ok: false,
      conversationId,
      message: getReplyErrorMessage(error),
    };
  }
}

export async function sendCreatorPaidDropAction(
  _previousState: CreatorPaidDropActionState = defaultPaidDropState,
  formData: FormData,
): Promise<CreatorPaidDropActionState> {
  const conversationId = formData.get("conversationId");
  const body = formData.get("body");
  const unlockPriceDollars = formData.get("unlockPriceDollars");

  if (typeof conversationId !== "string" || !conversationId) {
    return {
      ok: false,
      message: "Missing conversation id.",
    };
  }

  if (typeof body !== "string") {
    return {
      ok: false,
      message: "Paid-drop text is required.",
    };
  }

  const unlockPriceCents = Math.round(Number(unlockPriceDollars ?? 0) * 100);

  try {
    const result = await sendCreatorLockedMessage({
      conversationId,
      body,
      unlockPriceCents,
    });

    revalidatePath("/creator");
    revalidatePath("/creator/messages");
    revalidatePath("/fan");
    revalidatePath("/fan/messages");
    revalidatePath(`/fan/messages/${result.conversationId}`);

    return {
      ok: true,
      conversationId: result.conversationId,
      message: `Paid drop sent to ${result.fanName}.`,
    };
  } catch (error) {
    logWarn({
      event: "creator.paid_drop.action_failed",
      message: "Creator paid-drop action failed.",
      metadata: {
        conversationId,
        error,
      },
    });

    return {
      ok: false,
      conversationId,
      message: getReplyErrorMessage(error),
    };
  }
}
