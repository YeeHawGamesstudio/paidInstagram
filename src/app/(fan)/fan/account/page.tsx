import Link from "next/link";
import { Bell, CreditCard, Crown, MessageSquareText, ShieldCheck, SlidersHorizontal } from "lucide-react";

import { FanPageHeader } from "@/components/fan/fan-page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getFanShellProfile } from "@/lib/fan/server-data";

const settingsCards = [
  {
    title: "Notifications",
    icon: Bell,
    summary: "Keep up with replies, paid drops, and renewal reminders without opening every thread.",
    rows: ["Creator replies and paid drops are the most important alerts in this launch slice.", "Renewal reminders stay connected to your memberships and billing activity."],
    href: "/fan/messages",
    actionLabel: "Open inbox",
    status: "Launch summary",
  },
  {
    title: "Chat and premium content",
    icon: SlidersHorizontal,
    summary: "Message history and premium drop presentation are active now, while reply sending remains off during launch.",
    rows: ["Paid drops stay clearly labeled in messages and feed previews.", "Reply sending is intentionally unavailable in this launch slice."],
    href: "/fan/messages",
    actionLabel: "Review messages",
    status: "Read-only replies",
  },
  {
    title: "Privacy",
    icon: ShieldCheck,
    summary: "Fan account activity stays private from creators outside the purchase and message flows they already control.",
    rows: ["Purchase history and account-level settings live under your fan access, not on creator pages.", "Use billing and memberships when you want to review access or charges tied to your account."],
    href: "/fan/billing",
    actionLabel: "Review billing",
    status: "Private by default",
  },
] as const;

export default async function FanAccountPage() {
  const fanProfile = await getFanShellProfile();

  return (
    <div className="grid gap-4 sm:gap-5">
      <FanPageHeader
        eyebrow="Account"
        title="Settings and preferences"
        description="Manage the fan settings that matter during launch, then jump quickly into memberships, inbox activity, or billing when you need to act."
        actions={
          <Button asChild variant="outline" className="w-full justify-center sm:w-auto">
            <Link href="/fan/billing">
              <CreditCard className="size-4" />
              Open billing
            </Link>
          </Button>
        }
      />

      <Card className="border-white/10 bg-[radial-gradient(circle_at_top_right,_rgba(201,169,110,0.08),_transparent_16rem),linear-gradient(180deg,_rgba(20,20,24,0.96),_rgba(11,11,14,0.98))] p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">Account center</p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl">Use account as your launch control point</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              This page keeps the most important fan account areas connected: memberships control access, billing tracks charges,
              and messages show the premium activity tied to both.
            </p>
          </div>
          <div className="grid gap-2 sm:w-56">
            <Button asChild className="w-full justify-center">
              <Link href="/fan/subscriptions">
                <Crown className="size-4" />
                Manage memberships
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-center">
              <Link href="/fan/messages">
                <MessageSquareText className="size-4" />
                Open inbox
              </Link>
            </Button>
          </div>
        </div>
      </Card>

      <Card className="border-white/10 bg-[radial-gradient(circle_at_top,_rgba(201,169,110,0.08),_transparent_16rem),linear-gradient(180deg,_rgba(20,20,24,0.98),_rgba(11,11,14,0.96))] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Fan profile</p>
            <h2 className="mt-2 font-display text-3xl">{fanProfile.displayName}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{fanProfile.handle}</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <StatusBadge tone="success" className="text-xs normal-case tracking-normal">
              {fanProfile.membershipCount} active memberships
            </StatusBadge>
            <StatusBadge tone="primary" className="text-xs normal-case tracking-normal">
              {fanProfile.unreadMessages} unread messages
            </StatusBadge>
            <StatusBadge tone="neutral" className="text-xs normal-case tracking-normal">
              {fanProfile.nextRenewalLabel}
            </StatusBadge>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 lg:grid-cols-3">
        {settingsCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title} className="border-white/10 bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-primary">
                  <Icon className="size-4" />
                  <span className="text-xs font-semibold uppercase tracking-[0.22em]">{card.title}</span>
                </div>
                <StatusBadge tone="neutral" className="text-xs normal-case tracking-normal">
                  {card.status}
                </StatusBadge>
              </div>

              <p className="mt-4 text-sm leading-6 text-muted-foreground">{card.summary}</p>

              <div className="mt-4 grid gap-3">
                {card.rows.map((row) => (
                  <div key={row} className="rounded-3xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-foreground/82 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                    {row}
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <Button asChild variant="outline" className="w-full justify-center">
                  <Link href={card.href}>{card.actionLabel}</Link>
                </Button>
              </div>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
