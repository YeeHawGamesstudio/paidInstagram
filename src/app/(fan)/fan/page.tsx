import Link from "next/link";
import { Crown, Lock, MessageSquareText, Sparkles } from "lucide-react";

import { FanPageHeader } from "@/components/fan/fan-page-header";
import { EmptyStateCard } from "@/components/shared/empty-state-card";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getFanFeedAccessLabel, getFanFeedAccessTone } from "@/lib/fan/presentation";
import { formatAmount, getFanFeed, getFanShellProfile } from "@/lib/fan/server-data";

export default async function FanPage() {
  // The Prisma pg adapter warns when the same client is queried concurrently.
  const fanProfile = await getFanShellProfile();
  const fanFeed = await getFanFeed();

  return (
    <div className="grid gap-5">
      <FanPageHeader
        eyebrow="Fan home"
        title={`Welcome back, ${fanProfile.displayName}`}
        description="Your feed blends subscriber-only drops, live creator updates, and message activity in a mobile-first premium layout."
        actions={
          <Button asChild>
            <Link href="/fan/messages">Open inbox</Link>
          </Button>
        }
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          label="Memberships"
          value={fanProfile.membershipCount}
          detail={fanProfile.nextRenewalLabel}
          icon={Crown}
          className="shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
        />
        <MetricCard
          label="Unread chat"
          value={fanProfile.unreadMessages}
          detail="Paid drops and creator replies waiting in the inbox."
          icon={MessageSquareText}
          className="shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
        />
        <MetricCard
          label="Monthly spend"
          value={formatAmount(fanProfile.monthlySpendCents, "usd")}
          detail="Current active membership total before any paid message unlocks."
          icon={Sparkles}
          className="shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
        />
      </section>

      <section className="grid gap-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">Live feed</p>
            <h2 className="mt-2 font-display text-3xl">Subscriber content and previews</h2>
          </div>
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/fan/subscriptions">Manage memberships</Link>
          </Button>
        </div>

        <div className="grid gap-4">
          {fanFeed.length ? (
            fanFeed.map((item) => (
              <Card key={item.id} className="overflow-hidden border-white/10 bg-[linear-gradient(180deg,_rgba(20,20,24,0.98),_rgba(11,11,14,0.96))]">
                <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_20rem]">
                  <div className="flex flex-col gap-4 p-5 sm:p-6">
                    <div className="flex items-center gap-3">
                      <div
                        className="size-12 rounded-2xl border border-white/10 bg-cover bg-center shadow-[0_16px_32px_rgba(0,0,0,0.2)]"
                        style={{ backgroundImage: `url(${item.creatorAvatarUrl})` }}
                      />
                      <div>
                        <p className="font-semibold text-foreground">{item.creatorName}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.creatorHandle} · {item.publishedLabel}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge tone={getFanFeedAccessTone(item.access)} className="text-xs">
                        {getFanFeedAccessLabel(item.access)}
                      </StatusBadge>
                      <span className="text-xs text-muted-foreground">{item.contextLabel}</span>
                    </div>

                    <div>
                      <h3 className="font-display text-3xl">{item.headline}</h3>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{item.caption}</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button asChild>
                        <Link href={item.destinationHref}>
                          {item.access === "INCLUDED" ? "View in messages" : "See memberships"}
                        </Link>
                      </Button>
                      {item.access === "LOCKED" ? (
                        <Button asChild variant="outline">
                          <Link href="/fan/subscriptions">
                            <Lock className="size-4" />
                            Unlock with subscription
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  <div className="relative min-h-72">
                    <div
                      className={item.access === "LOCKED" ? "absolute inset-0 scale-[1.03] bg-cover bg-center blur-sm" : "absolute inset-0 bg-cover bg-center"}
                      style={{
                        backgroundImage: `linear-gradient(180deg, rgba(10,10,12,0.15), rgba(10,10,12,0.6)), url(${item.media.imageUrl ?? item.creatorAvatarUrl})`,
                      }}
                      aria-label={item.media.imageAlt}
                    />
                    {item.access === "LOCKED" ? (
                      <>
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(8,8,10,0.22),_rgba(8,8,10,0.82))]" />
                        <div className="relative flex h-full items-end p-5">
                          <div className="w-full rounded-[1.5rem] border border-white/10 bg-black/35 p-4">
                            <div className="flex items-center gap-2 text-primary">
                              <Lock className="size-4" />
                              <span className="text-xs font-semibold uppercase tracking-[0.2em]">Still locked</span>
                            </div>
                            <p className="mt-2 text-sm text-foreground/80">
                              Subscriber-only content is shown clearly in the feed but gated until access is active.
                            </p>
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <EmptyStateCard>
              Your feed is empty for now. Once subscriptions are active or creators publish new premium drops, this area will fill in automatically.
            </EmptyStateCard>
          )}
        </div>
      </section>
    </div>
  );
}
