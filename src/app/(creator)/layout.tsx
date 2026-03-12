import type { ReactNode } from "react";

import { CreatorShell } from "@/components/creator/creator-shell";
import { redirectIfUnauthorized } from "@/lib/auth/viewer";

export const dynamic = "force-dynamic";

export default async function CreatorLayout({ children }: Readonly<{ children: ReactNode }>) {
  await redirectIfUnauthorized("creator");

  return <CreatorShell>{children}</CreatorShell>;
}
