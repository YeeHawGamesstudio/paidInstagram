import Link from "next/link";
import { Crown, Lock, Sparkles } from "lucide-react";

import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getCreatorApprovalStatusLabel,
  getCreatorVerificationStatusLabel,
} from "@/lib/compliance/scaffolding";
import { cn } from "@/lib/utils";
import type { DemoCreator } from "@/lib/public/demo-data";
import { formatPriceMonthly } from "@/lib/public/demo-data";

type CreatorCardProps = {
  creator: DemoCreator;
  layout?: "grid" | "list";
};

export function CreatorCard({ creator, layout = "grid" }: CreatorCardProps) {
  const isList = layout === "list";
  const publicPostCount = creator.posts.filter((post) => post.visibility === "PUBLIC").length;

  return (
    <Card
      className={cn(
        "group overflow-hidden border-white/10 bg-[linear-gradient(180deg,_rgba(22,22,28,0.94),_rgba(12,12,16,0.98))] transition duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-[0_32px_72px_rgba(0,0,0,0.34)]",
        isList && "grid gap-0 md:grid-cols-[260px_minmax(0,1fr)]",
      )}
    >
      <div className={cn("relative min-h-72 overflow-hidden", isList && "md:min-h-full")}>
        <div
          className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-[1.04]"
          style={{ backgroundImage: `linear-gradient(180deg, rgba(8,8,10,0.18), rgba(8,8,10,0.78)), url(${creator.coverUrl})` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(12,12,16,0.02)_0%,_rgba(12,12,16,0.18)_34%,_rgba(12,12,16,0.92)_100%)]" />
        <div className="relative flex h-full flex-col justify-between p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              {creator.category}
            </span>
            <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-xs text-foreground/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              {formatPriceMonthly(creator.priceMonthlyCents, creator.currency)}/mo
            </span>
          </div>

          <div className="flex items-end gap-3">
            <div
              className="size-16 rounded-[1.4rem] border border-white/12 bg-cover bg-center shadow-[0_18px_40px_rgba(0,0,0,0.35)] sm:size-[4.5rem]"
              style={{ backgroundImage: `url(${creator.avatarUrl})` }}
            />
            <div className="min-w-0">
              <p className="font-display text-3xl leading-none sm:text-4xl">{creator.displayName}</p>
              <p className="mt-1 text-sm text-foreground/70">@{creator.username}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 p-5 sm:p-6">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">Featured creator</p>
          <h3 className="font-display text-[2rem] leading-tight sm:text-[2.35rem]">{creator.headline}</h3>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-[0.95rem]">{creator.highlight}</p>
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="success">{getCreatorApprovalStatusLabel(creator.compliance.approvalStatus)}</StatusBadge>
            <StatusBadge tone="warning">{getCreatorVerificationStatusLabel(creator.compliance.verificationStatus)}</StatusBadge>
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-muted-foreground">
              {creator.compliance.adultContentLabel}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {creator.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-xs text-foreground/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
          <div className="rounded-[1.4rem] border border-white/8 bg-black/20 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Public previews</p>
            <div className="mt-2 flex items-center gap-2 text-foreground">
              <Sparkles className="size-4 text-primary" />
              <span className="text-lg font-semibold">{publicPostCount}</span>
            </div>
          </div>
          <div className="rounded-[1.4rem] border border-white/8 bg-black/20 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Exclusive drops</p>
            <div className="mt-2 flex items-center gap-2 text-foreground">
              <Lock className="size-4 text-primary" />
              <span className="text-lg font-semibold">{creator.stats.exclusiveDrops}</span>
            </div>
          </div>
          <div className="rounded-[1.4rem] border border-white/8 bg-black/20 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Typical pace</p>
            <div className="mt-2 flex items-center gap-2 text-foreground">
              <Crown className="size-4 text-primary" />
              <span className="text-sm font-medium">{creator.stats.replyWindow}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="sm:min-w-40">
            <Link href={`/creators/${creator.slug}`}>View profile</Link>
          </Button>
          <Button variant="outline" asChild className="sm:min-w-40">
            <Link href="/login">Access details</Link>
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
          <Link href="/adult-disclaimer" className="text-muted-foreground transition hover:text-foreground">
            18+ disclosure
          </Link>
          <Link href={creator.compliance.reportHref} className="text-muted-foreground transition hover:text-foreground">
            Report or takedown
          </Link>
        </div>
      </div>
    </Card>
  );
}
