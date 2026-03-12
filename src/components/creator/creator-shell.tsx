"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { MetricCard } from "@/components/shared/metric-card";
import { RoleNavigation } from "@/components/shared/role-navigation";
import { creatorProfileSummary, formatCreatorCurrency } from "@/lib/creator/demo-data";
import { creatorNavigation } from "@/lib/creator/navigation";

type CreatorShellProps = {
  children: ReactNode;
};

export function CreatorShell({ children }: CreatorShellProps) {
  return (
    <>
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 pb-28 pt-5 sm:px-6 sm:pt-6 md:pb-8 lg:px-8">
        <header className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(42,22,72,0.84),_rgba(13,12,18,0.98))] shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
          <div
            className="border-b border-white/8 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(180deg, rgba(8,8,12,0.35), rgba(8,8,12,0.8)), url(${creatorProfileSummary.coverUrl})`,
            }}
          >
            <div className="grid gap-5 p-5 sm:p-6">
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
                      Mock-safe workspace
                    </span>
                    <SignOutButton className="h-8 px-3 text-[11px]" variant="ghost" />
                  </div>

                  <div className="mt-5 flex items-end gap-4">
                    <div
                      className="size-20 rounded-[1.6rem] border border-white/15 bg-cover bg-center shadow-[0_20px_40px_rgba(0,0,0,0.35)]"
                      style={{ backgroundImage: `url(${creatorProfileSummary.avatarUrl})` }}
                    />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-creator)]">
                        {creatorProfileSummary.category}
                      </p>
                      <h1 className="mt-2 font-display text-4xl sm:text-5xl">{creatorProfileSummary.displayName}</h1>
                      <p className="mt-2 text-sm text-foreground/70">
                        {creatorProfileSummary.handle} · {creatorProfileSummary.headline}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                    A premium creator control room for publishing, subscriber management, and high-intent direct messages.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <MetricCard
                    label="MRR"
                    value={formatCreatorCurrency(creatorProfileSummary.monthlyRecurringRevenueCents)}
                    className="rounded-3xl border-white/10 bg-black/25 px-4 py-3"
                    labelClassName="text-muted-foreground"
                    valueClassName="mt-1 text-2xl"
                  />
                  <MetricCard
                    label="Subscribers"
                    value={creatorProfileSummary.activeSubscribers}
                    className="rounded-3xl border-white/10 bg-black/25 px-4 py-3"
                    labelClassName="text-muted-foreground"
                    valueClassName="mt-1 text-2xl"
                  />
                  <MetricCard
                    label="Unread"
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
              </div>
            </div>
          </div>

          <RoleNavigation
            items={creatorNavigation}
            rootHref="/creator"
            desktopWrapperClassName="p-4"
            desktopActiveClassName="border-[var(--color-creator)]/30 bg-[var(--color-creator)]/12 text-foreground"
            desktopInactiveClassName="border-white/10 bg-white/[0.04] text-muted-foreground hover:border-[var(--color-creator)]/25 hover:text-foreground"
            mobileActiveClassName="border-[var(--color-creator)]/30 bg-[var(--color-creator)]/12 text-foreground"
            mobileInactiveClassName="border-white/10 bg-white/[0.04] text-muted-foreground"
          />
        </header>

        <div className="grid gap-6">{children}</div>
      </main>

      <div className="pointer-events-none fixed right-6 top-6 hidden rounded-full border border-[var(--color-creator)]/20 bg-[var(--color-creator)]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-creator)] lg:block">
        <div className="pointer-events-auto inline-flex items-center gap-2">
          <Sparkles className="size-3.5" />
          Premium creator flow
        </div>
      </div>
    </>
  );
}
