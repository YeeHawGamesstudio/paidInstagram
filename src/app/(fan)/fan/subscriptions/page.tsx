import Link from "next/link";
import { BellRing, CreditCard, Lock } from "lucide-react";

import { FanPageHeader } from "@/components/fan/fan-page-header";
import { CreatorSubscriptionPurchaseButton } from "@/components/payments/creator-subscription-purchase-button";
import { SubscriptionCancelButton } from "@/components/payments/subscription-cancel-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getFanSubscriptionTone } from "@/lib/fan/presentation";
import {
  formatAmount,
  getFanSubscriptionsPageData,
  getSubscriptionStatusLabel,
} from "@/lib/fan/server-data";

export default async function FanSubscriptionsPage() {
  const subscriptionData = await getFanSubscriptionsPageData();

  return (
    <div className="grid gap-5">
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
                  className="min-h-56 bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(10,10,12,0.18), rgba(10,10,12,0.62)), url(${subscription.coverUrl ?? subscription.creatorAvatarUrl})`,
                  }}
                />

                <div className="grid gap-5 p-5 sm:p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="size-12 rounded-2xl border border-white/10 bg-cover bg-center shadow-[0_16px_32px_rgba(0,0,0,0.2)]"
                        style={{ backgroundImage: `url(${subscription.creatorAvatarUrl})` }}
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
                      <p className="mt-1 text-sm text-muted-foreground">{subscription.renewalLabel}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm leading-6 text-muted-foreground">{subscription.summary}</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {subscription.perks.map((perk) => (
                      <div key={perk} className="rounded-3xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-foreground/82 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                        {perk}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button asChild>
                      <Link href={subscription.destinationHref}>{subscription.destinationLabel}</Link>
                    </Button>
                    {subscription.canCancel || subscription.cancelAtPeriodEnd ? (
                      <SubscriptionCancelButton
                        subscriptionId={subscription.id}
                        creatorName={subscription.creatorName}
                        isCancellationScheduled={subscription.cancelAtPeriodEnd}
                      />
                    ) : null}
                    <Button asChild variant="outline">
                      <Link href="/fan/billing">Billing settings</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="border-dashed border-white/12 bg-white/[0.02] p-6 text-sm text-muted-foreground">
            No memberships yet. When a subscription is recorded, active creator access and renewal details will appear here.
          </Card>
        )}
      </section>

      {subscriptionData.availableCreators.length ? (
        <section className="grid gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">Discover more</p>
            <h2 className="mt-2 font-display text-3xl">Available subscriptions</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              These buttons run through the payment abstraction layer, create database transactions, and unlock creator content
              across the fan experience.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {subscriptionData.availableCreators.map((creator) => (
              <Card key={creator.creatorSlug} className="overflow-hidden border-white/10 bg-white/[0.04]">
                <div
                  className="min-h-44 bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(10,10,12,0.18), rgba(10,10,12,0.7)), url(${creator.coverUrl ?? creator.creatorAvatarUrl})`,
                  }}
                />

                <div className="grid gap-4 p-5">
                  <div className="flex items-center gap-3">
                    <div
                      className="size-12 rounded-2xl border border-white/10 bg-cover bg-center"
                      style={{ backgroundImage: `url(${creator.creatorAvatarUrl})` }}
                    />
                    <div>
                      <p className="font-semibold text-foreground">{creator.creatorName}</p>
                      <p className="text-sm text-muted-foreground">{creator.creatorHandle}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-primary">{creator.headline}</p>
                    <p className="mt-2 font-display text-3xl">
                      {formatAmount(creator.priceMonthlyCents, creator.currency)}/mo
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <CreatorSubscriptionPurchaseButton
                      creatorSlug={creator.creatorSlug}
                      creatorName={creator.creatorName}
                      isSubscribed={false}
                    />
                    <Button asChild variant="outline">
                      <Link href={`/creators/${creator.creatorSlug}`}>Preview creator page</Link>
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
