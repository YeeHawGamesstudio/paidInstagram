import Link from "next/link";
import { CreditCard, Receipt, WalletCards } from "lucide-react";

import { FanPageHeader } from "@/components/fan/fan-page-header";
import { EmptyStateCard } from "@/components/shared/empty-state-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getFanBillingStatusTone } from "@/lib/fan/presentation";
import { formatAmount, getFanBillingEntries } from "@/lib/fan/server-data";

export default async function FanBillingPage() {
  const fanBillingEntries = await getFanBillingEntries();
  const paidCount = fanBillingEntries.filter((entry) => entry.status === "PAID").length;
  const attentionCount = fanBillingEntries.filter((entry) => entry.status !== "PAID").length;

  return (
    <div className="grid gap-4 sm:gap-5">
      <FanPageHeader
        eyebrow="Billing"
        title="Billing center"
        description="Review membership charges, paid unlocks, and recent billing activity in one place."
        actions={
          <Button asChild variant="outline" className="w-full justify-center sm:w-auto">
            <Link href="/fan/subscriptions">Manage memberships</Link>
          </Button>
        }
      />

      <Card className="border-white/10 bg-[radial-gradient(circle_at_top_right,_rgba(201,169,110,0.08),_transparent_16rem),linear-gradient(180deg,_rgba(20,20,24,0.96),_rgba(11,11,14,0.98))] p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">Billing snapshot</p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl">Charges, unlocks, and renewals in one place</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Use billing to review recent purchases quickly, spot anything that needs follow-up, and jump back to memberships if a renewal is coming up.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="success" className="text-xs normal-case tracking-normal">
              {paidCount} paid
            </StatusBadge>
            <StatusBadge tone={attentionCount ? "warning" : "neutral"} className="text-xs normal-case tracking-normal">
              {attentionCount} needs review
            </StatusBadge>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="border-white/10 bg-[linear-gradient(180deg,_rgba(20,20,24,0.98),_rgba(11,11,14,0.96))] p-5 sm:p-6">
          <div className="flex items-center gap-2 text-primary">
            <WalletCards className="size-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.24em]">Billing overview</span>
          </div>
          <h2 className="mt-3 font-display text-3xl">Keep track of premium access and charges</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Membership purchases and paid message unlocks are recorded here so fans can quickly confirm what they paid for,
            what is still pending, and whether a charge needs follow-up.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">What shows up here</p>
              <p className="mt-2 text-lg font-semibold text-foreground">Memberships and unlocks</p>
              <p className="mt-1 text-sm text-muted-foreground">Recurring subscriptions and one-off premium drops are listed in the same ledger.</p>
            </div>
            <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Charge status</p>
              <p className="mt-2 text-lg font-semibold text-foreground">Pending, paid, refunded</p>
              <p className="mt-1 text-sm text-muted-foreground">Each entry keeps its current state visible so billing history is easier to trust at a glance.</p>
            </div>
          </div>
        </Card>

        <Card className="border-white/10 bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div className="flex items-center gap-2 text-primary">
            <CreditCard className="size-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.22em]">Quick checks</span>
          </div>
          <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
            <div className="rounded-3xl border border-white/8 bg-black/20 px-4 py-3">Review the latest charges before renewing or canceling a membership.</div>
            <div className="rounded-3xl border border-white/8 bg-black/20 px-4 py-3">Use status labels to spot pending, refunded, or disputed activity quickly.</div>
            <div className="rounded-3xl border border-white/8 bg-black/20 px-4 py-3">Jump back to memberships when you need to manage active premium access.</div>
          </div>
        </Card>
      </section>

      <section className="grid gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">Recent activity</p>
          <h2 className="mt-2 font-display text-3xl">Billing history</h2>
        </div>

        <div className="grid gap-3">
          {fanBillingEntries.length ? (
            fanBillingEntries.map((entry) => (
              <Card key={entry.id} className="border-white/10 bg-white/[0.04] p-4 sm:p-5">
                <div className="grid gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-primary">
                      <Receipt className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">{entry.label}</p>
                      <p className="text-sm text-muted-foreground">{entry.detail}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-2xl">{formatAmount(entry.amountCents, entry.currency)}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge tone={getFanBillingStatusTone(entry.status)} className="text-xs">
                      {entry.status}
                    </StatusBadge>
                    <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-xs text-muted-foreground">
                      {entry.label.includes("unlock") ? "One-time unlock" : "Membership charge"}
                    </span>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <EmptyStateCard>
              <div className="grid gap-4">
                <p>No billing history yet. Membership charges and paid unlocks will appear here as soon as you use them.</p>
                <div className="grid gap-2 sm:flex sm:flex-wrap">
                  <Button asChild className="w-full justify-center sm:w-auto">
                    <Link href="/fan/subscriptions">Browse memberships</Link>
                  </Button>
                </div>
              </div>
            </EmptyStateCard>
          )}
        </div>
      </section>
    </div>
  );
}
