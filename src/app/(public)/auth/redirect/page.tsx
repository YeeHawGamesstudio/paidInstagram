import { redirect } from "next/navigation";

import { getOptionalViewer, getViewerHomePath } from "@/lib/auth/viewer";

export default async function AuthRedirectPage() {
  const viewer = await getOptionalViewer();

  if (!viewer) {
    redirect("/login");
  }

  redirect(getViewerHomePath(viewer));
}
