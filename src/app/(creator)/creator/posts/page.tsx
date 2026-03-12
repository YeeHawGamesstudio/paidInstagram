import Link from "next/link";
import { CalendarClock, Eye, Lock, Sparkles } from "lucide-react";

import { CreatorPageHeader } from "@/components/creator/creator-page-header";
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

export default function CreatorPostsPage() {
  const publishedCount = creatorPosts.filter((post) => post.status === "PUBLISHED").length;
  const scheduledCount = creatorPosts.filter((post) => post.status === "SCHEDULED").length;
  const draftCount = creatorPosts.filter((post) => post.status === "DRAFT").length;

  return (
    <div className="grid gap-6">
      <CreatorPageHeader
        eyebrow="Posts manager"
        title="Control every teaser and premium drop"
        description="Manage public conversion posts, subscriber-only content, drafts, and scheduled drops from one premium publishing view."
        actions={
          <Button asChild>
            <Link href="/creator/posts/new">Create new post</Link>
          </Button>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Published</p>
          <p className="mt-3 font-display text-4xl">{publishedCount}</p>
          <p className="mt-2 text-sm text-muted-foreground">Live and actively driving feed engagement.</p>
        </Card>
        <Card className="border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Scheduled</p>
          <p className="mt-3 font-display text-4xl">{scheduledCount}</p>
          <p className="mt-2 text-sm text-muted-foreground">Queued to maintain a polished publishing cadence.</p>
        </Card>
        <Card className="border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Drafts</p>
          <p className="mt-3 font-display text-4xl">{draftCount}</p>
          <p className="mt-2 text-sm text-muted-foreground">Reserved for future refinement and campaign testing.</p>
        </Card>
      </section>

      <section className="grid gap-4">
        {creatorPosts.map((post) => {
          const VisibilityIcon = getVisibilityIcon(post.visibility);

          return (
            <Card key={post.id} className="overflow-hidden border-white/10 bg-[linear-gradient(180deg,_rgba(20,20,24,0.98),_rgba(11,11,14,0.96))]">
              <div className="grid gap-0 lg:grid-cols-[18rem_minmax(0,1fr)]">
                <div
                  className="min-h-64 bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(180deg, rgba(10,10,12,0.15), rgba(10,10,12,0.58)), url(${post.coverUrl})`,
                  }}
                />

                <div className="flex flex-col gap-5 p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-[var(--color-creator)]/25 bg-[var(--color-creator)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-creator)]">
                      <VisibilityIcon className="size-3.5" />
                      {getCreatorPostVisibilityLabel(post.visibility)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      <CalendarClock className="size-3.5" />
                      {getCreatorPostStatusLabel(post.status)}
                    </span>
                    <span className="text-xs text-muted-foreground">{post.publishedLabel}</span>
                  </div>

                  <div>
                    <h2 className="font-display text-3xl">{post.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{post.caption}</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
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

                  <div className="flex flex-wrap gap-3">
                    <Button type="button">Edit post</Button>
                    <Button type="button" variant="outline">
                      Duplicate
                    </Button>
                    <Button type="button" variant="ghost">
                      Archive
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
