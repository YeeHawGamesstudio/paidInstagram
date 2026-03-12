"use client";

import type { ChangeEvent } from "react";
import { useMemo, useState } from "react";
import { ImagePlus, Lock, Sparkles, Upload, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { creatorProfileSummary } from "@/lib/creator/demo-data";
import { cn } from "@/lib/utils";

type Visibility = "PUBLIC" | "SUBSCRIBER_ONLY";

export function NewPostComposer() {
  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("SUBSCRIBER_ONLY");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    setSelectedFiles(files.map((file) => file.name));
  }

  const previewLabel = useMemo(() => {
    if (!caption.trim()) {
      return "Add a caption to see the post preview sharpen up.";
    }

    if (visibility === "PUBLIC") {
      return "This preview reads like a public teaser built to convert profile traffic.";
    }

    return "This preview reads like a premium subscriber drop with clear gated value.";
  }, [caption, visibility]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
      <Card className="border-white/10 bg-[linear-gradient(180deg,_rgba(22,22,28,0.96),_rgba(11,11,15,0.98))] p-5 sm:p-6">
        <div className="grid gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-creator)]">Compose post</p>
            <h2 className="mt-2 font-display text-3xl">New premium publication</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Review post copy, media selection, and premium visibility states here before publish actions are enabled for this
              environment.
            </p>
          </div>

          <div className="grid gap-3">
            <Label htmlFor="post-caption">Caption</Label>
            <Textarea
              id="post-caption"
              placeholder="Write the mood, tease the drop, and make the premium value feel irresistible."
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
            />
            <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>High-performing captions usually set the scene before naming the media.</span>
              <span>{caption.trim().length}/280</span>
            </div>
          </div>

          <div className="grid gap-3">
            <Label htmlFor="post-upload">Media upload</Label>
            <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-black/20 p-5">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-3 text-[var(--color-creator)]">
                  <Upload className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">Images or short videos</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Selected files stay local to this browser session until upload handling is enabled.
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

          <div className="grid gap-3">
            <Label>Visibility</Label>
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
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Best for discovery, profile visits, and funneling fans into the paid archive.
                </p>
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
                  <span className="text-xs font-semibold uppercase tracking-[0.22em]">Subscribers only</span>
                </div>
                <p className="mt-3 font-medium text-foreground">Premium gated post</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Best for retention, active member value, and premium content positioning.
                </p>
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="publish-timing">Publish timing</Label>
              <select
                id="publish-timing"
                defaultValue="now"
                className="h-11 rounded-2xl border border-border bg-input px-4 text-sm text-foreground outline-none focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/25"
              >
                <option value="now">Publish now</option>
                <option value="tonight">Queue for tonight</option>
                <option value="tomorrow">Queue for tomorrow</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="internal-note">Internal note</Label>
              <Input id="internal-note" placeholder="Optional campaign or content note" />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="button" disabled>
              Publishing unavailable
            </Button>
            <Button type="button" variant="outline" disabled>
              Draft save unavailable
            </Button>
          </div>
        </div>
      </Card>

      <Card className="border-white/10 bg-[linear-gradient(180deg,_rgba(45,24,75,0.32),_rgba(11,11,15,0.98))] p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-creator)]">Live preview</p>
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
              {visibility === "PUBLIC" ? "Public" : "Subscribers only"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-muted-foreground">
              <Users className="size-3.5" />
              Premium feed preview
            </span>
          </div>

          <p className="mt-4 text-sm leading-7 text-foreground/85">
            {caption.trim() || "Your caption preview will appear here once you start writing."}
          </p>

          <div className="mt-5 rounded-[1.5rem] border border-dashed border-white/15 bg-white/[0.03] p-4 text-sm text-muted-foreground">
            {previewLabel}
          </div>
        </div>

        <div className="mt-5 rounded-[1.75rem] border border-white/10 bg-black/20 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Publishing note</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Save and publish actions are disabled in this environment so the composer can be reviewed without implying completed
            persistence.
          </p>
        </div>
      </Card>
    </div>
  );
}
