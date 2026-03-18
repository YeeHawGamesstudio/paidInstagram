"use server";

import { revalidatePath } from "next/cache";

import { AccessDeniedError } from "@/lib/auth/viewer";
import { createCreatorPost } from "@/lib/creator/posts";
import { logWarn } from "@/lib/observability/logger";
import { RateLimitExceededError } from "@/lib/security/rate-limit";

export type CreatorPostActionState = {
  ok: boolean;
  message: string;
  postId?: string;
};

const defaultPostState: CreatorPostActionState = {
  ok: false,
  message: "",
};

function getPostErrorMessage(error: unknown) {
  if (error instanceof AccessDeniedError || error instanceof RateLimitExceededError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to save that post right now.";
}

export async function createCreatorPostAction(
  _previousState: CreatorPostActionState = defaultPostState,
  formData: FormData,
): Promise<CreatorPostActionState> {
  const title = formData.get("title");
  const caption = formData.get("caption");
  const visibility = formData.get("visibility");
  const publishTiming = formData.get("publishTiming");
  const submitMode = formData.get("submitMode");

  if (
    typeof title !== "string" ||
    typeof caption !== "string" ||
    (visibility !== "PUBLIC" && visibility !== "SUBSCRIBER_ONLY") ||
    typeof publishTiming !== "string" ||
    (submitMode !== "publish" && submitMode !== "draft")
  ) {
    return {
      ok: false,
      message: "Post form data is incomplete.",
    };
  }

  try {
    const result = await createCreatorPost({
      title,
      caption,
      visibility,
      publishTiming,
      submitMode,
    });

    revalidatePath("/creator");
    revalidatePath("/creator/posts");
    revalidatePath("/creator/posts/new");
    revalidatePath("/discover");
    revalidatePath(`/creators/${result.creatorSlug}`);

    return {
      ok: true,
      postId: result.id,
      message:
        result.submitMode === "draft"
          ? "Draft saved."
          : result.wasScheduled
            ? "Post scheduled."
            : "Post published.",
    };
  } catch (error) {
    logWarn({
      event: "creator.post.action_failed",
      message: "Creator post action failed.",
      metadata: {
        error,
      },
    });

    return {
      ok: false,
      message: getPostErrorMessage(error),
    };
  }
}
