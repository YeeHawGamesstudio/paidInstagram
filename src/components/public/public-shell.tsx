import Link from "next/link";
import type { ReactNode } from "react";
import { ShieldAlert } from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { Button } from "@/components/ui/button";
import { getOptionalViewer, getViewerHomePath } from "@/lib/auth/viewer";
import { publicComplianceLinks } from "@/lib/compliance/scaffolding";
import { siteConfig } from "@/lib/config/site";

const publicNavItems = [
  { label: "Discover", href: "/discover" },
  { label: "Creator list", href: "/discover?view=list" },
] as const;

const publicGuestNavItems = [
  { label: "Login", href: "/login" },
  { label: "Sign up", href: "/signup" },
] as const;

export async function PublicShell({ children }: Readonly<{ children: ReactNode }>) {
  const viewer = await getOptionalViewer();
  const accountHref = viewer ? getViewerHomePath(viewer) : "/login";
  const navItems = viewer ? publicNavItems : [...publicNavItems, ...publicGuestNavItems];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[rgba(9,9,11,0.72)] supports-[backdrop-filter]:bg-[rgba(9,9,11,0.62)] backdrop-blur-2xl">
        <div className="border-b border-white/8 bg-amber-400/8">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-start gap-2 px-4 py-2 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div className="flex items-start gap-2 text-foreground/80">
              <ShieldAlert className="size-3.5 text-amber-300" />
              <span className="max-w-3xl">
                Adult-content access is restricted to adults. Review the platform safety and disclosure information before
                continuing.
              </span>
            </div>
            <Link href="/18-plus" className="shrink-0 text-amber-200 transition hover:text-foreground">
              Learn more
            </Link>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between gap-3 md:min-w-0">
            <Link href="/" className="flex min-w-0 flex-col transition hover:opacity-90">
              <span className="text-[0.65rem] font-semibold uppercase tracking-[0.34em] text-primary/80">Premium creator platform</span>
              <span className="font-display text-2xl leading-none">{siteConfig.name}</span>
            </Link>

            <Button asChild size="sm" className="shrink-0 md:hidden">
              <Link href="/discover">Explore creators</Link>
            </Button>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] p-1 md:flex">
            {navItems.map((item) => (
              <Button key={item.href} variant="ghost" size="sm" asChild>
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <Button asChild size="sm" variant={viewer ? "outline" : "default"} className="shrink-0">
              <Link href={accountHref}>{viewer ? "Dashboard" : "Explore creators"}</Link>
            </Button>
            {viewer ? <SignOutButton className="h-9 px-4 text-xs" variant="destructive" /> : null}
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-7xl gap-2 overflow-x-auto px-4 pb-3 sm:px-6 md:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-muted-foreground transition active:scale-[0.99] hover:border-primary/40 hover:bg-white/[0.06] hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={accountHref}
            className="whitespace-nowrap rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-muted-foreground transition active:scale-[0.99] hover:border-primary/40 hover:bg-white/[0.06] hover:text-foreground"
          >
            {viewer ? "Dashboard" : "Explore creators"}
          </Link>
        </div>
      </header>

      {children}

      <footer className="border-t border-white/8 bg-black/20">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2">
            <p className="font-display text-2xl">{siteConfig.name}</p>
            <p className="max-w-2xl text-sm text-muted-foreground">
              The home for premium AI creators. Discover, subscribe, and enjoy exclusive content on any device.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            {publicComplianceLinks.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-full border border-transparent px-1 py-0.5 transition hover:border-white/10 hover:text-foreground">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
