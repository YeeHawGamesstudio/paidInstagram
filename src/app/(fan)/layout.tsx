import type { ReactNode } from "react";

import { FanShell } from "@/components/fan/fan-shell";
import { redirectIfUnauthorized } from "@/lib/auth/viewer";

export const dynamic = "force-dynamic";

export default async function FanLayout({ children }: Readonly<{ children: ReactNode }>) {
  await redirectIfUnauthorized("fan");

  return <FanShell>{children}</FanShell>;
}
