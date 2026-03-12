import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { type Prisma, type UserRole } from "@/generated/prisma/client";
import { canAccessSection, type AppSection } from "@/lib/auth/access";
import { env } from "@/lib/config/env";
import { prisma } from "@/lib/prisma/client";

const viewerInclude = {
  creatorProfile: true,
  profile: true,
} satisfies Prisma.UserInclude;

export type Viewer = Prisma.UserGetPayload<{
  include: typeof viewerInclude;
}>;

export class AccessDeniedError extends Error {
  constructor(message = "You do not have access to this area.") {
    super(message);
    this.name = "AccessDeniedError";
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
  if (!env.allowDemoAuth || !env.demoViewerEmail) {
    return null;
  }

  const preferredViewer = await prisma.user.findUnique({
    where: {
      email: env.demoViewerEmail,
    },
    include: viewerInclude,
  });

  if (
    preferredViewer?.isActive &&
    (!env.demoViewerRole || preferredViewer.role === env.demoViewerRole)
  ) {
    return preferredViewer;
  }

  return null;
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

export async function requireSectionAccess(section: AppSection) {
  const viewer = await getOptionalViewer();

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
    if (error instanceof AccessDeniedError) {
      redirect(redirectPath);
    }

    throw error;
  }
}
