import { Crown, ShieldAlert, Users } from "lucide-react";

import { CreatorPageHeader } from "@/components/creator/creator-page-header";
import { EmptyStateCard } from "@/components/shared/empty-state-card";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  creatorSubscribers,
  formatCreatorCurrency,
  type CreatorSubscriberStatus,
  getCreatorSubscriberStatusLabel,
} from "@/lib/creator/demo-data";
import { getCreatorSubscriberTone } from "@/lib/creator/presentation";

function getSubscriberStatusClasses(status: CreatorSubscriberStatus) {
  if (status === "VIP") {
    return "border-primary/20 bg-primary/10";
  }

  if (status === "ACTIVE") {
    return "border-emerald-500/20 bg-emerald-500/10";
  }

  return "border-rose-500/20 bg-rose-500/10";
}

function getSubscriberNextStep(status: CreatorSubscriberStatus) {
  if (status === "VIP") {
    return "Keep this subscriber warm with a high-touch check-in or premium drop preview.";
  }

  if (status === "ACTIVE") {
    return "Monitor renewal timing and keep the subscription value clear.";
  }

  return "Plan a recovery touchpoint soon before this subscriber fully drops off.";
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

export default function CreatorSubscribersPage() {
  const sortedSubscribers = [...creatorSubscribers].sort((left, right) => {
    const rank = { VIP: 0, AT_RISK: 1, ACTIVE: 2 } as const;

    if (rank[left.status] !== rank[right.status]) {
      return rank[left.status] - rank[right.status];
    }

    return right.lifetimeSpendCents - left.lifetimeSpendCents;
  });

  const vipCount = creatorSubscribers.filter((item) => item.status === "VIP").length;
  const atRiskCount = creatorSubscribers.filter((item) => item.status === "AT_RISK").length;
  const lifetimeValue = creatorSubscribers.reduce((total, item) => total + item.lifetimeSpendCents, 0);

  return (
    <div className="grid gap-6">
      <CreatorPageHeader
        eyebrow="Subscribers"
        title="Know your highest-value subscribers"
        description="Track renewals, identify VIP subscribers, and spot at-risk fans from one subscriber roster preview."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Tracked subscribers"
          value={creatorSubscribers.length}
          detail="Review subscription state, spend, and retention signals."
          icon={Users}
          labelClassName="text-primary"
        />
        <Card className="border-primary/20 bg-primary/10 p-5">
          <div className="flex items-center gap-2 text-primary">
            <Crown className="size-4" />
            <p className="text-xs font-semibold uppercase tracking-[0.24em]">VIP subscribers</p>
          </div>
          <p className="mt-3 font-display text-4xl">{vipCount}</p>
          <p className="mt-2 text-sm text-primary/80">High-value subscribers worth protecting first.</p>
        </Card>
        <Card className="border-rose-500/20 bg-rose-500/10 p-5">
          <div className="flex items-center gap-2 text-rose-200">
            <ShieldAlert className="size-4" />
            <p className="text-xs font-semibold uppercase tracking-[0.24em]">At risk</p>
          </div>
          <p className="mt-3 font-display text-4xl">{atRiskCount}</p>
          <p className="mt-2 text-sm text-rose-100/80">Subscribers who may need follow-up soon.</p>
        </Card>
      </section>

      <Card className="border-white/10 bg-[linear-gradient(180deg,_rgba(20,20,24,0.98),_rgba(11,11,14,0.96))] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-creator)]">Subscriber roster</p>
            <h2 className="mt-2 font-display text-3xl">Audience relationships</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Review renewal risk, value tiers, and subscriber notes here. CRM actions stay disabled in this preview.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Sample lifetime value</p>
            <p className="mt-2 font-display text-2xl">{formatCreatorCurrency(lifetimeValue)}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Review order</p>
            <p className="mt-2 text-sm text-foreground/85">VIP subscribers first, then at-risk subscribers, then steady active subscribers.</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">What to scan first</p>
            <p className="mt-2 text-sm text-foreground/85">Status, billing timing, and next step are the primary retention signals.</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">CRM actions</p>
            <p className="mt-2 text-sm text-foreground/85">`Message` and `Tag` stay visible for workflow review only and remain disabled here.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
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

                  <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Next step</p>
                    <p className="mt-3 text-sm leading-6 text-foreground/85">{getSubscriberNextStep(subscriber.status)}</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Membership</p>
                      <p className="mt-2 text-sm text-foreground">{subscriber.joinedLabel}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{subscriber.billingLabel}</p>
                    </div>

                    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Lifetime spend</p>
                      <p className="mt-2 font-display text-2xl">{formatCreatorCurrency(subscriber.lifetimeSpendCents)}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 self-start">
                  <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">CRM actions in preview</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      These controls are disabled here. Use them to confirm layout and intent, not to send outreach.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button type="button" size="sm" disabled>
                        Message disabled
                      </Button>
                      <Button type="button" size="sm" variant="outline" disabled>
                        Tag disabled
                      </Button>
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
              <div className="space-y-3">
                <p className="font-medium text-foreground">No subscribers yet.</p>
                <p>Subscriber status, renewal timing, and CRM review tools will appear here as soon as the roster has data.</p>
              </div>
            </EmptyStateCard>
          )}
        </div>
      </Card>
    </div>
  );
}
