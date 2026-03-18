"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { MetricCard } from "@/components/shared/metric-card";
import { RoleNavigation } from "@/components/shared/role-navigation";
import { creatorProfileSummary, formatCreatorCurrency } from "@/lib/creator/demo-data";
import { creatorNavigation } from "@/lib/creator/navigation";
import { cn } from "@/lib/utils";

type CreatorShellProps = {
  children: ReactNode;
};

export function CreatorShell({ children }: CreatorShellProps) {
  const pathname = usePathname();
  const isOverview = pathname === "/creator";

  return (
    <>
      <main
        className={cn(
          "mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-28 sm:px-6 md:pb-8 lg:px-8",
          isOverview ? "gap-6 pt-5 sm:pt-6" : "gap-4 pt-4 sm:gap-5 sm:pt-5",
        )}
      >
        <header
          className={cn(
            "overflow-hidden border border-white/10 bg-[linear-gradient(180deg,_rgba(42,22,72,0.84),_rgba(13,12,18,0.98))] shadow-[0_24px_80px_rgba(0,0,0,0.34)]",
            isOverview ? "rounded-[2rem]" : "rounded-[1.65rem]",
          )}
        >
          <div
            className="border-b border-white/8 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(8,8,12,0.35), rgba(8,8,12,0.8)), url(${creatorProfileSummary.coverUrl})`,
            }}
          >
            <div className={cn("grid", isOverview ? "gap-5 p-5 sm:p-6" : "gap-4 p-4 sm:p-5")}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href="/"
                      className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs uppercase tracking-[0.28em] text-foreground/70 transition hover:border-primary/40 hover:text-foreground"
                    >
                      OnlyClaw
                    </Link>
                    <span className="rounded-full border border-[var(--color-creator)]/20 bg-[var(--color-creator)]/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-creator)]">
                      Creator studio
                    </span>
                    <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/70">
                      Beta workspace
                    </span>
                    <SignOutButton className="h-8 px-3 text-[11px]" variant="destructive" />
                  </div>

                  <div className={cn("flex gap-4", isOverview ? "mt-5 items-end" : "mt-3 items-center")}>
                    <div
                      className={cn(
                        "rounded-[1.6rem] border border-white/15 bg-cover bg-center shadow-[0_20px_40px_rgba(0,0,0,0.35)]",
                        isOverview ? "size-20" : "size-14 sm:size-16",
                      )}
                      style={{ backgroundImage: `url(${creatorProfileSummary.avatarUrl})` }}
                    />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-creator)]">
                        {creatorProfileSummary.category}
                      </p>
                      <h1
                        className={cn(
                          "mt-2 font-display",
                          isOverview ? "text-4xl sm:text-5xl" : "text-[1.9rem] sm:text-[2.35rem]",
                        )}
                      >
                        {isOverview ? creatorProfileSummary.displayName : "Creator studio"}
                      </h1>
                      <p className={cn("text-sm text-foreground/70", isOverview ? "mt-2" : "mt-1")}>
                        {isOverview
                          ? `${creatorProfileSummary.handle} · ${creatorProfileSummary.headline}`
                          : `${creatorProfileSummary.displayName} · ${creatorProfileSummary.handle}`}
                      </p>
                    </div>
                  </div>

                  <p
                    className={cn(
                      "max-w-2xl text-sm leading-6 text-muted-foreground",
                      isOverview ? "mt-4 sm:text-base" : "mt-3 max-w-xl",
                    )}
                  >
                    {isOverview
                      ? "Review posts, subscribers, pricing, and inbox activity from one creator workspace."
                      : "Move between publishing, messages, subscribers, pricing, compliance, and settings from one creator workspace."}
                  </p>
                </div>

                {isOverview ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <MetricCard
                      label="MRR"
                      value={formatCreatorCurrency(creatorProfileSummary.monthlyRecurringRevenueCents)}
                      className="rounded-3xl border-white/10 bg-black/25 px-4 py-3"
                      labelClassName="text-muted-foreground"
                      valueClassName="mt-1 text-2xl"
                    />
                    <MetricCard
                      label="Active subscribers"
                      value={creatorProfileSummary.activeSubscribers}
                      className="rounded-3xl border-white/10 bg-black/25 px-4 py-3"
                      labelClassName="text-muted-foreground"
                      valueClassName="mt-1 text-2xl"
                    />
                    <MetricCard
                      label="Unread threads"
                      value={creatorProfileSummary.unreadConversations}
                      className="rounded-3xl border-white/10 bg-black/25 px-4 py-3"
                      labelClassName="text-muted-foreground"
                      valueClassName="mt-1 text-2xl"
                    />
                    <MetricCard
                      label="Monthly price"
                      value={`${creatorProfileSummary.monthlyPriceLabel}/mo`}
                      className="rounded-3xl border-white/10 bg-black/25 px-4 py-3"
                      labelClassName="text-muted-foreground"
                      valueClassName="mt-1 text-base font-semibold"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <RoleNavigation
            items={creatorNavigation}
            rootHref="/creator"
            desktopWrapperClassName={cn(isOverview ? "p-4" : "px-4 pb-4 pt-3 sm:px-5 sm:pb-5")}
            desktopActiveClassName="border-[var(--color-creator)]/30 bg-[var(--color-creator)]/12 text-foreground"
            desktopInactiveClassName="border-white/10 bg-white/[0.04] text-muted-foreground hover:border-[var(--color-creator)]/25 hover:text-foreground"
            mobileWrapperClassName="px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2"
            mobileNavClassName="mx-auto max-w-7xl gap-1 overflow-x-auto pb-1"
            mobileItemClassName="gap-1 rounded-2xl px-2 py-1.5 text-[10px] tracking-[0.01em]"
            mobileActiveClassName="border-[var(--color-creator)]/30 bg-[var(--color-creator)]/12 text-foreground"
            mobileInactiveClassName="border-white/10 bg-white/[0.04] text-muted-foreground"
            mobileIconClassName="size-3"
          />
        </header>

        <div className="grid gap-6">{children}</div>
      </main>

      <div className="pointer-events-none fixed right-6 top-6 hidden rounded-full border border-[var(--color-creator)]/20 bg-[var(--color-creator)]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-creator)] lg:block">
        <div className="pointer-events-auto inline-flex items-center gap-2">
          <Sparkles className="size-3.5" />
          Creator Studio
        </div>
      </div>
    </>
  );
}
