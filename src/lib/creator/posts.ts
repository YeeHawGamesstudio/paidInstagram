import "server-only";

import { PostVisibility } from "@/generated/prisma/client";
import { requireRole } from "@/lib/auth/viewer";
import { prisma } from "@/lib/prisma/client";
import { enforceRateLimit } from "@/lib/security/rate-limit";

function getScheduledDate(publishTiming: string) {
  const now = new Date();

  if (publishTiming === "tonight") {
    const tonight = new Date(now);
    tonight.setHours(23, 30, 0, 0);

    if (tonight.getTime() <= now.getTime()) {
      tonight.setDate(tonight.getDate() + 1);
    }

    return tonight;
  }

  if (publishTiming === "tomorrow") {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(12, 0, 0, 0);
    return tomorrow;
  }

  return now;
}

export async function createCreatorPost(input: {
  title: string;
  caption: string;
  visibility: "PUBLIC" | "SUBSCRIBER_ONLY";
  publishTiming: string;
  submitMode: "publish" | "draft";
}) {
  const viewer = await requireRole("CREATOR");

  if (!viewer.creatorProfile) {
    throw new Error("The active account is missing a creator profile.");
  }

  const title = input.title.trim();
  const caption = input.caption.trim();

  if (!title) {
    throw new Error("Add a post title before saving.");
  }

  if (!caption) {
    throw new Error("Add post copy before saving.");
  }

  if (title.length > 120) {
    throw new Error("Post titles must stay under 120 characters.");
  }

  if (caption.length > 2000) {
    throw new Error("Post copy must stay under 2000 characters.");
  }

  enforceRateLimit({
    key: `creator:post:${viewer.id}`,
    limit: 20,
    windowMs: 60 * 1000,
    message: "Too many post changes in a short time. Please wait a minute and try again.",
  });

  const scheduledAt = getScheduledDate(input.publishTiming);
  const shouldPublishNow = input.submitMode === "publish" && input.publishTiming === "now";
  const shouldSchedule = input.submitMode === "publish" && input.publishTiming !== "now";

  const post = await prisma.post.create({
    data: {
      creatorProfileId: viewer.creatorProfile.id,
      title,
      caption,
      body: caption,
      visibility: input.visibility === "PUBLIC" ? PostVisibility.PUBLIC : PostVisibility.SUBSCRIBER_ONLY,
      isPublished: shouldPublishNow,
      publishedAt: shouldPublishNow || shouldSchedule ? scheduledAt : null,
    },
  });

  return {
    id: post.id,
    creatorSlug: viewer.creatorProfile.slug,
    submitMode: input.submitMode,
    wasScheduled: shouldSchedule,
  };
}
