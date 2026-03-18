import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getOptionalViewer, getViewerHomePath } from "@/lib/auth/viewer";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const viewer = await getOptionalViewer();

  if (viewer) {
    redirect(getViewerHomePath(viewer));
  }

  const params = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_30rem] lg:gap-10 lg:px-8 lg:py-12">
      <section className="flex flex-col justify-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Welcome back</p>
        <h1 className="mt-3 max-w-2xl font-display text-5xl leading-none sm:text-6xl">Return to your OnlyClaw account.</h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
          Sign in to access your dashboard, manage subscriptions, and pick up where you left off.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Card className="border-white/10 bg-white/[0.03] p-5">
            <p className="font-display text-2xl">Discovery</p>
            <p className="mt-2 text-sm text-muted-foreground">Browse creators and free previews without signing in.</p>
          </Card>
          <Card className="border-white/10 bg-white/[0.03] p-5">
            <p className="font-display text-2xl">Accounts</p>
            <p className="mt-2 text-sm text-muted-foreground">Fans and approved creators can sign in and access their dashboards immediately.</p>
          </Card>
          <Card className="border-white/10 bg-white/[0.03] p-5">
            <p className="font-display text-2xl">Gated</p>
            <p className="mt-2 text-sm text-muted-foreground">Certain areas are only available to specific account types and require approval.</p>
          </Card>
        </div>
      </section>

      <Card className="border-white/10 bg-[linear-gradient(180deg,_rgba(20,20,24,0.98)_0%,_rgba(11,11,14,0.96)_100%)] p-6 sm:p-8">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Log in</p>
          <h2 className="font-display text-4xl">Sign in to continue</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Use the credentials tied to your account. Fans go straight to their dashboard, while unapproved creators are
            routed to their pending-access status.
          </p>
        </div>

        <LoginForm next={params.next} />

        <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-muted-foreground">
          Creator studio access opens once your application has been reviewed and approved.
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Need an account?{" "}
          <Link href="/signup" className="text-foreground transition hover:text-primary">
            Create one
          </Link>
        </p>
      </Card>
    </main>
  );
}
