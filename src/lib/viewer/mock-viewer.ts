import "server-only";

import { cache } from "react";

import { type Prisma, UserRole } from "@/generated/prisma/client";
import { env } from "@/lib/config/env";
import { prisma } from "@/lib/prisma/client";

const preferredMockFanEmail =
  !env.demoViewerRole || env.demoViewerRole === "FAN" ? env.demoViewerEmail : undefined;

type MockViewer = Prisma.UserGetPayload<{
  include: {
    profile: true;
  };
}> & {
  profile: NonNullable<
    Prisma.UserGetPayload<{
      include: {
        profile: true;
      };
    }>["profile"]
  >;
};

export const getMockViewer = cache(async (): Promise<MockViewer> => {
  if (preferredMockFanEmail) {
    const preferredViewer = await prisma.user.findUnique({
      where: {
        email: preferredMockFanEmail,
      },
      include: {
        profile: true,
      },
    });

    if (preferredViewer?.profile && preferredViewer.role === UserRole.FAN) {
      return preferredViewer as MockViewer;
    }
  }

  const fallbackViewer = await prisma.user.findFirst({
    where: {
      role: UserRole.FAN,
      isActive: true,
      profile: {
        isNot: null,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    include: {
      profile: true,
    },
  });

  if (!fallbackViewer?.profile) {
    throw new Error("No mock fan user is available for OnlyClaw.");
  }

  return fallbackViewer as MockViewer;
});
