import Link from "next/link";
import { Receipt } from "lucide-react";

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
        title="Billing"
        actions={
          <Button asChild variant="outline" className="w-full justify-center sm:w-auto">
            <Link href="/fan/subscriptions">Manage memberships</Link>
          </Button>
        }
      />

      <section className="grid gap-4">

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
                      {entry.status.charAt(0) + entry.status.slice(1).toLowerCase()}
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
                <p>No charges yet.</p>
                <Button asChild className="w-fit justify-center">
                  <Link href="/fan/subscriptions">Browse memberships</Link>
                </Button>
              </div>
            </EmptyStateCard>
          )}
        </div>
      </section>
    </div>
  );
}
