"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { RoleNavigation } from "@/components/shared/role-navigation";
import { fanNavigation } from "@/lib/fan/navigation";
import type { FanShellProfile } from "@/lib/fan/server-data";
import { cn } from "@/lib/utils";

type FanShellFrameProps = {
  fanProfile: FanShellProfile;
  children: ReactNode;
};

export function FanShellFrame({ fanProfile, children }: FanShellFrameProps) {
  const pathname = usePathname();
  const isHome = pathname === "/fan";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 px-4 pb-36 pt-3 sm:gap-5 sm:px-6 sm:pt-5 md:pb-8 lg:px-8">
      <header
        className={cn(
          "grid border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(201,169,110,0.12),_transparent_18rem),linear-gradient(180deg,_rgba(22,22,28,0.96),_rgba(11,11,15,0.98))] shadow-[0_24px_60px_rgba(0,0,0,0.3)]",
          isHome ? "gap-4 rounded-[1.75rem] p-4 sm:gap-5 sm:rounded-[2rem] sm:p-5" : "gap-3 rounded-[1.45rem] p-3.5 sm:rounded-[1.75rem] sm:p-4",
        )}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/"
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs uppercase tracking-[0.28em] text-foreground/70 transition hover:border-primary/40 hover:bg-white/[0.06] hover:text-foreground"
              >
                OnlyClaw
              </Link>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
                Fan access
              </span>
              <SignOutButton className="h-8 px-3 text-[11px]" variant="destructive" />
            </div>
            <h1
              className={cn(
                "font-display leading-none",
                isHome ? "mt-3 text-[1.95rem] sm:text-[2.35rem]" : "mt-2.5 text-[1.45rem] sm:text-[1.7rem]",
              )}
            >
              {isHome ? "Premium fan experience" : "Fan hub"}
            </h1>
            <p className={cn("max-w-xl text-sm leading-6 text-muted-foreground", isHome ? "mt-2" : "mt-1.5 max-w-lg")}>
              {isHome
                ? "Quick access to memberships, inbox, and premium activity in a mobile-first layout."
                : "Jump between inbox, memberships, account, and premium activity without losing your place."}
            </p>
          </div>

          {isHome ? (
            <div className="grid grid-cols-2 gap-2.5 sm:w-fit sm:grid-cols-3 sm:gap-3">
              <div className="rounded-[1.35rem] border border-white/8 bg-black/20 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:rounded-[1.6rem] sm:px-4 sm:py-3">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Memberships</p>
                <p className="mt-1 font-display text-xl sm:text-2xl">{fanProfile.membershipCount}</p>
              </div>
              <div className="rounded-[1.35rem] border border-white/8 bg-black/20 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:rounded-[1.6rem] sm:px-4 sm:py-3">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Unread messages</p>
                <p className="mt-1 font-display text-xl sm:text-2xl">{fanProfile.unreadMessages}</p>
              </div>
              <div className="col-span-2 rounded-[1.35rem] border border-white/8 bg-black/20 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:col-span-1 sm:rounded-[1.6rem] sm:px-4 sm:py-3">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Handle</p>
                <p className="mt-1 text-sm font-medium text-foreground">{fanProfile.handle}</p>
              </div>
            </div>
          ) : null}
        </div>

        <RoleNavigation
          items={fanNavigation}
          rootHref="/fan"
          desktopInactiveClassName="border-white/10 bg-white/[0.04] text-muted-foreground hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white/[0.06] hover:text-foreground"
          desktopActiveClassName="border-white/10 bg-white/[0.04] text-muted-foreground hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white/[0.06] hover:text-foreground"
          mobileWrapperClassName="border-0 bg-[linear-gradient(180deg,_rgba(9,9,11,0),_rgba(9,9,11,0.92)_28%,_rgba(9,9,11,0.98)_100%)] px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-xl"
          mobileNavClassName="grid max-w-lg grid-cols-5 gap-1.5 rounded-[1.7rem] border border-white/10 bg-[rgba(19,19,24,0.86)] p-1.5 shadow-[0_28px_70px_rgba(0,0,0,0.48)] backdrop-blur-2xl"
          mobileItemClassName="min-h-14 flex-col justify-center rounded-[1.2rem] px-1.5 py-2 text-[10px] transition-[transform,background-color,color,box-shadow] duration-200 active:scale-[0.985]"
          mobileActiveClassName="bg-[linear-gradient(180deg,_rgba(221,191,136,1),_rgba(201,169,110,1))] text-primary-foreground shadow-[0_14px_28px_rgba(201,169,110,0.24)] border-transparent"
          mobileInactiveClassName="border-transparent text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
          mobileIconClassName="size-4"
        />
      </header>

      <div className="grid gap-6 pb-3">{children}</div>
    </main>
  );
}
