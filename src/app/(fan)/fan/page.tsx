import Link from "next/link";
import { Crown, Lock, MessageSquareText, Sparkles } from "lucide-react";

import { FanPageHeader } from "@/components/fan/fan-page-header";
import { EmptyStateCard } from "@/components/shared/empty-state-card";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getFanFeedAccessTone } from "@/lib/fan/presentation";
import { formatAmount, getFanFeed, getFanShellProfile } from "@/lib/fan/server-data";
import { cn } from "@/lib/utils";

function getSurfaceImageStyle(imageUrl?: string) {
  return imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined;
}

export default async function FanPage() {
  // The Prisma pg adapter warns when the same client is queried concurrently.
  const fanProfile = await getFanShellProfile();
  const fanFeed = await getFanFeed();
  const includedCount = fanFeed.filter((item) => item.access === "INCLUDED").length;
  const lockedCount = fanFeed.length - includedCount;

  return (
    <div className="grid gap-4 sm:gap-5">
      <FanPageHeader
        compact={false}
        title={`Welcome back, ${fanProfile.displayName}`}
        actions={
          <div className="grid w-full gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-end">
            <Button asChild>
              <Link href="/fan/messages">Open messages</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/fan/subscriptions">Manage memberships</Link>
            </Button>
          </div>
        }
      />

      <section className="grid gap-4">
        <Card className="border-white/10 bg-[radial-gradient(circle_at_top_right,_rgba(201,169,110,0.08),_transparent_16rem),linear-gradient(180deg,_rgba(20,20,24,0.96),_rgba(11,11,14,0.98))] p-4 sm:p-5">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone="success" className="text-xs normal-case tracking-normal">
                  {includedCount} ready now
                </StatusBadge>
                <StatusBadge tone="primary" className="text-xs normal-case tracking-normal">
                  {lockedCount} locked preview{lockedCount === 1 ? "" : "s"}
                </StatusBadge>
                <StatusBadge tone="neutral" className="text-xs normal-case tracking-normal">
                  {fanProfile.unreadMessages} unread updates
                </StatusBadge>
              </div>
            </div>
            <div className="grid gap-2 sm:w-52">
              <Button asChild className="w-full justify-center">
                <Link href="/fan/messages">Open messages</Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-center">
                <Link href="/fan/subscriptions">Manage memberships</Link>
              </Button>
            </div>
          </div>
        </Card>

        <div />

        <div className="grid gap-4">
          {fanFeed.length ? (
            fanFeed.map((item) => (
              <Card
                key={item.id}
                className={cn(
                  "overflow-hidden bg-[linear-gradient(180deg,_rgba(20,20,24,0.98),_rgba(11,11,14,0.96))]",
                  item.access === "INCLUDED" ? "border-emerald-400/18" : "border-white/10",
                )}
              >
                <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_20rem]">
                  <div className="flex flex-col gap-4 p-5 sm:p-6">
                    <div className="flex items-center gap-3">
                      <div
                        className="size-12 rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(201,169,110,0.24),_rgba(23,23,30,0.94))] bg-cover bg-center shadow-[0_16px_32px_rgba(0,0,0,0.2)]"
                        style={getSurfaceImageStyle(item.creatorAvatarUrl)}
                        aria-label={item.creatorName}
                      />
                      <div>
                        <p className="font-semibold text-foreground">{item.creatorName}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.creatorHandle} · {item.publishedLabel}
                        </p>
                      </div>
                    </div>

                    <StatusBadge tone={getFanFeedAccessTone(item.access)} className="text-xs">
                      {item.access === "INCLUDED" ? "Included" : "Locked"}
                    </StatusBadge>

                    <div>
                      <h3 className="font-display text-[1.85rem] leading-tight sm:text-[2.1rem]">{item.headline}</h3>
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{item.caption}</p>
                    </div>

                    <div className="grid gap-2 sm:flex sm:flex-wrap">
                      <Button asChild className="w-full justify-center sm:w-auto">
                        <Link href={item.destinationHref}>
                          {item.access === "INCLUDED" ? "Open included drop" : "Unlock with membership"}
                        </Link>
                      </Button>
                      {item.access === "LOCKED" ? (
                        <Button asChild variant="outline" className="w-full justify-center sm:w-auto">
                          <Link href="/fan/subscriptions">
                            <Lock className="size-4" />
                            Manage memberships
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  <div className="relative min-h-72">
                    <div
                      className={item.access === "LOCKED" ? "absolute inset-0 scale-[1.03] bg-cover bg-center blur-sm" : "absolute inset-0 bg-cover bg-center"}
                      style={{
                        backgroundImage: item.media.imageUrl || item.creatorAvatarUrl
                          ? `linear-gradient(180deg, rgba(10,10,12,0.15), rgba(10,10,12,0.6)), url(${item.media.imageUrl ?? item.creatorAvatarUrl})`
                          : "linear-gradient(180deg, rgba(201,169,110,0.2), rgba(10,10,12,0.88))",
                      }}
                      aria-label={item.media.imageAlt ?? item.media.label}
                    />
                    {item.access === "LOCKED" ? (
                      <>
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(8,8,10,0.22),_rgba(8,8,10,0.82))]" />
                        <div className="relative flex h-full items-end p-5">
                          <div className="flex w-full items-center justify-between rounded-[1.5rem] border border-white/10 bg-black/35 p-4">
                            <div className="flex items-center gap-2 text-primary">
                              <Lock className="size-4" />
                              <span className="text-sm font-medium text-foreground">Subscribe to unlock</span>
                            </div>
                            <Button asChild size="sm" variant="outline">
                              <Link href="/fan/subscriptions">Subscribe</Link>
                            </Button>
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
              <div className="grid gap-4">
                <p>Nothing here yet. Subscribe to a creator to start seeing their posts.</p>
                <Button asChild className="w-fit justify-center">
                  <Link href="/discover">Browse creators</Link>
                </Button>
              </div>
            </EmptyStateCard>
          )}
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="font-display text-2xl">Overview</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricCard
            label="Memberships"
            value={fanProfile.membershipCount}
            detail={fanProfile.nextRenewalLabel}
            icon={Crown}
            className="bg-white/[0.035] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            valueClassName="text-[1.8rem] sm:text-[2rem]"
            detailClassName="text-xs leading-5 text-foreground/68"
          />
          <MetricCard
            label="Unread updates"
            value={fanProfile.unreadMessages}
            
            icon={MessageSquareText}
            className="bg-white/[0.035] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            valueClassName="text-[1.8rem] sm:text-[2rem]"
            detailClassName="text-xs leading-5 text-foreground/68"
          />
          <MetricCard
            label="Monthly spend"
            value={formatAmount(fanProfile.monthlySpendCents, "usd")}
            
            icon={Sparkles}
            className="bg-white/[0.035] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            valueClassName="text-[1.8rem] sm:text-[2rem]"
            detailClassName="text-xs leading-5 text-foreground/68"
          />
        </div>
      </section>
    </div>
  );
}
