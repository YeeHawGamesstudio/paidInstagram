import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getOptionalViewer,
  getViewerHomePath,
  hasApprovedCreatorAccess,
} from "@/lib/auth/viewer";

export default async function CreatorAccessPage() {
  const viewer = await getOptionalViewer();

  if (!viewer) {
    redirect("/login");
  }

  if (viewer.role !== "CREATOR") {
    redirect(getViewerHomePath(viewer));
  }

  if (hasApprovedCreatorAccess(viewer)) {
    redirect("/creator");
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          Creator access pending
        </p>
        <h1 className="font-display text-5xl leading-none sm:text-6xl">
          Your creator account is waiting for approval.
        </h1>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
          You can sign in successfully, but creator studio routes stay closed until your creator
          profile is approved. This keeps publishing and subscriber tools limited to reviewed
          creators only.
        </p>
      </section>

      <Card className="border-white/10 bg-[linear-gradient(180deg,_rgba(20,20,24,0.98),_rgba(11,11,14,0.96))] p-6 sm:p-8">
        <div className="grid gap-4">
          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Signed in as</p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {viewer.profile?.displayName ?? viewer.name ?? viewer.email}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{viewer.email}</p>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4 text-sm leading-7 text-muted-foreground">
            Once your creator application is approved, sign in again and you will be routed to the
            creator dashboard automatically.
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/discover">Explore public pages</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Return home</Link>
            </Button>
          </div>
        </div>
      </Card>
    </main>
  );
}
