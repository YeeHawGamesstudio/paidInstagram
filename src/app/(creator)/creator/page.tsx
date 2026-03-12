import Link from "next/link";
import { ArrowRight, BadgeDollarSign, LayoutGrid, MessageSquareText, Users } from "lucide-react";

import { CreatorPageHeader } from "@/components/creator/creator-page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  creatorAudienceSnapshot,
  creatorComplianceSummary,
  creatorConversations,
  creatorPosts,
  creatorProfileSummary,
  formatCreatorCurrency,
  getCreatorPostVisibilityLabel,
} from "@/lib/creator/demo-data";
import { getCreatorApprovalTone, getCreatorVerificationTone } from "@/lib/creator/presentation";
import {
  getCreatorApprovalStatusLabel,
  getCreatorVerificationStatusLabel,
} from "@/lib/compliance/scaffolding";

export default function CreatorPage() {
  const recentPosts = creatorPosts.slice(0, 3);
  const recentConversations = creatorConversations.slice(0, 3);

  return (
    <div className="grid gap-6">
      <CreatorPageHeader
        eyebrow="Creator dashboard"
        title={`Studio overview for ${creatorProfileSummary.displayName}`}
        description="Track profile health, recent content performance, subscriber momentum, and message opportunities from one polished workspace."
        actions={
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/creator/posts/new">New post</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/creator/messages">Open inbox</Link>
            </Button>
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Monthly recurring"
          value={formatCreatorCurrency(creatorProfileSummary.monthlyRecurringRevenueCents)}
          detail={creatorProfileSummary.retentionLabel}
          icon={BadgeDollarSign}
          className="bg-[linear-gradient(180deg,_rgba(45,24,75,0.28),_rgba(12,12,16,0.96))]"
          labelClassName="text-[var(--color-creator)]"
        />

        <MetricCard
          label="Audience health"
          value={creatorProfileSummary.activeSubscribers}
          detail={creatorProfileSummary.conversionLabel}
          icon={Users}
        />

        <MetricCard
          label="Inbox pressure"
          value={creatorProfileSummary.unreadConversations}
          detail={creatorProfileSummary.replyWindowLabel}
          icon={MessageSquareText}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <Card className="overflow-hidden border-white/10 bg-[linear-gradient(180deg,_rgba(19,19,24,0.98),_rgba(11,11,14,0.96))]">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-creator)]">Profile summary</p>
              <h2 className="mt-2 font-display text-4xl">{creatorProfileSummary.headline}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">{creatorProfileSummary.bio}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                {creatorProfileSummary.highlights.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-foreground/80"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/creator/settings">Edit profile</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/creator/pricing">Adjust pricing</Link>
                </Button>
              </div>
            </div>

            <div
              className="min-h-72 border-t border-white/10 bg-cover bg-center lg:min-h-full lg:border-l lg:border-t-0"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(12,12,16,0.08), rgba(12,12,16,0.72)), url(${creatorProfileSummary.coverUrl})`,
              }}
            />
          </div>
        </Card>

        <Card className="border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Audience pulse</p>
          <div className="mt-4 grid gap-3">
            {creatorAudienceSnapshot.map((item) => (
              <div key={item.label} className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{item.label}</p>
                <p className="mt-2 font-display text-3xl">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-[1.75rem] border border-white/10 bg-[var(--color-creator)]/10 p-4">
            <p className="text-sm font-medium text-foreground">{creatorProfileSummary.profileCompleteness}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Keep profile visuals, pricing, and publishing cadence tight to preserve the premium feel.
            </p>
          </div>
          <div className="mt-4 rounded-[1.75rem] border border-white/10 bg-black/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Compliance lane</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatusBadge tone={getCreatorApprovalTone(creatorComplianceSummary.approvalStatus)}>
                {getCreatorApprovalStatusLabel(creatorComplianceSummary.approvalStatus)}
              </StatusBadge>
              <StatusBadge tone={getCreatorVerificationTone(creatorComplianceSummary.verificationStatus)}>
                {getCreatorVerificationStatusLabel(creatorComplianceSummary.verificationStatus)}
              </StatusBadge>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{creatorComplianceSummary.readinessNote}</p>
            <Button asChild variant="ghost" className="mt-3">
              <Link href="/creator/compliance">Open compliance workspace</Link>
            </Button>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="border-white/10 bg-white/[0.04] p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Recent posts</p>
              <h2 className="mt-2 font-display text-3xl">Publishing performance</h2>
            </div>
            <Button asChild variant="ghost">
              <Link href="/creator/posts">Manage all</Link>
            </Button>
          </div>

          <div className="mt-5 grid gap-3">
            {recentPosts.map((post) => (
              <div key={post.id} className="rounded-[1.75rem] border border-white/10 bg-black/20 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[var(--color-creator)]/25 bg-[var(--color-creator)]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-creator)]">
                    {getCreatorPostVisibilityLabel(post.visibility)}
                  </span>
                  <span className="text-xs text-muted-foreground">{post.publishedLabel}</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold">{post.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{post.caption}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-foreground/80">
                  <span>{post.engagementLabel}</span>
                  <span>{post.earningsLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-white/10 bg-white/[0.04] p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Conversations</p>
              <h2 className="mt-2 font-display text-3xl">High-intent fans</h2>
            </div>
            <Button asChild variant="ghost">
              <Link href="/creator/messages">Open inbox</Link>
            </Button>
          </div>

          <div className="mt-5 grid gap-3">
            {recentConversations.map((conversation) => (
              <div key={conversation.id} className="rounded-[1.75rem] border border-white/10 bg-black/20 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{conversation.fanName}</p>
                    <p className="text-sm text-muted-foreground">
                      {conversation.fanHandle} · {conversation.lastMessageAt}
                    </p>
                  </div>
                  {conversation.unreadCount > 0 ? (
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {conversation.unreadCount} unread
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm text-foreground/80">{conversation.lastMessagePreview}</p>
                <div className="mt-4 flex items-center justify-between gap-3 text-sm text-muted-foreground">
                  <span>
                    Suggested offer {formatCreatorCurrency(conversation.suggestedOfferCents)}
                  </span>
                  <ArrowRight className="size-4" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Link href="/creator/posts" className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 transition hover:border-primary/30">
          <LayoutGrid className="size-5 text-primary" />
          <h3 className="mt-4 text-lg font-semibold">Manage posts</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Review public teasers, subscriber-only drops, drafts, and scheduled content in one place.
          </p>
        </Link>

        <Link href="/creator/subscribers" className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 transition hover:border-primary/30">
          <Users className="size-5 text-primary" />
          <h3 className="mt-4 text-lg font-semibold">Understand subscribers</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Spot VIPs, renewal risk, and the fans most likely to convert on paid messages.
          </p>
        </Link>

        <Link href="/creator/pricing" className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 transition hover:border-primary/30">
          <BadgeDollarSign className="size-5 text-primary" />
          <h3 className="mt-4 text-lg font-semibold">Tune pricing</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Adjust subscription pricing and paid-message defaults without changing the page structure later.
          </p>
        </Link>

        <Link href="/creator/compliance" className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 transition hover:border-primary/30">
          <Users className="size-5 text-primary" />
          <h3 className="mt-4 text-lg font-semibold">Manage compliance hooks</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Review approval state, verification placeholders, and public reporting paths from one creator-facing surface.
          </p>
        </Link>
      </section>
    </div>
  );
}
