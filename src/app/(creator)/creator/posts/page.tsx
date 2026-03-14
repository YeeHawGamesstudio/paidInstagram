import Link from "next/link";
import { CalendarClock, Eye, Lock, Sparkles } from "lucide-react";

import { CreatorPageHeader } from "@/components/creator/creator-page-header";
import { EmptyStateCard } from "@/components/shared/empty-state-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  creatorPosts,
  getCreatorPostStatusLabel,
  getCreatorPostVisibilityLabel,
} from "@/lib/creator/demo-data";

function getVisibilityIcon(visibility: "PUBLIC" | "SUBSCRIBER_ONLY") {
  return visibility === "PUBLIC" ? Sparkles : Lock;
}

function getStatusClasses(status: "PUBLISHED" | "SCHEDULED" | "DRAFT") {
  if (status === "PUBLISHED") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-200";
  }

  if (status === "SCHEDULED") {
    return "border-amber-500/20 bg-amber-500/10 text-amber-100";
  }

  return "border-white/10 bg-white/[0.04] text-muted-foreground";
}

function getStatusSummary(status: "PUBLISHED" | "SCHEDULED" | "DRAFT") {
  if (status === "PUBLISHED") {
    return "Live now and already collecting feed traffic.";
  }

  if (status === "SCHEDULED") {
    return "Queued and waiting on a final timing check.";
  }

  return "Still a working draft that needs review before release.";
}

function getNextStep(status: "PUBLISHED" | "SCHEDULED" | "DRAFT") {
  if (status === "PUBLISHED") {
    return "Check performance and decide whether this needs a follow-up teaser or duplicate.";
  }

  if (status === "SCHEDULED") {
    return "Confirm the audience, timing, and attached media before the scheduled release.";
  }

  return "Finish the copy and media, then move this draft back through the composer.";
}

export default function CreatorPostsPage() {
  const publishedCount = creatorPosts.filter((post) => post.status === "PUBLISHED").length;
  const scheduledCount = creatorPosts.filter((post) => post.status === "SCHEDULED").length;
  const draftCount = creatorPosts.filter((post) => post.status === "DRAFT").length;

  return (
    <div className="grid gap-6">
      <CreatorPageHeader
        eyebrow="Posts manager"
        title="Posts, drafts, and scheduled drops"
        description="Review public teasers, subscriber-only posts, drafts, and scheduled releases from one preview workspace."
        actions={
          <Button asChild>
            <Link href="/creator/posts/new">Create new post</Link>
          </Button>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-emerald-500/20 bg-emerald-500/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Published</p>
          <p className="mt-3 font-display text-4xl">{publishedCount}</p>
          <p className="mt-2 text-sm text-emerald-100/80">Live posts currently visible in the feed.</p>
        </Card>
        <Card className="border-amber-500/20 bg-amber-500/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Scheduled</p>
          <p className="mt-3 font-display text-4xl">{scheduledCount}</p>
          <p className="mt-2 text-sm text-amber-100/80">Queued posts waiting on their release time.</p>
        </Card>
        <Card className="border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Drafts</p>
          <p className="mt-3 font-display text-4xl">{draftCount}</p>
          <p className="mt-2 text-sm text-muted-foreground">Saved ideas that still need review or media.</p>
        </Card>
      </section>

      <section className="grid gap-4">
        {creatorPosts.length > 0 ? creatorPosts.map((post) => {
          const VisibilityIcon = getVisibilityIcon(post.visibility);

          return (
            <Card key={post.id} className="overflow-hidden border-white/10 bg-[linear-gradient(180deg,_rgba(20,20,24,0.98),_rgba(11,11,14,0.96))]">
              <div className="grid gap-0 lg:grid-cols-[8.5rem_minmax(0,1fr)]">
                <div
                  className="min-h-28 bg-cover bg-center lg:min-h-full"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(10,10,12,0.15), rgba(10,10,12,0.58)), url(${post.coverUrl})`,
                  }}
                />

                <div className="flex flex-col gap-4 p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-creator)]/25 bg-[var(--color-creator)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-creator)]">
                      <VisibilityIcon className="size-3.5" />
                      {getCreatorPostVisibilityLabel(post.visibility)}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getStatusClasses(post.status)}`}
                    >
                      <CalendarClock className="size-3.5" />
                      {getCreatorPostStatusLabel(post.status)}
                    </span>
                    <span className="text-xs text-muted-foreground">{post.publishedLabel}</span>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)]">
                    <div className="grid gap-4">
                      <div>
                        <h2 className="font-display text-[2rem] leading-tight">{post.title}</h2>
                        <p className="mt-2 text-sm text-muted-foreground">{getStatusSummary(post.status)}</p>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">{post.caption}</p>
                      </div>

                      <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Next step</p>
                        <p className="mt-3 text-sm leading-6 text-foreground/85">{getNextStep(post.status)}</p>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                        <div className="flex items-center gap-2 text-primary">
                          <Eye className="size-4" />
                          <span className="text-xs font-semibold uppercase tracking-[0.2em]">Performance</span>
                        </div>
                        <p className="mt-3 text-sm text-foreground/85">{post.engagementLabel}</p>
                      </div>

                      <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                        <div className="flex items-center gap-2 text-primary">
                          <Sparkles className="size-4" />
                          <span className="text-xs font-semibold uppercase tracking-[0.2em]">Revenue context</span>
                        </div>
                        <p className="mt-3 text-sm text-foreground/85">{post.earningsLabel}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Actions in this preview</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      These controls are visible for workflow review only. Editing, duplication, and archiving are not wired yet.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button type="button" disabled>
                        Edit disabled
                      </Button>
                      <Button type="button" variant="outline" disabled>
                        Duplicate disabled
                      </Button>
                      <Button type="button" variant="ghost" disabled>
                        Archive disabled
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        }) : (
          <EmptyStateCard>
            <div className="space-y-3">
              <p className="font-medium text-foreground">No posts yet.</p>
              <p>Public teasers, subscriber-only posts, drafts, and scheduled releases will appear here once the creator starts publishing.</p>
            </div>
          </EmptyStateCard>
        )}
      </section>
    </div>
  );
}
