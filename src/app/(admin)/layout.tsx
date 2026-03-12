import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { redirectIfUnauthorized } from "@/lib/auth/viewer";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  await redirectIfUnauthorized("admin", "/");

  return <AdminShell>{children}</AdminShell>;
}
