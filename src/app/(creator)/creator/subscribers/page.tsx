import Link from "next/link";
import { Crown, ShieldAlert, Users } from "lucide-react";

import { CreatorPageHeader } from "@/components/creator/creator-page-header";
import { EmptyStateCard } from "@/components/shared/empty-state-card";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  type CreatorSubscriberStatus,
  getCreatorSubscriberStatusLabel,
} from "@/lib/creator/demo-data";
import { getCreatorSubscriberTone } from "@/lib/creator/presentation";
import { getCreatorSubscribersView } from "@/lib/creator/server-data";
import { formatCurrency } from "@/lib/formatting";

function getSubscriberStatusClasses(status: CreatorSubscriberStatus) {
  if (status === "VIP") {
    return "border-primary/20 bg-primary/10";
  }

  if (status === "ACTIVE") {
    return "border-emerald-500/20 bg-emerald-500/10";
  }

  return "border-rose-500/20 bg-rose-500/10";
}


function getAvatarStyle(imageUrl?: string) {
  if (imageUrl) {
    return { backgroundImage: `url(${imageUrl})` };
  }

  return {
    backgroundImage:
      "linear-gradient(180deg, rgba(130,92,255,0.24), rgba(15,15,20,0.92))",
  };
}

export default async function CreatorSubscribersPage() {
  const subscribers = await getCreatorSubscribersView();

  const sortedSubscribers = [...subscribers].sort((left, right) => {
    const rank = { VIP: 0, AT_RISK: 1, ACTIVE: 2 } as const;

    if (rank[left.status] !== rank[right.status]) {
      return rank[left.status] - rank[right.status];
    }

    return right.lifetimeSpendCents - left.lifetimeSpendCents;
  });

  const vipCount = subscribers.filter((item) => item.status === "VIP").length;
  const atRiskCount = subscribers.filter((item) => item.status === "AT_RISK").length;
  const lifetimeValue = subscribers.reduce((total, item) => total + item.lifetimeSpendCents, 0);
  const currency = subscribers[0]?.currency ?? "usd";

  return (
    <div className="grid gap-6">
      <CreatorPageHeader
        title="Subscribers"
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Tracked subscribers"
          value={subscribers.length}
          
          icon={Users}
          labelClassName="text-primary"
        />
        <Card className="border-primary/20 bg-primary/10 p-5">
          <div className="flex items-center gap-2 text-primary">
            <Crown className="size-4" />
            <p className="text-xs font-semibold uppercase tracking-[0.24em]">VIP subscribers</p>
          </div>
          <p className="mt-3 font-display text-4xl">{vipCount}</p>
        </Card>
        <Card className="border-rose-500/20 bg-rose-500/10 p-5">
          <div className="flex items-center gap-2 text-rose-200">
            <ShieldAlert className="size-4" />
            <p className="text-xs font-semibold uppercase tracking-[0.24em]">At risk</p>
          </div>
          <p className="mt-3 font-display text-4xl">{atRiskCount}</p>
        </Card>
      </section>

      <Card className="border-white/10 bg-[linear-gradient(180deg,_rgba(20,20,24,0.98),_rgba(11,11,14,0.96))] p-5 sm:p-6">
        <div className="grid gap-4">
          {sortedSubscribers.length > 0 ? (
            sortedSubscribers.map((subscriber) => (
              <div
                key={subscriber.id}
                className={`grid gap-4 rounded-[1.75rem] border p-4 ${getSubscriberStatusClasses(subscriber.status)} lg:grid-cols-[minmax(0,1.15fr)_minmax(11rem,0.85fr)]`}
              >
                <div className="grid gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className="size-14 rounded-[1.4rem] border border-white/10 bg-cover bg-center"
                      style={getAvatarStyle(subscriber.fanAvatarUrl)}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-foreground">{subscriber.fanName}</p>
                          <p className="text-sm text-muted-foreground">{subscriber.fanHandle}</p>
                        </div>
                        <StatusBadge tone={getCreatorSubscriberTone(subscriber.status)} size="xs">
                          {getCreatorSubscriberStatusLabel(subscriber.status)}
                        </StatusBadge>
                      </div>
                      <p className="mt-3 text-sm text-foreground/80">{subscriber.note}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Membership</p>
                      <p className="mt-2 text-sm text-foreground">{subscriber.joinedLabel}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{subscriber.billingLabel}</p>
                    </div>

                    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Lifetime spend</p>
                      <p className="mt-2 font-display text-2xl">{formatCurrency(subscriber.lifetimeSpendCents, subscriber.currency)}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 self-start">
                  <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Quick actions</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Open the conversation to message this subscriber directly.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {subscriber.conversationId ? (
                        <Button asChild size="sm">
                          <Link href={`/creator/messages?conversationId=${subscriber.conversationId}`}>Message in inbox</Link>
                        </Button>
                      ) : (
                        <Button type="button" size="sm" disabled>
                          No thread yet
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Retention signal</p>
                    <p className="mt-3 text-sm text-foreground/85">
                      {subscriber.status === "VIP"
                        ? "Highest lifetime value in the roster should stay warm."
                        : subscriber.status === "AT_RISK"
                          ? "Billing timing suggests this subscriber needs attention soon."
                          : "Stable subscriber with room for upsell or steady retention."}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyStateCard>
              <p>No subscribers yet.</p>
            </EmptyStateCard>
          )}
        </div>
      </Card>
    </div>
  );
}
