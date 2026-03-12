import Link from "next/link";
import { redirect } from "next/navigation";

import { SignupForm } from "@/components/auth/signup-form";
import { Card } from "@/components/ui/card";
import { getOptionalViewer, getViewerHomePath } from "@/lib/auth/viewer";
import { roleLabels } from "@/lib/auth/roles";

const roleOptions = [
  {
    label: roleLabels.FAN,
    value: "FAN",
    description: "Browse creators, unlock memberships, and participate in premium fan flows.",
  },
  {
    label: roleLabels.CREATOR,
    value: "CREATOR",
    description: "Manage profile presentation, publishing, and premium audience surfaces.",
  },
] as const;

export default async function SignupPage() {
  const viewer = await getOptionalViewer();

  if (viewer) {
    redirect(getViewerHomePath(viewer));
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_32rem] lg:gap-10 lg:px-8 lg:py-12">
      <section className="flex flex-col justify-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Controlled access</p>
        <h1 className="mt-3 max-w-2xl font-display text-5xl leading-none sm:text-6xl">Access is opening in phases.</h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
          Public discovery is open now. Fan accounts are ready immediately, while creator accounts can register and then
          wait for manual approval before creator tools open.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {roleOptions.map((option) => (
            <Card key={option.value} className="border-white/10 bg-white/[0.03] p-5">
              <p className="font-display text-2xl">{option.label}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{option.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <Card className="border-white/10 bg-[linear-gradient(180deg,_rgba(20,20,24,0.98)_0%,_rgba(11,11,14,0.96)_100%)] p-6 sm:p-8">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Sign up</p>
          <h2 className="font-display text-4xl">Create your account</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Fan accounts can start right away. Creator applicants can register now and return once approval is complete.
          </p>
        </div>

        <SignupForm />

        <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-muted-foreground">
          Creator studio access remains approval-gated even after registration. Admin accounts are still provisioned manually.
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-foreground transition hover:text-primary">
            Log in
          </Link>
        </p>
      </Card>
    </main>
  );
}
