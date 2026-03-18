import type { ReactNode } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { redirectIfUnauthorized } from "@/lib/auth/viewer";
import { getAdminOverviewMetrics } from "@/lib/moderation/service";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  await redirectIfUnauthorized("admin", "/");
  const metrics = await getAdminOverviewMetrics();

  return <AdminShell metrics={metrics}>{children}</AdminShell>;
}
