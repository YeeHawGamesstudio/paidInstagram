import Link from "next/link";
import { Lock, MessageCircle, Sparkles, Users } from "lucide-react";
import { notFound } from "next/navigation";

import { CreatorSubscriptionPurchaseButton } from "@/components/payments/creator-subscription-purchase-button";
import { EmptyStateCard } from "@/components/shared/empty-state-card";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getCreatorApprovalStatusLabel,
  getCreatorVerificationStatusLabel,
} from "@/lib/compliance/scaffolding";
import { getCreatorProfilePageData } from "@/lib/public/server-data";

type CreatorProfilePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function CreatorProfilePage({ params }: CreatorProfilePageProps) {
  const { slug } = await params;
  const creator = await getCreatorProfilePageData(slug);

  if (!creator) {
    notFound();
  }

  const publicPosts = creator.publicPosts;
  const lockedPosts = creator.subscriberPosts;
  const creatorHandle = `@${creator.username}`;
  const canAccessFanMemberships = creator.viewerRole === "FAN";

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:gap-8 lg:px-8 lg:py-8">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/25 shadow-[0_30px_80px_rgba(0,0,0,0.34)]">
        <div
          className="min-h-[20rem] bg-cover bg-center sm:min-h-[24rem]"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(10,10,12,0.18), rgba(10,10,12,0.9)), url(${creator.coverUrl ?? creator.avatarUrl})`,
          }}
        >
          <div className="flex min-h-[20rem] flex-col justify-end gap-5 p-5 sm:min-h-[24rem] sm:p-8">
            <Link
              href="/discover"
              className="w-fit rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs uppercase tracking-[0.24em] text-foreground/70 transition hover:border-primary/40 hover:bg-black/45 hover:text-foreground"
            >
              Back to discover
            </Link>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div
                className="size-24 rounded-[1.75rem] border border-white/15 bg-cover bg-center shadow-[0_24px_50px_rgba(0,0,0,0.45)] sm:size-32"
                style={{ backgroundImage: `url(${creator.avatarUrl ?? creator.coverUrl})` }}
              />
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-primary">{creator.category}</p>
                <h1 className="mt-2 font-display text-[3.2rem] leading-none sm:text-6xl">{creator.displayName}</h1>
                <p className="mt-2 text-sm text-foreground/70 sm:text-base">{creatorHandle}</p>
                <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">{creator.bio}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-foreground/82">
                    {creator.stats.publicPosts} public previews
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-foreground/82">
                    {creator.stats.exclusiveDrops} exclusive drops
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-foreground/82">
                    {creator.stats.replyWindow}
                  </span>
                  <StatusBadge tone="success">{getCreatorApprovalStatusLabel(creator.compliance.approvalStatus)}</StatusBadge>
                  <StatusBadge tone="warning">
                    {getCreatorVerificationStatusLabel(creator.compliance.verificationStatus)}
                  </StatusBadge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="grid gap-6">
          <Card className="border-white/10 bg-[linear-gradient(180deg,_rgba(255,255,255,0.03),_rgba(255,255,255,0.015))] p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <MetricCard
                label="Public previews"
                value={creator.stats.publicPosts}
                icon={Sparkles}
                className="rounded-3xl border-white/8 bg-black/20 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                valueClassName="text-3xl"
              />
              <MetricCard
                label="Exclusive drops"
                value={creator.stats.exclusiveDrops}
                icon={Lock}
                className="rounded-3xl border-white/8 bg-black/20 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                valueClassName="text-3xl"
              />
              <MetricCard
                label="Response pace"
                value={creator.stats.replyWindow}
                icon={Users}
                className="rounded-3xl border-white/8 bg-black/20 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                valueClassName="text-lg font-medium text-foreground"
              />
            </div>
          </Card>

          <section className="grid gap-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl">Free posts</h2>
              </div>
            </div>

            {publicPosts.length ? (
              <div className="grid gap-4">
                {publicPosts.map((post) => (
                  <Card key={post.id} className="overflow-hidden border-white/10 bg-[linear-gradient(180deg,_rgba(255,255,255,0.03),_rgba(255,255,255,0.015))]">
                    <div className="grid gap-0 md:grid-cols-[220px_minmax(0,1fr)]">
                      <div
                        className="min-h-56 bg-cover bg-center"
                        style={{ backgroundImage: `linear-gradient(180deg, rgba(10,10,12,0.12), rgba(10,10,12,0.45)), url(${post.imageUrl ?? creator.coverUrl ?? creator.avatarUrl})` }}
                      />
                      <div className="flex flex-col gap-4 p-5 sm:p-6">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                            Public
                          </span>
                          <span className="text-xs text-muted-foreground">{post.publishedLabel}</span>
                          <Link href={post.reportHref} className="text-xs text-muted-foreground transition hover:text-foreground">
                            Report post
                          </Link>
                        </div>
                        <div>
                          <h3 className="font-display text-[2rem] leading-tight">{post.title}</h3>
                          <p className="mt-2 text-sm text-foreground/75">{post.caption}</p>
                        </div>
                        <p className="text-sm leading-6 text-muted-foreground">{post.body}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyStateCard>
                This creator hasn&rsquo;t published any free preview posts yet. Check back soon or subscribe to get notified.
              </EmptyStateCard>
            )}
          </section>

          <section className="grid gap-4">
            <div>
              <h2 className="font-display text-3xl">Subscriber posts</h2>
            </div>

            {lockedPosts.length ? (
              <div className="grid gap-4">
                {lockedPosts.map((post) => (
                  <Card key={post.id} className="overflow-hidden border-white/10 bg-white/[0.03]">
                    {creator.isSubscribed ? (
                      <div className="grid gap-0 md:grid-cols-[220px_minmax(0,1fr)]">
                        <div
                          className="min-h-56 bg-cover bg-center"
                          style={{
                            backgroundImage: `linear-gradient(180deg, rgba(10,10,12,0.12), rgba(10,10,12,0.45)), url(${post.imageUrl ?? creator.coverUrl ?? creator.avatarUrl})`,
                          }}
                        />
                        <div className="flex flex-col gap-4 p-5 sm:p-6">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                              Subscription active
                            </span>
                            <span className="text-xs text-muted-foreground">{post.publishedLabel}</span>
                            <Link href={post.reportHref} className="text-xs text-muted-foreground transition hover:text-foreground">
                              Report post
                            </Link>
                          </div>
                          <div>
                            <h3 className="font-display text-[2rem] leading-tight">{post.title}</h3>
                            <p className="mt-2 text-sm text-foreground/75">{post.caption}</p>
                          </div>
                          <p className="text-sm leading-6 text-muted-foreground">{post.body}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="relative min-h-72">
                        <div
                          className="absolute inset-0 scale-[1.04] bg-cover bg-center blur-sm"
                          style={{
                            backgroundImage: `linear-gradient(180deg, rgba(10,10,12,0.12), rgba(10,10,12,0.8)), url(${post.imageUrl ?? creator.coverUrl ?? creator.avatarUrl})`,
                          }}
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(8,8,10,0.22)_0%,_rgba(8,8,10,0.84)_100%)]" />
                        <div className="relative flex h-full flex-col justify-between p-5 sm:p-6">
                          <div className="flex items-start justify-between gap-3">
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                              <Lock className="size-3.5" />
                              Subscribers only
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-foreground/65">{post.publishedLabel}</span>
                              <Link href={post.reportHref} className="text-xs text-foreground/65 transition hover:text-foreground">
                                Report post
                              </Link>
                            </div>
                          </div>

                          <div className="max-w-xl space-y-3">
                            <h3 className="font-display text-3xl sm:text-4xl">{post.title}</h3>
                            <p className="text-sm text-foreground/75">{post.caption}</p>
                            <p className="text-sm leading-6 text-muted-foreground">{post.body}</p>
                            <div className="rounded-3xl border border-dashed border-white/15 bg-black/35 p-4 text-sm text-muted-foreground">
                              Subscribe to reveal private galleries and premium drops from this creator.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyStateCard>
                Private drops will appear here once this creator publishes subscriber-only content.
              </EmptyStateCard>
            )}
          </section>
        </div>

        <aside className="hidden lg:block">
          <Card className="sticky top-24 border-white/10 bg-[radial-gradient(circle_at_top,_rgba(201,169,110,0.16),_transparent_16rem),linear-gradient(180deg,_rgba(201,169,110,0.1),_rgba(12,12,15,0.96))] p-6">
            <h2 className="font-display text-4xl">{creator.formattedMonthlyPrice}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Subscribe to unlock premium posts, private drops, and creator message history.
            </p>
            <ul className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-foreground/82 space-y-1">
              <li>All subscriber-only posts</li>
              <li>Private media drops</li>
              <li>Direct message history</li>
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <StatusBadge tone="success">{getCreatorApprovalStatusLabel(creator.compliance.approvalStatus)}</StatusBadge>
              <StatusBadge tone="warning">
                {getCreatorVerificationStatusLabel(creator.compliance.verificationStatus)}
              </StatusBadge>
            </div>
            <div className="mt-6 grid gap-3">
              {canAccessFanMemberships ? (
                <CreatorSubscriptionPurchaseButton
                  creatorSlug={creator.slug}
                  creatorName={creator.displayName}
                  isSubscribed={creator.isSubscribed}
                  buttonLabel={`Subscribe to ${creator.displayName}`}
                  alreadyOwnedLabel="Subscription active"
                  size="lg"
                />
              ) : (
                <Button asChild size="lg">
                  <Link href="/login">Sign in to subscribe</Link>
                </Button>
              )}
              <Button asChild variant="outline" size="lg">
                <Link href={canAccessFanMemberships ? "/fan/subscriptions" : "/login"}>
                  {canAccessFanMemberships ? "Manage subscriptions" : "Sign in for more"}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={creator.compliance.reportHref}>Report creator or content</Link>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <Link href="/dmca">DMCA / takedown</Link>
              </Button>
            </div>
            <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-muted-foreground">
              Renews monthly. Cancel anytime.
            </div>
          </Card>
        </aside>
      </section>

      <div className="sticky bottom-4 z-30 lg:hidden">
        <Card className="border-white/10 bg-[rgba(9,9,11,0.9)] p-3 shadow-[0_24px_60px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-display text-2xl">{creator.formattedMonthlyPrice}</p>
              <p className="mt-1 truncate text-xs text-muted-foreground">Instant access to all posts.</p>
            </div>
            {canAccessFanMemberships ? (
              <CreatorSubscriptionPurchaseButton
                creatorSlug={creator.slug}
                creatorName={creator.displayName}
                isSubscribed={creator.isSubscribed}
                buttonLabel="Subscribe"
                alreadyOwnedLabel="Active"
                className="shrink-0"
              />
            ) : (
              <Button asChild className="shrink-0">
                <Link href="/login">Sign in</Link>
              </Button>
            )}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
            <MessageCircle className="size-3.5" />
            Instant access after subscribing.
          </div>
        </Card>
      </div>
    </main>
  );
}
