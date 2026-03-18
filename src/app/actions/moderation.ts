"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ReportStatus } from "@/generated/prisma/client";
import {
  buildReportReturnUrl,
  createModerationReport,
  getModerationActionErrorMessage,
  normalizeReportTargetType,
  takeDownPostFromReport,
  updateCreatorModerationState,
  updateModerationReportStatus,
  updateUserModerationState,
} from "@/lib/moderation/service";

function revalidateAdminModerationPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/reports");
  revalidatePath("/admin/review");
  revalidatePath("/admin/creators");
  revalidatePath("/admin/users");
  revalidatePath("/admin/audit");
}

function revalidatePublicModerationPaths(creatorSlug?: string) {
  revalidatePath("/");
  revalidatePath("/discover");

  if (creatorSlug) {
    revalidatePath(`/creators/${creatorSlug}`);
  }
}

function requireModeratorNote(formData: FormData) {
  const notes = formData.get("notes")?.toString().trim();

  if (!notes) {
    throw new Error("Add a moderator note before saving.");
  }

  return notes;
}

export async function submitModerationReportAction(formData: FormData) {
  const target = normalizeReportTargetType(formData.get("targetType")?.toString());
  const returnUrl = buildReportReturnUrl({
    target: formData.get("target")?.toString(),
    subject: formData.get("subject")?.toString(),
    url: formData.get("sourceUrl")?.toString(),
    targetUserId: formData.get("targetUserId")?.toString(),
    targetCreatorProfileId: formData.get("targetCreatorProfileId")?.toString(),
    targetPostId: formData.get("targetPostId")?.toString(),
    targetMessageId: formData.get("targetMessageId")?.toString(),
  });

  if (!target) {
    redirect(
      buildReportReturnUrl({
        target: formData.get("target")?.toString(),
        subject: formData.get("subject")?.toString(),
        url: formData.get("sourceUrl")?.toString(),
        error: "Select a valid report target before submitting.",
      }),
    );
  }

  try {
    await createModerationReport({
      targetType: target,
      reason: formData.get("reason")?.toString() ?? "OTHER",
      reporterNotes: formData.get("reporterNotes")?.toString(),
      subject: formData.get("subject")?.toString(),
      sourceUrl: formData.get("sourceUrl")?.toString(),
      targetUserId: formData.get("targetUserId")?.toString(),
      targetCreatorProfileId: formData.get("targetCreatorProfileId")?.toString(),
      targetPostId: formData.get("targetPostId")?.toString(),
      targetMessageId: formData.get("targetMessageId")?.toString(),
    });

    revalidateAdminModerationPaths();
    redirect(
      buildReportReturnUrl({
        target: formData.get("target")?.toString(),
        subject: formData.get("subject")?.toString(),
        url: formData.get("sourceUrl")?.toString(),
        targetUserId: formData.get("targetUserId")?.toString(),
        targetCreatorProfileId: formData.get("targetCreatorProfileId")?.toString(),
        targetPostId: formData.get("targetPostId")?.toString(),
        targetMessageId: formData.get("targetMessageId")?.toString(),
        submitted: "1",
      }),
    );
  } catch (error) {
    redirect(
      buildReportReturnUrl({
        target: formData.get("target")?.toString(),
        subject: formData.get("subject")?.toString(),
        url: formData.get("sourceUrl")?.toString(),
        targetUserId: formData.get("targetUserId")?.toString(),
        targetCreatorProfileId: formData.get("targetCreatorProfileId")?.toString(),
        targetPostId: formData.get("targetPostId")?.toString(),
        targetMessageId: formData.get("targetMessageId")?.toString(),
        error: getModerationActionErrorMessage(error),
      }),
    );
  }
}

export async function updateModerationReportStatusAction(formData: FormData) {
  const reportId = formData.get("reportId")?.toString();
  const status = formData.get("status")?.toString();

  if (
    !reportId ||
    (status !== ReportStatus.REVIEWED && status !== ReportStatus.RESOLVED && status !== ReportStatus.DISMISSED)
  ) {
    throw new Error("Invalid report moderation input.");
  }

  const notes = requireModeratorNote(formData);

  const result = await updateModerationReportStatus({
    reportId,
    status,
    notes,
  });

  revalidateAdminModerationPaths();
  revalidatePublicModerationPaths(result.creatorSlug);
}

export async function takeDownReportedPostAction(formData: FormData) {
  const reportId = formData.get("reportId")?.toString();

  if (!reportId) {
    throw new Error("Missing report id.");
  }

  const result = await takeDownPostFromReport({
    reportId,
    notes: requireModeratorNote(formData),
  });

  revalidateAdminModerationPaths();
  revalidatePublicModerationPaths(result.creatorSlug);
}

export async function updateCreatorModerationStateAction(formData: FormData) {
  const creatorProfileId = formData.get("creatorProfileId")?.toString();
  const action = formData.get("action")?.toString();

  if (!creatorProfileId || (action !== "APPROVE" && action !== "SUSPEND" && action !== "RESTORE")) {
    throw new Error("Invalid creator moderation input.");
  }

  const notes = requireModeratorNote(formData);

  const result = await updateCreatorModerationState({
    creatorProfileId,
    action,
    notes,
    reportId: formData.get("reportId")?.toString() || undefined,
  });

  revalidateAdminModerationPaths();
  revalidatePublicModerationPaths(result.creatorSlug);
}

export async function updateUserModerationStateAction(formData: FormData) {
  const userId = formData.get("userId")?.toString();
  const action = formData.get("action")?.toString();

  if (!userId || (action !== "SUSPEND" && action !== "RESTORE")) {
    throw new Error("Invalid user moderation input.");
  }

  const notes = requireModeratorNote(formData);

  await updateUserModerationState({
    userId,
    action,
    notes,
    reportId: formData.get("reportId")?.toString() || undefined,
  });

  revalidateAdminModerationPaths();
}
