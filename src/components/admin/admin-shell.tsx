"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

import { MetricCard } from "@/components/shared/metric-card";
import { RoleNavigation } from "@/components/shared/role-navigation";
import { adminPlatformMetrics } from "@/lib/admin/demo-data";
import { adminNavigation } from "@/lib/admin/navigation";

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  return (
    <>
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 pb-28 pt-5 sm:px-6 sm:pt-6 md:pb-8 lg:px-8">
        <header className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(22,22,28,0.98),_rgba(10,10,13,0.99))] shadow-[0_24px_72px_rgba(0,0,0,0.3)]">
          <div className="border-b border-white/8 p-5 sm:p-6">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href="/"
                      className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs uppercase tracking-[0.28em] text-foreground/70 transition hover:border-primary/40 hover:text-foreground"
                    >
                      OnlyClaw
                    </Link>
                    <span className="rounded-full border border-[var(--color-admin)]/20 bg-[var(--color-admin)]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-admin)]">
                      Admin operations
                    </span>
                    <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/70">
                      Internal tooling
                    </span>
                  </div>

                  <h1 className="mt-5 font-display text-4xl sm:text-5xl">Structured oversight for platform safety</h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                    Review creators, users, reports, and queued content with a more utilitarian control surface that still fits the OnlyClaw premium product.
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-admin)]">Shift status</p>
                  <p className="mt-2 text-sm font-medium text-foreground">Queue stable with manual escalations pending</p>
                  <p className="mt-1 text-xs text-muted-foreground">Use staging data carefully and confirm outcomes in the audit trail after each action.</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {adminPlatformMetrics.map((item) => (
                  <MetricCard
                    key={item.label}
                    label={item.label}
                    value={item.value}
                    detail={item.detail}
                    className="rounded-[1.5rem] border-white/10 bg-white/[0.04] px-4 py-3"
                    labelClassName="text-muted-foreground"
                    valueClassName="mt-2 text-3xl"
                  />
                ))}
              </div>
            </div>
          </div>

          <RoleNavigation
            items={adminNavigation}
            rootHref="/admin"
            desktopWrapperClassName="p-4"
            desktopActiveClassName="border-[var(--color-admin)]/30 bg-[var(--color-admin)]/12 text-foreground"
            desktopInactiveClassName="border-white/10 bg-white/[0.04] text-muted-foreground hover:border-[var(--color-admin)]/25 hover:text-foreground"
            mobileWrapperClassName="border-t border-white/10 bg-background/94 px-3 py-3 backdrop-blur-xl"
            mobileActiveClassName="border-[var(--color-admin)]/30 bg-[var(--color-admin)]/12 text-foreground"
            mobileInactiveClassName="border-white/10 bg-white/[0.04] text-muted-foreground"
          />
        </header>

        <div className="grid gap-6">{children}</div>
      </main>

      <div className="pointer-events-none fixed right-6 top-6 hidden rounded-full border border-[var(--color-admin)]/20 bg-[var(--color-admin)]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-admin)] lg:block">
        <div className="pointer-events-auto inline-flex items-center gap-2">
          <Sparkles className="size-3.5" />
          Admin review surface
        </div>
      </div>
    </>
  );
}
