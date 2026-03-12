import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { CreatorState, type UserRole } from "@/generated/prisma/client";
import { canAccessSection, type AppSection } from "@/lib/auth/access";
import { findOrLinkUserBySupabaseIdentity, type AppViewer } from "@/lib/auth/user-identity";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Viewer = AppViewer;

export class AccessDeniedError extends Error {
  constructor(message = "You do not have access to this area.") {
    super(message);
    this.name = "AccessDeniedError";
  }
}

export class PendingApprovalError extends AccessDeniedError {
  constructor(message = "Creator access is pending approval.") {
    super(message);
    this.name = "PendingApprovalError";
  }
}

function getSectionDeniedMessage(section: AppSection) {
  if (section === "fan" || section === "creator") {
    return "Sign in is required to access this area.";
  }

  if (section === "admin") {
    return "Admin access is required to access this area.";
  }

  return "You do not have access to this area.";
}

export const getOptionalViewer = cache(async (): Promise<Viewer | null> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const viewer = await findOrLinkUserBySupabaseIdentity(user);

  return viewer?.isActive ? viewer : null;
});

export async function requireViewer() {
  const viewer = await getOptionalViewer();

  if (!viewer) {
    throw new AccessDeniedError("Authentication is required.");
  }

  return viewer;
}

export async function requireRole(role: UserRole) {
  const viewer = await requireViewer();

  if (viewer.role !== role) {
    throw new AccessDeniedError(`${role.toLowerCase()} access is required.`);
  }

  return viewer;
}

export function hasApprovedCreatorAccess(viewer: Pick<Viewer, "role" | "creatorProfile"> | null) {
  return viewer?.role === "CREATOR" && viewer.creatorProfile?.state === CreatorState.APPROVED;
}

export function getViewerHomePath(viewer: Pick<Viewer, "role" | "creatorProfile">) {
  if (viewer.role === "ADMIN") {
    return "/admin";
  }

  if (viewer.role === "CREATOR") {
    return hasApprovedCreatorAccess(viewer) ? "/creator" : "/creator-access";
  }

  return "/fan";
}

export async function requireSectionAccess(section: AppSection) {
  const viewer = await getOptionalViewer();

  if (section === "creator" && viewer?.role === "CREATOR" && !hasApprovedCreatorAccess(viewer)) {
    throw new PendingApprovalError();
  }

  if (!canAccessSection(viewer?.role ?? null, section)) {
    throw new AccessDeniedError(getSectionDeniedMessage(section));
  }

  return viewer;
}

export async function redirectIfUnauthorized(
  section: AppSection,
  redirectPath = "/login",
) {
  try {
    await requireSectionAccess(section);
  } catch (error) {
    if (error instanceof PendingApprovalError) {
      redirect("/creator-access");
    }

    if (error instanceof AccessDeniedError) {
      redirect(redirectPath);
    }

    throw error;
  }
}
