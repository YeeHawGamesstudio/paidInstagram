import Link from "next/link";
import { AlertTriangle, ArrowRight, ShieldCheck } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { acknowledgeAdultAccessAction } from "@/app/actions/compliance";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ADULT_ACCESS_COOKIE_NAME,
  isAdultAccessAcknowledged,
  normalizeComplianceRedirectTarget,
} from "@/lib/compliance/scaffolding";

type AdultAccessGatePageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function AdultAccessGatePage({ searchParams }: AdultAccessGatePageProps) {
  const params = await searchParams;
  const nextTarget = normalizeComplianceRedirectTarget(params.next);
  const cookieStore = await cookies();

  if (isAdultAccessAcknowledged(cookieStore.get(ADULT_ACCESS_COOKIE_NAME)?.value)) {
    redirect(nextTarget);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1.05fr)_22rem]">
        <Card className="border-white/10 bg-[radial-gradient(circle_at_top,_rgba(201,169,110,0.18),_transparent_22rem),linear-gradient(180deg,_rgba(21,21,26,0.98),_rgba(10,10,14,0.98))] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">18+ gate required</p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl leading-none sm:text-6xl">
            Adult-content access needs a clear acknowledgment first.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            OnlyClaw uses this 18+ gate to establish the adult-content boundary for the current beta. It is a
            self-attestation checkpoint, not a full age-verification, identity-verification, or jurisdiction review
            system.
          </p>

          <div className="mt-6 grid gap-3">
            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-medium text-foreground">Before entering, you confirm:</p>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-muted-foreground">
                <li>You are at least 18 years old.</li>
                <li>You understand the product may contain adult-oriented creator content.</li>
                <li>You accept the platform&rsquo;s content policies and terms of service.</li>
              </ul>
            </div>

            <div className="rounded-[1.5rem] border border-amber-400/20 bg-amber-400/8 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 size-4 text-amber-300" />
                <p className="text-sm leading-6 text-foreground/82">
                  This is a self-attestation gate. By proceeding, you confirm you meet the age requirement and accept
                  the platform&rsquo;s content policies. Additional verification may be required in the future.
                </p>
              </div>
            </div>
          </div>

          <form action={acknowledgeAdultAccessAction} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <input type="hidden" name="next" value={nextTarget} />
            <Button type="submit" size="lg">
              I am 18+ and want to continue
              <ArrowRight className="size-4" />
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/adult-disclaimer">Read the disclaimer first</Link>
            </Button>
          </form>
        </Card>

        <aside className="grid gap-4 self-start">
          <Card className="border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="size-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.24em]">Compliance</p>
            </div>
            <div className="mt-4 grid gap-3 text-sm leading-6 text-muted-foreground">
              <p>Review our policies to understand the rules, content standards, and reporting options available on OnlyClaw.</p>
              <p>Creator approval, verification, and moderation are active controls to keep the platform safe.</p>
              <p>Use the links below to review our full policy set before continuing.</p>
            </div>
          </Card>

          <Card className="border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Policy pages</p>
            <div className="mt-4 grid gap-2 text-sm">
              <Link href="/terms" className="text-muted-foreground transition hover:text-foreground">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-muted-foreground transition hover:text-foreground">
                Privacy Policy
              </Link>
              <Link href="/content-policy" className="text-muted-foreground transition hover:text-foreground">
                Content Policy
              </Link>
              <Link href="/acceptable-use" className="text-muted-foreground transition hover:text-foreground">
                Acceptable Use Policy
              </Link>
              <Link href="/dmca" className="text-muted-foreground transition hover:text-foreground">
                DMCA / Takedown
              </Link>
            </div>
          </Card>
        </aside>
      </div>
    </main>
  );
}
