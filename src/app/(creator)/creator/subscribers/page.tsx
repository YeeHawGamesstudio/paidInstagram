import { Crown, ShieldAlert, Users } from "lucide-react";

import { CreatorPageHeader } from "@/components/creator/creator-page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  creatorSubscribers,
  formatCreatorCurrency,
  getCreatorSubscriberStatusLabel,
} from "@/lib/creator/demo-data";
import { getCreatorSubscriberTone } from "@/lib/creator/presentation";

export default function CreatorSubscribersPage() {
  const vipCount = creatorSubscribers.filter((item) => item.status === "VIP").length;
  const atRiskCount = creatorSubscribers.filter((item) => item.status === "AT_RISK").length;
  const lifetimeValue = creatorSubscribers.reduce((total, item) => total + item.lifetimeSpendCents, 0);

  return (
    <div className="grid gap-6">
      <CreatorPageHeader
        eyebrow="Subscribers"
        title="Know your highest-value members"
        description="Track renewals, identify VIP subscribers, and spot at-risk fans before they fall out of the premium loop."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Tracked members"
          value={creatorSubscribers.length}
          detail="Use this roster to review membership states, spend tiers, and retention cues."
          icon={Users}
          labelClassName="text-primary"
        />
        <MetricCard
          label="VIP members"
          value={vipCount}
          detail="Likely to renew and unlock premium message bundles."
          icon={Crown}
          labelClassName="text-primary"
        />
        <MetricCard
          label="At risk"
          value={atRiskCount}
          detail="Members who may need a rescue offer or personal check-in."
          icon={ShieldAlert}
          labelClassName="text-primary"
        />
      </section>

      <Card className="border-white/10 bg-[linear-gradient(180deg,_rgba(20,20,24,0.98),_rgba(11,11,14,0.96))] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-creator)]">Subscriber roster</p>
            <h2 className="mt-2 font-display text-3xl">Audience relationships</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Review renewal risk, value tiers, and subscriber notes here while CRM actions remain unavailable in this
              environment.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Sample lifetime value</p>
            <p className="mt-2 font-display text-2xl">{formatCreatorCurrency(lifetimeValue)}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {creatorSubscribers.map((subscriber) => (
            <div
              key={subscriber.id}
              className="grid gap-4 rounded-[1.75rem] border border-white/10 bg-black/20 p-4 lg:grid-cols-[minmax(0,1fr)_12rem_12rem]"
            >
              <div className="flex items-center gap-4">
                <div
                  className="size-14 rounded-[1.4rem] border border-white/10 bg-cover bg-center"
                  style={{ backgroundImage: `url(${subscriber.fanAvatarUrl})` }}
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">{subscriber.fanName}</p>
                    <StatusBadge tone={getCreatorSubscriberTone(subscriber.status)} size="xs">
                      {getCreatorSubscriberStatusLabel(subscriber.status)}
                    </StatusBadge>
                  </div>
                  <p className="text-sm text-muted-foreground">{subscriber.fanHandle}</p>
                  <p className="mt-3 text-sm text-foreground/80">{subscriber.note}</p>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Membership</p>
                <p className="mt-2 text-sm text-foreground">{subscriber.joinedLabel}</p>
                <p className="mt-2 text-sm text-muted-foreground">{subscriber.billingLabel}</p>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Lifetime spend</p>
                <p className="mt-2 font-display text-2xl">{formatCreatorCurrency(subscriber.lifetimeSpendCents)}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button type="button" size="sm" disabled>
                    Message
                  </Button>
                  <Button type="button" size="sm" variant="outline" disabled>
                    Tag
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
