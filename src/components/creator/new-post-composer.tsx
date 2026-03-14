"use client";

import type { ChangeEvent } from "react";
import { useMemo, useState } from "react";
import { CalendarClock, CheckCircle2, ImagePlus, Lock, Sparkles, Upload, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { creatorProfileSummary, getCreatorPostVisibilityLabel } from "@/lib/creator/demo-data";
import { cn } from "@/lib/utils";

type Visibility = "PUBLIC" | "SUBSCRIBER_ONLY";

export function NewPostComposer() {
  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("SUBSCRIBER_ONLY");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [publishTiming, setPublishTiming] = useState("now");
  const [internalNote, setInternalNote] = useState("");

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    setSelectedFiles(files.map((file) => file.name));
  }

  const previewLabel = useMemo(() => {
    if (!caption.trim()) {
      return "Add a caption to see how this post would read in the feed.";
    }

    if (visibility === "PUBLIC") {
      return "This preview reads like a public teaser meant to pull fans into the profile.";
    }

    return "This preview reads like a subscriber post with a clear members-only payoff.";
  }, [caption, visibility]);

  const publishTimingLabel =
    publishTiming === "tonight" ? "Queue for tonight" : publishTiming === "tomorrow" ? "Queue for tomorrow" : "Publish now";
  const selectedFileCount = selectedFiles.length;
  const selectedAudienceLabel = getCreatorPostVisibilityLabel(visibility);
  const selectedAudienceSummary =
    visibility === "PUBLIC"
      ? "Visible to all fans and meant to drive profile traffic."
      : "Visible to paying subscribers and meant to increase retention.";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
      <Card className="border-white/10 bg-[linear-gradient(180deg,_rgba(22,22,28,0.96),_rgba(11,11,15,0.98))] p-5 sm:p-6">
        <div className="grid gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-creator)]">Publishing flow</p>
            <h2 className="mt-2 font-display text-3xl">Build the post from top to bottom</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Pick the audience first, then write the post, add media, set timing, and review the preview. Publish and
              draft-save stay disabled in this environment.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Audience</p>
              <p className="mt-2 font-medium text-foreground">{selectedAudienceLabel}</p>
              <p className="mt-2 text-sm text-muted-foreground">{selectedAudienceSummary}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Media selected</p>
              <p className="mt-2 font-medium text-foreground">{selectedFileCount === 0 ? "No files yet" : `${selectedFileCount} file${selectedFileCount === 1 ? "" : "s"}`}</p>
              <p className="mt-2 text-sm text-muted-foreground">Uploads stay local in this preview.</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Timing</p>
              <p className="mt-2 font-medium text-foreground">{publishTimingLabel}</p>
              <p className="mt-2 text-sm text-muted-foreground">Use this to test the scheduling controls.</p>
            </div>
          </div>

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
                <p className="mt-1 text-sm leading-6 text-muted-foreground">Use this for discovery, profile visits, and the first hook.</p>
                <div className="mt-4 rounded-2xl border border-primary/15 bg-black/20 px-3 py-2 text-sm text-muted-foreground">
                  Best when the post should widen the funnel.
                </div>
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
                <p className="mt-1 text-sm leading-6 text-muted-foreground">Use this for member value, retention, and premium drops.</p>
                <div className="mt-4 rounded-2xl border border-[var(--color-creator)]/15 bg-black/20 px-3 py-2 text-sm text-muted-foreground">
                  Best when the post should reward active members.
                </div>
              </button>
            </div>
          </div>

          <div className="grid gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-8 items-center justify-center rounded-full border border-[var(--color-creator)]/20 bg-[var(--color-creator)]/10 text-sm font-semibold text-[var(--color-creator)]">
                2
              </span>
              <div>
                <Label htmlFor="post-caption">Write the caption</Label>
                <p className="mt-1 text-sm text-muted-foreground">Lead with the hook, then explain what the fan gets and why this post matters.</p>
              </div>
            </div>
            <Textarea
              id="post-caption"
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
                  <p className="mt-1 text-sm text-muted-foreground">File selection works here, but uploads remain local to this browser until the real pipeline is wired.</p>
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
                      Pick files, confirm the names, and use the preview card to check whether the audience choice still fits.
                    </p>
                  </div>
                </div>

                <Input
                  id="post-upload"
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleFileChange}
                  className="mt-4 file:mr-3 file:rounded-full file:border file:border-white/10 file:px-3 file:py-1.5 file:text-xs file:text-foreground"
                />

                <div className="mt-4 grid gap-2">
                  {selectedFiles.length > 0 ? (
                    selectedFiles.map((fileName) => (
                      <div
                        key={fileName}
                        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-foreground/80"
                      >
                        <ImagePlus className="size-4 text-[var(--color-creator)]" />
                        <span className="truncate">{fileName}</span>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-muted-foreground">
                      No media selected yet. Add at least one file to complete the post package.
                    </div>
                  )}
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
                  <p className="mt-1 text-sm text-muted-foreground">Scheduling controls are safe to test here even though the final save and publish actions are disabled.</p>
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
                <p className="text-sm font-medium text-foreground">Review what is safe to test</p>
                <p className="mt-1 text-sm text-muted-foreground">You can validate copy, audience, file selection, preview behavior, and scheduling controls here.</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-4">
                <div className="flex items-center gap-2 text-[var(--color-creator)]">
                  <CheckCircle2 className="size-4" />
                  <p className="text-xs font-semibold uppercase tracking-[0.22em]">Safe to review</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Caption updates, visibility switching, file-name selection, preview messaging, timing selection, and internal notes.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Lock className="size-4" />
                  <p className="text-xs font-semibold uppercase tracking-[0.22em]">Disabled here</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Draft persistence, real uploads, scheduled delivery, and live publishing still need the production submission flow.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button" disabled>
                Publish disabled in preview
              </Button>
              <Button type="button" variant="outline" disabled>
                Draft save disabled
              </Button>
            </div>
          </div>
        </div>
      </Card>

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
              {selectedFileCount === 0 ? "No files" : `${selectedFileCount} selected`}
            </span>
          </div>

          <p className="mt-4 text-sm leading-7 text-foreground/85">
            {caption.trim() || "Your caption preview will appear here once you start writing."}
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
            This form is safe to review, but saving and publishing are disabled until the real submission flow is wired.
          </p>
        </div>
      </Card>
    </div>
  );
}
