import "server-only";

import { requireRole } from "@/lib/auth/viewer";
import { prisma } from "@/lib/prisma/client";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import { creatorPricingSettings } from "@/lib/creator/demo-data";

function clampMonthlyPrice(value: number) {
  return Math.min(
    creatorPricingSettings.maxMonthlyPriceCents,
    Math.max(creatorPricingSettings.minMonthlyPriceCents, value),
  );
}

export async function updateCreatorMembershipPrice(input: { monthlyPriceCents: number }) {
  const viewer = await requireRole("CREATOR");

  if (!viewer.creatorProfile) {
    throw new Error("The active creator account is missing a creator profile.");
  }

  if (!Number.isFinite(input.monthlyPriceCents)) {
    throw new Error("Enter a valid monthly price.");
  }

  const monthlyPriceCents = clampMonthlyPrice(Math.round(input.monthlyPriceCents));

  enforceRateLimit({
    key: `creator:pricing:${viewer.id}`,
    limit: 15,
    windowMs: 60 * 1000,
    message: "Too many pricing updates in a short time. Please wait a minute and try again.",
  });

  await prisma.creatorProfile.update({
    where: {
      id: viewer.creatorProfile.id,
    },
    data: {
      subscriptionPriceCents: monthlyPriceCents,
    },
  });

  return {
    creatorSlug: viewer.creatorProfile.slug,
    monthlyPriceCents,
  };
}
