import "server-only";

import type { User } from "@supabase/supabase-js";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma/client";

const viewerInclude = {
  creatorProfile: true,
  profile: true,
} satisfies Prisma.UserInclude;

export type AppViewer = Prisma.UserGetPayload<{
  include: typeof viewerInclude;
}>;

export { viewerInclude };

function normalizeEmail(email: string | undefined) {
  return email?.trim().toLowerCase();
}

export async function findOrLinkUserBySupabaseIdentity(
  supabaseUser: Pick<User, "email" | "id">,
): Promise<AppViewer | null> {
  const normalizedEmail = normalizeEmail(supabaseUser.email);

  const existingLinkedUser = await prisma.user.findUnique({
    where: {
      supabaseAuthUserId: supabaseUser.id,
    },
    include: viewerInclude,
  });

  if (existingLinkedUser) {
    return existingLinkedUser;
  }

  if (!normalizedEmail) {
    return null;
  }

  const userByEmail = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
    include: viewerInclude,
  });

  if (!userByEmail) {
    return null;
  }

  if (userByEmail.supabaseAuthUserId) {
    return userByEmail.supabaseAuthUserId === supabaseUser.id ? userByEmail : null;
  }

  return prisma.user.update({
    where: {
      id: userByEmail.id,
    },
    data: {
      supabaseAuthUserId: supabaseUser.id,
    },
    include: viewerInclude,
  });
}
