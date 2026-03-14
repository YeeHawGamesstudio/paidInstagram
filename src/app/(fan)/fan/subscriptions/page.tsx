import Link from "next/link";
import { BellRing, CreditCard, Lock } from "lucide-react";

import { FanPageHeader } from "@/components/fan/fan-page-header";
import { CreatorSubscriptionPurchaseButton } from "@/components/payments/creator-subscription-purchase-button";
import { SubscriptionCancelButton } from "@/components/payments/subscription-cancel-button";
import { EmptyStateCard } from "@/components/shared/empty-state-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getFanSubscriptionTone } from "@/lib/fan/presentation";
import {
  formatAmount,
  getFanSubscriptionsPageData,
  getSubscriptionStatusLabel,
} from "@/lib/fan/server-data";

function getSurfaceImageStyle(imageUrl?: string) {
  return imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined;
}

function getSubscriptionNextStep(status: "ACTIVE" | "RENEWING_SOON" | "CANCELS_AT_PERIOD_END" | "PAUSED") {
  if (status === "RENEWING_SOON") {
    return "Renewal is coming up soon. Review billing and recent creator activity now.";
  }

  if (status === "CANCELS_AT_PERIOD_END") {
    return "Access stays on until the current period ends, so catch up before it expires.";
  }

  if (status === "PAUSED") {
    return "This membership is no longer active. Revisit the creator or billing history before resubscribing.";
  }

  return "Everything is active. Jump back into creator updates or messages from here.";
}

function getDiscoverySummary() {
  return "Unlock feed posts, paid-drop previews, and creator inbox access with one membership.";
}

export default async function FanSubscriptionsPage() {
  const subscriptionData = await getFanSubscriptionsPageData();

  return (
    <div className="grid gap-4 sm:gap-5">
      <FanPageHeader
        eyebrow="Subscriptions"
        title="Manage premium access"
        description="Track active memberships, buy new subscriptions, and watch premium creator access update across feed, inbox, and billing."
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <Card className="border-white/10 bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div className="flex items-center gap-2 text-primary">
            <CreditCard className="size-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.22em]">Active now</span>
          </div>
          <p className="mt-3 font-display text-4xl">{subscriptionData.activeCount}</p>
          <p className="mt-2 text-sm text-muted-foreground">Creators currently unlocked across feed and messages.</p>
        </Card>
        <Card className="border-white/10 bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div className="flex items-center gap-2 text-primary">
            <Lock className="size-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.22em]">Monthly total</span>
          </div>
          <p className="mt-3 font-display text-4xl">{formatAmount(subscriptionData.monthlyTotal, "usd")}</p>
          <p className="mt-2 text-sm text-muted-foreground">Current recurring spend before one-off paid message unlocks.</p>
        </Card>
        <Card className="border-white/10 bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div className="flex items-center gap-2 text-primary">
            <BellRing className="size-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.22em]">Attention</span>
          </div>
          <p className="mt-3 text-lg font-semibold text-foreground">{subscriptionData.renewalSoonCount} renewal soon</p>
          <p className="mt-2 text-sm text-muted-foreground">Renewal timing is derived from stored subscription lifecycle records.</p>
        </Card>
      </section>

      <section className="grid gap-4">
        {subscriptionData.subscriptions.length ? (
          subscriptionData.subscriptions.map((subscription) => (
            <Card key={subscription.id} className="overflow-hidden border-white/10 bg-[linear-gradient(180deg,_rgba(20,20,24,0.98),_rgba(11,11,14,0.96))]">
              <div className="grid gap-0 lg:grid-cols-[18rem_minmax(0,1fr)]">
                <div
                  className="min-h-44 bg-cover bg-center sm:min-h-56"
                  style={{
                    backgroundImage: subscription.coverUrl || subscription.creatorAvatarUrl
                      ? `linear-gradient(180deg, rgba(10,10,12,0.18), rgba(10,10,12,0.62)), url(${subscription.coverUrl ?? subscription.creatorAvatarUrl})`
                      : "linear-gradient(180deg, rgba(201,169,110,0.18), rgba(10,10,12,0.82))",
                  }}
                />

                <div className="grid gap-5 p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="size-12 rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(201,169,110,0.24),_rgba(23,23,30,0.94))] bg-cover bg-center shadow-[0_16px_32px_rgba(0,0,0,0.2)]"
                        style={getSurfaceImageStyle(subscription.creatorAvatarUrl)}
                        aria-label={subscription.creatorName}
                      />
                      <div>
                        <p className="font-semibold text-foreground">{subscription.creatorName}</p>
                        <p className="text-sm text-muted-foreground">{subscription.creatorHandle}</p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <StatusBadge tone={getFanSubscriptionTone(subscription.status)} className="text-xs">
                        {getSubscriptionStatusLabel(subscription.status)}
                      </StatusBadge>
                      <p className="mt-3 font-display text-3xl">
                        {formatAmount(subscription.priceMonthlyCents, subscription.currency)}/mo
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground/80">{subscription.renewalLabel}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_16rem]">
                    <div>
                      <p className="text-sm leading-6 text-muted-foreground">{subscription.summary}</p>
                    </div>
                    <div className="rounded-[1.35rem] border border-white/10 bg-black/20 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/85">Next step</p>
                      <p className="mt-2 text-sm leading-6 text-foreground/82">{getSubscriptionNextStep(subscription.status)}</p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {subscription.perks.map((perk) => (
                      <div key={perk} className="rounded-3xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-foreground/82 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                        {perk}
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-3 sm:flex sm:flex-wrap">
                    <Button asChild className="w-full justify-center sm:w-auto">
                      <Link href={subscription.destinationHref}>{subscription.destinationLabel}</Link>
                    </Button>
                    {subscription.canCancel || subscription.cancelAtPeriodEnd ? (
                      <SubscriptionCancelButton
                        subscriptionId={subscription.id}
                        creatorName={subscription.creatorName}
                        isCancellationScheduled={subscription.cancelAtPeriodEnd}
                        className="w-full justify-center sm:w-auto"
                      />
                    ) : null}
                    <Button asChild variant="outline" className="w-full justify-center sm:w-auto">
                      <Link href="/fan/billing">Open billing</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <EmptyStateCard>
            <div className="grid gap-4">
              <p>No memberships yet. When you start one, creator access, renewal timing, and quick actions will appear here.</p>
              <div className="grid gap-2 sm:flex sm:flex-wrap">
                <Button asChild className="w-full justify-center sm:w-auto">
                  <Link href="/fan/billing">Open billing</Link>
                </Button>
              </div>
            </div>
          </EmptyStateCard>
        )}
      </section>

      {subscriptionData.availableCreators.length ? (
        <section className="grid gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">Discover more</p>
            <h2 className="mt-2 font-display text-3xl">Available subscriptions</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Browse creators you can unlock next. Memberships open their premium feed posts, inbox moments, and ongoing updates.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {subscriptionData.availableCreators.map((creator) => (
              <Card key={creator.creatorSlug} className="overflow-hidden border-white/10 bg-white/[0.04]">
                <div
                  className="min-h-44 bg-cover bg-center"
                  style={{
                    backgroundImage: creator.coverUrl || creator.creatorAvatarUrl
                      ? `linear-gradient(180deg, rgba(10,10,12,0.18), rgba(10,10,12,0.7)), url(${creator.coverUrl ?? creator.creatorAvatarUrl})`
                      : "linear-gradient(180deg, rgba(201,169,110,0.18), rgba(10,10,12,0.82))",
                  }}
                />

                <div className="grid gap-4 p-5">
                  <div className="flex items-center gap-3">
                    <div
                      className="size-12 rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(201,169,110,0.24),_rgba(23,23,30,0.94))] bg-cover bg-center"
                      style={getSurfaceImageStyle(creator.creatorAvatarUrl)}
                      aria-label={creator.creatorName}
                    />
                    <div>
                      <p className="font-semibold text-foreground">{creator.creatorName}</p>
                      <p className="text-sm text-muted-foreground">{creator.creatorHandle}</p>
                    </div>
                  </div>

                  <div>
                    <StatusBadge tone="primary" className="text-xs">
                      Ready to subscribe
                    </StatusBadge>
                    <p className="mt-3 text-sm text-primary">{creator.headline}</p>
                    <p className="mt-2 font-display text-3xl">
                      {formatAmount(creator.priceMonthlyCents, creator.currency)}/mo
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{getDiscoverySummary()}</p>
                  </div>

                  <div className="grid gap-3 sm:flex sm:flex-wrap">
                    <CreatorSubscriptionPurchaseButton
                      creatorSlug={creator.creatorSlug}
                      creatorName={creator.creatorName}
                      isSubscribed={false}
                      buttonLabel="Start membership"
                      className="w-full justify-center sm:w-auto"
                    />
                    <Button asChild variant="outline" className="w-full justify-center sm:w-auto">
                      <Link href={`/creators/${creator.creatorSlug}`}>Preview creator</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
