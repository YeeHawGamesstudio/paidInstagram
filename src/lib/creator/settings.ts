import "server-only";

import { prisma } from "@/lib/prisma/client";
import { requireRole } from "@/lib/auth/viewer";
import { enforceRateLimit } from "@/lib/security/rate-limit";

function normalizeText(value: string) {
  return value.trim();
}

function normalizeOptionalText(value: string) {
  const normalized = value.trim();
  return normalized || null;
}

function normalizeUsername(value: string, displayName: string) {
  const source = value.trim() || displayName.trim();
  const slug = source
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);

  return slug || "creator";
}

export async function updateCreatorSettings(input: {
  displayName: string;
  username: string;
  headline: string;
  bio: string;
  rightsContactEmail: string;
  adultDisclosure: string;
}) {
  const viewer = await requireRole("CREATOR");

  if (!viewer.creatorProfile || !viewer.profile) {
    throw new Error("The active creator account is missing profile data.");
  }

  const displayName = normalizeText(input.displayName);
  const bio = normalizeText(input.bio);
  const username = normalizeUsername(input.username, displayName);

  if (!displayName) {
    throw new Error("Display name is required.");
  }

  if (displayName.length < 2 || displayName.length > 40) {
    throw new Error("Display name must be between 2 and 40 characters.");
  }

  if (bio.length > 500) {
    throw new Error("Bio must stay under 500 characters.");
  }

  if (input.rightsContactEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.rightsContactEmail.trim())) {
    throw new Error("Enter a valid rights contact email.");
  }

  enforceRateLimit({
    key: `creator:settings:${viewer.id}`,
    limit: 15,
    windowMs: 60 * 1000,
    message: "Too many settings updates in a short time. Please wait a minute and try again.",
  });

  const usernameOwner = await prisma.profile.findUnique({
    where: {
      username,
    },
    select: {
      userId: true,
    },
  });

  if (usernameOwner && usernameOwner.userId !== viewer.id) {
    throw new Error("That username is already in use.");
  }

  const previousSlug = viewer.creatorProfile.slug;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: {
        id: viewer.id,
      },
      data: {
        name: displayName,
        profile: {
          update: {
            displayName,
            username,
            bio,
          },
        },
        creatorProfile: {
          update: {
            slug: username,
            headline: normalizeOptionalText(input.headline),
            bio,
            dmcaContactEmail: normalizeOptionalText(input.rightsContactEmail),
            adultContentDisclosure: normalizeOptionalText(input.adultDisclosure),
          },
        },
      },
    });
  });

  return {
    previousSlug,
    nextSlug: username,
  };
}
