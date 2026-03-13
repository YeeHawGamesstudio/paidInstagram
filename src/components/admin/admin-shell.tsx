"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { MetricCard } from "@/components/shared/metric-card";
import { RoleNavigation } from "@/components/shared/role-navigation";
import { adminPlatformMetrics } from "@/lib/admin/demo-data";
import { adminNavigation } from "@/lib/admin/navigation";

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const isDashboard = pathname === "/admin";
  const activeSection = adminNavigation.find((item) =>
    item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.matchPrefix),
  );

  return (
    <>
      <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-5 px-3 pb-24 pt-3 sm:px-6 sm:pb-28 sm:pt-5 md:pb-8 lg:px-8">
        <header className="overflow-hidden rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,_rgba(24,24,30,0.99),_rgba(11,11,14,0.99))] shadow-[0_24px_72px_rgba(0,0,0,0.3)]">
          <div className="border-b border-white/10 p-3.5 sm:p-5">
            {isDashboard ? (
              <div className="flex flex-col gap-4 sm:gap-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                  <div className="min-w-0 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href="/"
                        className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[11px] uppercase tracking-[0.24em] text-foreground/70 transition hover:border-primary/40 hover:text-foreground"
                      >
                        OnlyClaw
                      </Link>
                      <span className="rounded-full border border-[var(--color-admin)]/20 bg-[var(--color-admin)]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-admin)]">
                        Admin operations
                      </span>
                      <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/70">
                        Internal tooling
                      </span>
                    </div>
                    <SignOutButton className="mt-3 h-8 px-3 text-[11px] sm:mt-0 sm:hidden" variant="destructive" />

                    <h1 className="mt-4 max-w-[12ch] font-display text-[2.4rem] leading-[0.95] sm:mt-5 sm:max-w-none sm:text-[2.8rem]">
                      Structured oversight for platform safety
                    </h1>
                    <p className="mt-3 max-w-[34ch] text-sm leading-6 text-foreground/72 sm:max-w-2xl sm:text-[15px]">
                      Review creators, users, reports, and queued content with a more utilitarian control surface that still fits the OnlyClaw premium product.
                    </p>
                  </div>

                  <div className="rounded-[1.25rem] border border-white/12 bg-black/25 px-3.5 py-3 sm:rounded-[1.5rem] sm:px-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-admin)]">Shift status</p>
                    <p className="mt-2 text-sm font-medium text-foreground">Queue stable with manual escalations pending</p>
                    <p className="mt-1 text-xs leading-5 text-foreground/68">Use staging data carefully and confirm outcomes in the audit trail after each action.</p>
                  </div>
                  <SignOutButton className="hidden h-8 px-3 text-[11px] sm:inline-flex" variant="destructive" />
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {adminPlatformMetrics.map((item) => (
                    <MetricCard
                      key={item.label}
                      label={item.label}
                      value={item.value}
                      detail={item.detail}
                      className="rounded-[1.5rem] border-white/12 bg-white/[0.05] px-4 py-3"
                      labelClassName="text-foreground/70"
                      valueClassName="mt-2 text-3xl"
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href="/"
                      className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[11px] uppercase tracking-[0.24em] text-foreground/70 transition hover:border-primary/40 hover:text-foreground"
                    >
                      OnlyClaw
                    </Link>
                    <span className="rounded-full border border-[var(--color-admin)]/20 bg-[var(--color-admin)]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-admin)]">
                      Admin operations
                    </span>
                    {activeSection ? (
                      <span className="hidden rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/70 sm:inline-flex">
                        {activeSection.label}
                      </span>
                    ) : null}
                  </div>
                  <SignOutButton className="h-8 px-3 text-[11px]" variant="destructive" />
                </div>

                <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                  <div className="min-w-0">
                    <h1 className="font-display text-[1.7rem] sm:text-[2rem]">Admin operations</h1>
                    <p className="mt-1 max-w-[34ch] text-sm leading-6 text-foreground/72 sm:max-w-none">
                      Internal moderation, review, and account tooling.
                    </p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted-foreground sm:hidden">
                    {activeSection?.label ?? "Admin"}
                  </div>
                </div>
              </div>
            )}
          </div>

          <RoleNavigation
            items={adminNavigation}
            rootHref="/admin"
            desktopWrapperClassName={isDashboard ? "p-4" : "px-4 py-3"}
            desktopActiveClassName="border-[var(--color-admin)]/30 bg-[var(--color-admin)]/12 text-foreground"
            desktopInactiveClassName="border-white/10 bg-white/[0.04] text-muted-foreground hover:border-[var(--color-admin)]/25 hover:text-foreground"
            mobileWrapperClassName="border-t border-white/10 bg-background/94 px-3 py-3 backdrop-blur-xl"
            mobileActiveClassName="border-[var(--color-admin)]/30 bg-[var(--color-admin)]/12 text-foreground"
            mobileInactiveClassName="border-white/10 bg-white/[0.04] text-muted-foreground"
          />
        </header>

        <div className="grid gap-6">{children}</div>
      </main>
    </>
  );
}
