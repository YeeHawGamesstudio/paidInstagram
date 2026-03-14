import Link from "next/link";
import { BadgeDollarSign, LayoutGrid, MessageSquareText, ShieldAlert, Users } from "lucide-react";

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
  creatorSubscribers,
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
  const unreadConversations = creatorConversations.filter((conversation) => conversation.unreadCount > 0).length;
  const atRiskSubscribers = creatorSubscribers.filter((subscriber) => subscriber.status === "AT_RISK").length;
  const scheduledPosts = creatorPosts.filter((post) => post.status === "SCHEDULED").length;

  return (
    <div className="grid gap-6">
      <CreatorPageHeader
        eyebrow="Creator dashboard"
        title={`Studio overview for ${creatorProfileSummary.displayName}`}
        description="Check inbox pressure, recent posts, subscriber momentum, and compliance status from one creator dashboard."
        compact={false}
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
          label="Conversion rate"
          value={creatorProfileSummary.conversionLabel}
          detail={`${creatorProfileSummary.activeSubscribers} active subscribers`}
          icon={Users}
        />

        <MetricCard
          label="Inbox pressure"
          value={creatorProfileSummary.unreadConversations}
          detail={creatorProfileSummary.replyWindowLabel}
          icon={MessageSquareText}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
        <Card className="border-white/10 bg-[linear-gradient(180deg,_rgba(19,19,24,0.98),_rgba(11,11,14,0.96))] p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-creator)]">Action lane</p>
          <h2 className="mt-2 font-display text-4xl">Start with what needs attention</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
            Work the inbox, catch renewal risk, review scheduled content, and clear compliance follow-up before polishing the
            profile.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Unread threads</p>
              <p className="mt-2 font-display text-3xl">{unreadConversations}</p>
              <p className="mt-2 text-sm text-muted-foreground">{creatorProfileSummary.replyWindowLabel}</p>
              <Button asChild className="mt-4">
                <Link href="/creator/messages">Open inbox</Link>
              </Button>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Renewal risk</p>
              <p className="mt-2 font-display text-3xl">{atRiskSubscribers}</p>
              <p className="mt-2 text-sm text-muted-foreground">Subscribers currently marked at risk.</p>
              <Button asChild className="mt-4" variant="outline">
                <Link href="/creator/subscribers">Review subscribers</Link>
              </Button>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Scheduled posts</p>
              <p className="mt-2 font-display text-3xl">{scheduledPosts}</p>
              <p className="mt-2 text-sm text-muted-foreground">Queued content that still needs a final check.</p>
              <Button asChild className="mt-4" variant="outline">
                <Link href="/creator/posts">Review posts</Link>
              </Button>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Compliance follow-up</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <StatusBadge tone={getCreatorApprovalTone(creatorComplianceSummary.approvalStatus)}>
                  {getCreatorApprovalStatusLabel(creatorComplianceSummary.approvalStatus)}
                </StatusBadge>
                <StatusBadge tone={getCreatorVerificationTone(creatorComplianceSummary.verificationStatus)}>
                  {getCreatorVerificationStatusLabel(creatorComplianceSummary.verificationStatus)}
                </StatusBadge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">Verification still needs attention in the current setup.</p>
              <Button asChild className="mt-4" variant="outline">
                <Link href="/creator/compliance">Open compliance</Link>
              </Button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/creator/posts/new">New post</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/creator/pricing">Adjust pricing</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/creator/settings">Edit profile later</Link>
            </Button>
          </div>
        </Card>

        <Card className="border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Business snapshot</p>
          <div className="mt-4 grid gap-3">
            {creatorAudienceSnapshot.map((item) => (
              <div key={item.label} className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{item.label}</p>
                <p className="mt-2 font-display text-3xl">{item.value}</p>
              </div>
            ))}
            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Monthly recurring</p>
              <p className="mt-2 font-display text-3xl">
                {formatCreatorCurrency(creatorProfileSummary.monthlyRecurringRevenueCents)}
              </p>
            </div>
          </div>
          <div className="mt-5 rounded-[1.75rem] border border-white/10 bg-[var(--color-creator)]/10 p-4">
            <p className="text-sm font-medium text-foreground">{creatorProfileSummary.profileCompleteness}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Keep profile work secondary until inbox, pricing, and compliance priorities are under control.
            </p>
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
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-foreground/80">
                    {post.engagementLabel}
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-foreground/80">
                    {post.earningsLabel}
                  </div>
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
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-muted-foreground">
                  Suggested offer {formatCreatorCurrency(conversation.suggestedOfferCents)}
                </div>
              </div>
            ))}
          </div>
        </Card>
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

        <div className="grid gap-4 self-start">
          <Link href="/creator/posts" className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 transition hover:border-primary/30">
            <LayoutGrid className="size-5 text-primary" />
            <h3 className="mt-4 text-lg font-semibold">Manage posts</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Review public teasers, subscriber-only drops, drafts, and scheduled content in one place.
            </p>
          </Link>

          <Link href="/creator/subscribers" className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 transition hover:border-primary/30">
            <ShieldAlert className="size-5 text-primary" />
            <h3 className="mt-4 text-lg font-semibold">Review retention risk</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Spot VIPs, renewal risk, and fans who may still convert on one-off drops.
            </p>
          </Link>

          <Link href="/creator/pricing" className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 transition hover:border-primary/30">
            <BadgeDollarSign className="size-5 text-primary" />
            <h3 className="mt-4 text-lg font-semibold">Tune pricing</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Adjust membership pricing and locked-message defaults once the main action lane is covered.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
