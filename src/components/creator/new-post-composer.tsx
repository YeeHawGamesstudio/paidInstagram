"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, CheckCircle2, ImagePlus, Lock, Sparkles, Upload, Users } from "lucide-react";

import { createCreatorPostAction, type CreatorPostActionState } from "@/app/actions/creator-posts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { creatorProfileSummary, getCreatorPostVisibilityLabel } from "@/lib/creator/demo-data";
import { cn } from "@/lib/utils";

type Visibility = "PUBLIC" | "SUBSCRIBER_ONLY";

const initialState: CreatorPostActionState = {
  ok: false,
  message: "",
};

export function NewPostComposer() {
  const router = useRouter();
  const [actionState, formAction, isPending] = useActionState(createCreatorPostAction, initialState);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("SUBSCRIBER_ONLY");
  const [publishTiming, setPublishTiming] = useState("now");
  const [internalNote, setInternalNote] = useState("");

  useEffect(() => {
    if (!actionState.ok) {
      return;
    }

    router.push("/creator/posts");
    router.refresh();
  }, [actionState.ok, router]);

  const previewLabel = useMemo(() => {
    if (!title.trim() && !caption.trim()) {
      return "Add a caption to see how this post would read in the feed.";
    }

    if (visibility === "PUBLIC") {
      return "This preview reads like a public teaser meant to pull fans into the profile.";
    }

    return "This preview reads like a subscriber post with a clear members-only payoff.";
  }, [caption, title, visibility]);

  const publishTimingLabel =
    publishTiming === "tonight" ? "Queue for tonight" : publishTiming === "tomorrow" ? "Queue for tomorrow" : "Publish now";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
      <form action={formAction}>
        <input type="hidden" name="visibility" value={visibility} />
        <input type="hidden" name="publishTiming" value={publishTiming} />
        <Card className="border-white/10 bg-[linear-gradient(180deg,_rgba(22,22,28,0.96),_rgba(11,11,15,0.98))] p-5 sm:p-6">
        <div className="grid gap-6">
          

          

          <div className="grid gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-8 items-center justify-center rounded-full border border-[var(--color-creator)]/20 bg-[var(--color-creator)]/10 text-sm font-semibold text-[var(--color-creator)]">
                1
              </span>
              <div>
                <Label>Choose the audience</Label>
                <p className="mt-1 text-sm text-muted-foreground">Decide whether this post is a public teaser or a member-only drop before writing the copy.</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setVisibility("PUBLIC")}
                className={cn(
                  "rounded-[1.75rem] border p-4 text-left transition",
                  visibility === "PUBLIC"
                    ? "border-primary/35 bg-primary/10"
                    : "border-white/10 bg-white/[0.03] hover:border-primary/20",
                )}
              >
                <div className="flex items-center gap-2 text-primary">
                  <Sparkles className="size-4" />
                  <span className="text-xs font-semibold uppercase tracking-[0.22em]">Public teaser</span>
                </div>
                <p className="mt-3 font-medium text-foreground">Visible to everyone</p>
              </button>

              <button
                type="button"
                onClick={() => setVisibility("SUBSCRIBER_ONLY")}
                className={cn(
                  "rounded-[1.75rem] border p-4 text-left transition",
                  visibility === "SUBSCRIBER_ONLY"
                    ? "border-[var(--color-creator)]/35 bg-[var(--color-creator)]/10"
                    : "border-white/10 bg-white/[0.03] hover:border-[var(--color-creator)]/20",
                )}
              >
                <div className="flex items-center gap-2 text-[var(--color-creator)]">
                  <Lock className="size-4" />
                  <span className="text-xs font-semibold uppercase tracking-[0.22em]">Subscriber-only</span>
                </div>
                <p className="mt-3 font-medium text-foreground">Visible to paying subscribers</p>
              </button>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-8 items-center justify-center rounded-full border border-[var(--color-creator)]/20 bg-[var(--color-creator)]/10 text-sm font-semibold text-[var(--color-creator)]">
                2
              </span>
              <div>
                <Label htmlFor="post-title">Add the title and caption</Label>
                <p className="mt-1 text-sm text-muted-foreground">Lead with the hook in the title, then explain what the fan gets and why this post matters.</p>
              </div>
            </div>
            <Input
              id="post-title"
              name="title"
              placeholder="Name the post so it is easy to spot later."
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <Textarea
              id="post-caption"
              name="caption"
              placeholder="Write the teaser, describe the drop, and set clear expectations."
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
            />
            <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>{visibility === "PUBLIC" ? "Keep this short and clickable for new visitors." : "Spell out the members-only value clearly."}</span>
              <span>{caption.trim().length}/280</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-3 sm:col-span-2">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-8 items-center justify-center rounded-full border border-[var(--color-creator)]/20 bg-[var(--color-creator)]/10 text-sm font-semibold text-[var(--color-creator)]">
                  3
                </span>
                <div>
                  <Label htmlFor="post-upload">Add media</Label>
                  <p className="mt-1 text-sm text-muted-foreground">Media uploads are coming soon. Currently, only text posts can be published.</p>
                </div>
              </div>
              <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-black/20 p-5">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-[var(--color-creator)]">
                    <Upload className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">Images or short videos</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Real upload, storage, and attachment creation are not wired yet, so this release keeps posting focused on text.
                    </p>
                  </div>
                </div>

                <Input
                  id="post-upload"
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  disabled
                  className="mt-4 file:mr-3 file:rounded-full file:border file:border-white/10 file:px-3 file:py-1.5 file:text-xs file:text-foreground"
                />

                <div className="mt-4 grid gap-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-muted-foreground">
                    Media uploads are coming soon. For now, you can publish text-only posts.
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:col-span-2">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-8 items-center justify-center rounded-full border border-[var(--color-creator)]/20 bg-[var(--color-creator)]/10 text-sm font-semibold text-[var(--color-creator)]">
                  4
                </span>
                <div>
                  <Label htmlFor="publish-timing">Set timing and notes</Label>
                  <p className="mt-1 text-sm text-muted-foreground">Save as draft, publish immediately, or schedule for later.</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="publish-timing">Publish timing</Label>
                  <select
                    id="publish-timing"
                    value={publishTiming}
                    onChange={(event) => setPublishTiming(event.target.value)}
                    className="h-11 rounded-2xl border border-border bg-input px-4 text-sm text-foreground outline-none focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/25"
                  >
                    <option value="now">Publish now</option>
                    <option value="tonight">Queue for tonight</option>
                    <option value="tomorrow">Queue for tomorrow</option>
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="internal-note">Internal note</Label>
                  <Input
                    id="internal-note"
                    value={internalNote}
                    onChange={(event) => setInternalNote(event.target.value)}
                    placeholder="Optional campaign or content note"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-8 items-center justify-center rounded-full border border-[var(--color-creator)]/20 bg-[var(--color-creator)]/10 text-sm font-semibold text-[var(--color-creator)]">
                5
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">Review and publish</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-4">
                <div className="flex items-center gap-2 text-[var(--color-creator)]">
                  <CheckCircle2 className="size-4" />
                  <p className="text-xs font-semibold uppercase tracking-[0.22em]">Safe to review</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Caption updates, visibility switching, preview messaging, timing selection, and internal notes.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Lock className="size-4" />
                  <p className="text-xs font-semibold uppercase tracking-[0.22em]">Still to come</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Real uploads and media attachments still need the production media pipeline.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="submit" name="submitMode" value="publish" disabled={isPending}>
                {isPending ? "Saving..." : publishTiming === "now" ? "Publish post" : "Schedule post"}
              </Button>
              <Button type="submit" name="submitMode" value="draft" variant="outline" disabled={isPending}>
                {isPending ? "Saving..." : "Save draft"}
              </Button>
            </div>
            {actionState.message ? (
              <p className={`text-sm ${actionState.ok ? "text-emerald-300" : "text-rose-300"}`}>{actionState.message}</p>
            ) : null}
          </div>
        </div>
        </Card>
      </form>

      <Card className="self-start border-white/10 bg-[linear-gradient(180deg,_rgba(45,24,75,0.32),_rgba(11,11,15,0.98))] p-5 sm:p-6 lg:sticky lg:top-24">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-creator)]">Live preview</p>
        <p className="mt-2 text-sm text-muted-foreground">On mobile this preview stacks after the form. On desktop it stays visible while you review the steps.</p>
        <div className="mt-4 rounded-[1.75rem] border border-white/10 bg-black/25 p-5">
          <div className="flex items-center gap-3">
            <div
              className="size-12 rounded-[1.25rem] border border-white/10 bg-cover bg-center"
              style={{ backgroundImage: `url(${creatorProfileSummary.avatarUrl})` }}
            />
            <div>
              <p className="font-semibold">{creatorProfileSummary.displayName}</p>
              <p className="text-sm text-muted-foreground">{creatorProfileSummary.handle}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
                visibility === "PUBLIC"
                  ? "border-primary/25 bg-primary/10 text-primary"
                  : "border-[var(--color-creator)]/25 bg-[var(--color-creator)]/10 text-[var(--color-creator)]",
              )}
            >
              {getCreatorPostVisibilityLabel(visibility)}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-muted-foreground">
              <Users className="size-3.5" />
              Feed preview
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-muted-foreground">
              <CalendarClock className="size-3.5" />
              {publishTimingLabel}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-muted-foreground">
              <ImagePlus className="size-3.5" />
              Media deferred
            </span>
          </div>

          <p className="mt-4 text-sm leading-7 text-foreground/85">
            {title.trim() || "Title preview"}
          </p>

          <p className="mt-3 text-sm leading-7 text-foreground/75">
            {caption.trim() || "Caption preview"}
          </p>

          <div className="mt-5 rounded-[1.5rem] border border-dashed border-white/15 bg-white/[0.03] p-4 text-sm text-muted-foreground">
            {previewLabel}
          </div>

          {internalNote.trim() ? (
            <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 text-sm text-muted-foreground">
              Internal note: {internalNote}
            </div>
          ) : null}
        </div>

        <div className="mt-5 rounded-[1.75rem] border border-white/10 bg-black/20 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Publishing note</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Draft saving, publishing, and scheduling are active for text-only posts. Media uploads remain out of scope until the
            upload pipeline exists end to end.
          </p>
        </div>
      </Card>
    </div>
  );
}
