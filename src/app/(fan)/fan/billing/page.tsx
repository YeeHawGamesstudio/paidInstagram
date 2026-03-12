import { CreditCard, Receipt, WalletCards } from "lucide-react";

import { FanPageHeader } from "@/components/fan/fan-page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import { getFanBillingStatusTone } from "@/lib/fan/presentation";
import { formatAmount, getFanBillingEntries } from "@/lib/fan/server-data";

export default async function FanBillingPage() {
  const fanBillingEntries = await getFanBillingEntries();

  return (
    <div className="grid gap-5">
      <FanPageHeader
        eyebrow="Billing"
        title="Billing center"
        description="Transactions below are persisted through the billing domain so subscriptions and unlocks can move from mock handling to a live provider without rewriting the product UX."
      />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="border-white/10 bg-[linear-gradient(180deg,_rgba(20,20,24,0.98),_rgba(11,11,14,0.96))] p-5 sm:p-6">
          <div className="flex items-center gap-2 text-primary">
            <WalletCards className="size-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.24em]">Architecture status</span>
          </div>
          <h2 className="mt-3 font-display text-3xl">Billing lifecycle is now modeled</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Payment methods are still integration-boundary placeholders, but subscription purchases and locked-message unlocks now
            create lifecycle-aware transaction records that can be reconciled, refunded, disputed, and updated by webhook events.
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Provider readiness</p>
              <p className="mt-2 text-lg font-semibold text-foreground">Adapter-driven</p>
              <p className="mt-1 text-sm text-muted-foreground">Connect a real provider by implementing the billing adapter contract</p>
            </div>
            <div className="rounded-3xl border border-white/8 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Event handling</p>
              <p className="mt-2 text-lg font-semibold text-foreground">Webhook and reconciliation ready</p>
              <p className="mt-1 text-sm text-muted-foreground">Transaction state can now be updated by provider events and follow-up syncs</p>
            </div>
          </div>
        </Card>

        <Card className="border-white/10 bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div className="flex items-center gap-2 text-primary">
            <CreditCard className="size-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.22em]">Next integration steps</span>
          </div>
          <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
            <div className="rounded-3xl border border-white/8 bg-black/20 px-4 py-3">Verify webhook signatures in production</div>
            <div className="rounded-3xl border border-white/8 bg-black/20 px-4 py-3">Schedule reconciliation for pending transactions</div>
            <div className="rounded-3xl border border-white/8 bg-black/20 px-4 py-3">Connect refund and dispute callbacks from the live provider</div>
          </div>
        </Card>
      </section>

      <section className="grid gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">Seeded activity</p>
          <h2 className="mt-2 font-display text-3xl">Recent billing entries</h2>
        </div>

        <div className="grid gap-3">
          {fanBillingEntries.length ? (
            fanBillingEntries.map((entry) => (
              <Card key={entry.id} className="border-white/10 bg-white/[0.04] p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-primary">
                      <Receipt className="size-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{entry.label}</p>
                      <p className="text-sm text-muted-foreground">{entry.detail}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge tone={getFanBillingStatusTone(entry.status)} className="text-xs">
                      {entry.status}
                    </StatusBadge>
                    <p className="font-display text-2xl">{formatAmount(entry.amountCents, entry.currency)}</p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="border-dashed border-white/12 bg-white/[0.02] p-6 text-sm text-muted-foreground">
              No billing history yet. Subscription and unlock transactions will populate this ledger as soon as they are used.
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
