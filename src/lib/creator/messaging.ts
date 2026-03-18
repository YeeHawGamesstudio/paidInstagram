import "server-only";

import { requireRole } from "@/lib/auth/viewer";
import { prisma } from "@/lib/prisma/client";
import { enforceRateLimit } from "@/lib/security/rate-limit";

function buildPreviewText(body: string) {
  const normalized = body.trim().replace(/\s+/g, " ");
  return normalized.length <= 120 ? normalized : `${normalized.slice(0, 117)}...`;
}

export async function sendCreatorReply(input: {
  conversationId: string;
  body: string;
}) {
  const viewer = await requireRole("CREATOR");

  if (!viewer.creatorProfile) {
    throw new Error("The active account is missing a creator profile.");
  }

  const body = input.body.trim();

  if (!body) {
    throw new Error("Write a reply before sending.");
  }

  if (body.length > 2000) {
    throw new Error("Replies must stay under 2000 characters.");
  }

  enforceRateLimit({
    key: `creator:reply:${viewer.id}`,
    limit: 20,
    windowMs: 60 * 1000,
    message: "Too many replies sent in a short time. Please wait a minute and try again.",
  });

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: input.conversationId,
      creatorProfileId: viewer.creatorProfile.id,
    },
    include: {
      fan: {
        include: {
          profile: true,
        },
      },
    },
  });

  if (!conversation) {
    throw new Error("That conversation could not be found.");
  }

  const sentAt = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.message.create({
      data: {
        conversationId: conversation.id,
        senderId: viewer.id,
        body,
        previewText: buildPreviewText(body),
        currency: viewer.creatorProfile?.currency ?? "usd",
      },
    });

    await tx.conversation.update({
      where: {
        id: conversation.id,
      },
      data: {
        lastMessageAt: sentAt,
      },
    });
  });

  return {
    conversationId: conversation.id,
    fanName: conversation.fan.profile?.displayName ?? "fan",
  };
}

export async function sendCreatorLockedMessage(input: {
  conversationId: string;
  body: string;
  unlockPriceCents: number;
}) {
  const viewer = await requireRole("CREATOR");

  if (!viewer.creatorProfile) {
    throw new Error("The active account is missing a creator profile.");
  }

  const body = input.body.trim();
  const unlockPriceCents = Math.round(input.unlockPriceCents);

  if (!body) {
    throw new Error("Write the paid-drop message before sending.");
  }

  if (body.length > 2000) {
    throw new Error("Paid-drop messages must stay under 2000 characters.");
  }

  if (!Number.isFinite(unlockPriceCents) || unlockPriceCents < 100) {
    throw new Error("Set an unlock price of at least $1.");
  }

  if (unlockPriceCents > 50000) {
    throw new Error("Keep paid-drop unlocks under $500 for beta.");
  }

  enforceRateLimit({
    key: `creator:locked-message:${viewer.id}`,
    limit: 10,
    windowMs: 60 * 1000,
    message: "Too many paid drops sent in a short time. Please wait a minute and try again.",
  });

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: input.conversationId,
      creatorProfileId: viewer.creatorProfile.id,
    },
    include: {
      fan: {
        include: {
          profile: true,
        },
      },
    },
  });

  if (!conversation) {
    throw new Error("That conversation could not be found.");
  }

  const sentAt = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.message.create({
      data: {
        conversationId: conversation.id,
        senderId: viewer.id,
        body,
        previewText: buildPreviewText(body),
        isLocked: true,
        unlockPriceCents,
        currency: viewer.creatorProfile?.currency ?? "usd",
      },
    });

    await tx.conversation.update({
      where: {
        id: conversation.id,
      },
      data: {
        lastMessageAt: sentAt,
      },
    });
  });

  return {
    conversationId: conversation.id,
    fanName: conversation.fan.profile?.displayName ?? "fan",
    unlockPriceCents,
  };
}
