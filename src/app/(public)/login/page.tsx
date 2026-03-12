import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_30rem] lg:gap-10 lg:px-8 lg:py-12">
      <section className="flex flex-col justify-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Welcome back</p>
        <h1 className="mt-3 max-w-2xl font-display text-5xl leading-none sm:text-6xl">Return to a premium creator space.</h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
          Public discovery is open to everyone. Soft-launch access for fan, creator, and admin accounts is coordinated
          separately so protected areas stay intentional and limited.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Card className="border-white/10 bg-white/[0.03] p-5">
            <p className="font-display text-2xl">Discovery</p>
            <p className="mt-2 text-sm text-muted-foreground">Browse creators and public previews without account access.</p>
          </Card>
          <Card className="border-white/10 bg-white/[0.03] p-5">
            <p className="font-display text-2xl">Provisioned</p>
            <p className="mt-2 text-sm text-muted-foreground">Accounts are assigned directly so protected flows can be reviewed safely.</p>
          </Card>
          <Card className="border-white/10 bg-white/[0.03] p-5">
            <p className="font-display text-2xl">Gated</p>
            <p className="mt-2 text-sm text-muted-foreground">Only approved staging users should see protected fan, creator, and admin areas.</p>
          </Card>
        </div>
      </section>

      <Card className="border-white/10 bg-[linear-gradient(180deg,_rgba(20,20,24,0.98)_0%,_rgba(11,11,14,0.96)_100%)] p-6 sm:p-8">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Log in</p>
          <h2 className="font-display text-4xl">Access is coordinated</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Self-serve sign-in is not part of the soft launch. Use a provisioned account when validating protected flows.
          </p>
        </div>

        <form className="mt-8 grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="provisioned-user@example.com" disabled />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Provisioned separately" disabled />
          </div>

          <Button type="button" size="lg" disabled>
            Access is provisioned directly
          </Button>
        </form>

        <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-muted-foreground">
          Public routes remain available now. Protected route validation should use a provisioned account and the intended
          launch data set.
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          Need access details?{" "}
          <Link href="/signup" className="text-foreground transition hover:text-primary">
            Review launch access
          </Link>
        </p>
      </Card>
    </main>
  );
}
