import Link from "next/link";
import type { ReactNode } from "react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { RoleNavigation } from "@/components/shared/role-navigation";
import { fanNavigation } from "@/lib/fan/navigation";
import { getFanShellProfile } from "@/lib/fan/server-data";

type FanShellProps = {
  children: ReactNode;
};

export async function FanShell({ children }: FanShellProps) {
  const fanProfile = await getFanShellProfile();

  return (
    <>
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 pb-28 pt-4 sm:px-6 sm:pt-6 md:pb-8 lg:px-8">
        <header className="grid gap-5 rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(201,169,110,0.12),_transparent_18rem),linear-gradient(180deg,_rgba(22,22,28,0.96),_rgba(11,11,15,0.98))] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.3)] sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-3">
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
              <h1 className="mt-4 font-display text-[2.35rem] leading-none sm:text-4xl">Premium fan experience</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Personalized feed, subscriptions, inbox, and settings designed for mobile-first browsing.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:w-fit">
              <div className="rounded-[1.6rem] border border-white/8 bg-black/20 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Memberships</p>
                <p className="mt-1 font-display text-2xl">{fanProfile.membershipCount}</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/8 bg-black/20 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Unread</p>
                <p className="mt-1 font-display text-2xl">{fanProfile.unreadMessages}</p>
              </div>
              <div className="rounded-[1.6rem] border border-white/8 bg-black/20 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Handle</p>
                <p className="mt-1 text-sm font-medium text-foreground">{fanProfile.handle}</p>
              </div>
            </div>
          </div>

          <RoleNavigation
            items={fanNavigation}
            rootHref="/fan"
            desktopInactiveClassName="border-white/10 bg-white/[0.04] text-muted-foreground hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white/[0.06] hover:text-foreground"
            desktopActiveClassName="border-white/10 bg-white/[0.04] text-muted-foreground hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white/[0.06] hover:text-foreground"
            mobileWrapperClassName="border-0 bg-[linear-gradient(180deg,_rgba(9,9,11,0),_rgba(9,9,11,0.92)_28%,_rgba(9,9,11,0.98)_100%)] px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-4 backdrop-blur-xl"
            mobileNavClassName="grid max-w-md grid-cols-4 gap-2 rounded-[1.85rem] border border-white/10 bg-[rgba(19,19,24,0.86)] p-2 shadow-[0_28px_70px_rgba(0,0,0,0.48)] backdrop-blur-2xl"
            mobileItemClassName="min-h-16 flex-col justify-center rounded-[1.35rem] px-2 py-2 text-[11px] transition-[transform,background-color,color,box-shadow] duration-200 active:scale-[0.985]"
            mobileActiveClassName="bg-[linear-gradient(180deg,_rgba(221,191,136,1),_rgba(201,169,110,1))] text-primary-foreground shadow-[0_14px_28px_rgba(201,169,110,0.24)] border-transparent"
            mobileInactiveClassName="border-transparent text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
            mobileIconClassName="size-4"
          />
        </header>

        <div className="grid gap-6">{children}</div>
      </main>

    </>
  );
}
