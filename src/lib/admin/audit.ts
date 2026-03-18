import "server-only";

import { cache } from "react";

import type { Prisma } from "@/generated/prisma/client";
import { requireRole } from "@/lib/auth/viewer";
import type { AdminActionLogEntry } from "@/lib/admin/demo-data";
import { prisma } from "@/lib/prisma/client";

const adminActionInclude = {
  admin: {
    include: {
      profile: true,
    },
  },
  targetUser: {
    include: {
      profile: true,
    },
  },
  report: true,
  creatorApplication: true,
} satisfies Prisma.AdminActionLogInclude;

function formatTimeAgo(date: Date, referenceTime: Date) {
  const diffMs = referenceTime.getTime() - date.getTime();
  const diffMinutes = Math.max(Math.floor(diffMs / (1000 * 60)), 0);

  if (diffMinutes < 1) {
    return "just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

function resolveTargetLabel(entry: Prisma.AdminActionLogGetPayload<{ include: typeof adminActionInclude }>) {
  if (entry.targetUser?.profile?.username) {
    return `@${entry.targetUser.profile.username}`;
  }

  if (entry.targetUser?.profile?.displayName) {
    return entry.targetUser.profile.displayName;
  }

  if (entry.reportId) {
    return `report:${entry.reportId}`;
  }

  if (entry.creatorApplication?.requestedSlug) {
    return `creator-application:${entry.creatorApplication.requestedSlug}`;
  }

  return "platform";
}

function resolveCategory(entry: Prisma.AdminActionLogGetPayload<{ include: typeof adminActionInclude }>) {
  if (entry.metadata && typeof entry.metadata === "object" && !Array.isArray(entry.metadata)) {
    const category = entry.metadata.category;

    if (typeof category === "string" && category.trim()) {
      return category;
    }
  }

  return "admin-action";
}

function normalizeActionLabel(action: string) {
  if (!action.includes("_")) {
    return action;
  }

  return action
    .replace(/_/g, " ")
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function hasMeaningfulNotes(notes: string | null | undefined) {
  if (typeof notes !== "string") {
    return false;
  }

  return notes.trim().length > 0;
}

function isLowSignalAction(action: string, notes: string | null | undefined) {
  if (hasMeaningfulNotes(notes)) {
    return false;
  }

  return (
    action === "Marked report reviewed" ||
    action === "Resolved report" ||
    action === "Dismissed report" ||
    action === "Restored user" ||
    action === "Restored creator" ||
    action === "Approved creator"
  );
}

export const listRecentAdminActions = cache(async (limit = 25): Promise<AdminActionLogEntry[]> => {
  await requireRole("ADMIN");
  const referenceTime = new Date();

  const entries = await prisma.adminActionLog.findMany({
    include: adminActionInclude,
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });

  return entries.map((entry) => {
    const actor = entry.admin.profile?.displayName ?? entry.admin.profile?.username ?? entry.admin.email;
    const action = normalizeActionLabel(entry.action);
    const hasNotes = hasMeaningfulNotes(entry.notes);

    return {
      id: entry.id,
      actor,
      category: resolveCategory(entry),
      action,
      target: resolveTargetLabel(entry),
      notes: hasNotes ? entry.notes!.trim() : "No note provided.",
      when: formatTimeAgo(entry.createdAt, referenceTime),
      hasNotes,
      isLowSignal: isLowSignalAction(action, entry.notes),
      groupedCount: 1,
    };
  });
});

export async function recordAdminAction(input: {
  action: string;
  notes?: string;
  metadata?: Prisma.InputJsonValue;
  targetUserId?: string;
  reportId?: string;
  creatorApplicationId?: string;
}) {
  const admin = await requireRole("ADMIN");

  return prisma.adminActionLog.create({
    data: {
      adminId: admin.id,
      action: input.action,
      notes: input.notes,
      metadata: input.metadata,
      targetUserId: input.targetUserId,
      reportId: input.reportId,
      creatorApplicationId: input.creatorApplicationId,
    },
  });
}
