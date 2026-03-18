import Link from "next/link";
import { Bell, CreditCard, ShieldCheck, SlidersHorizontal } from "lucide-react";

import { FanPageHeader } from "@/components/fan/fan-page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getFanShellProfile } from "@/lib/fan/server-data";

const settingsCards = [
  { title: "Updates and alerts", icon: Bell, href: "/fan/messages", actionLabel: "View updates" },
  { title: "Messages", icon: SlidersHorizontal, href: "/fan/messages", actionLabel: "Open messages" },
  { title: "Privacy and billing", icon: ShieldCheck, href: "/fan/billing", actionLabel: "Review billing" },
] as const;

export default async function FanAccountPage() {
  const fanProfile = await getFanShellProfile();

  return (
    <div className="grid gap-4 sm:gap-5">
      <FanPageHeader
        title="Account"
        actions={
          <Button asChild variant="outline" className="w-full justify-center sm:w-auto">
            <Link href="/fan/billing">
              <CreditCard className="size-4" />
              Open billing
            </Link>
          </Button>
        }
      />

      <Card className="border-white/10 bg-[radial-gradient(circle_at_top,_rgba(201,169,110,0.08),_transparent_16rem),linear-gradient(180deg,_rgba(20,20,24,0.98),_rgba(11,11,14,0.96))] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-3xl">{fanProfile.displayName}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{fanProfile.handle}</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <StatusBadge tone="success" className="text-xs normal-case tracking-normal">
              {fanProfile.membershipCount} active memberships
            </StatusBadge>
            <StatusBadge tone="primary" className="text-xs normal-case tracking-normal">
              {fanProfile.unreadMessages} unread updates
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
              <div className="flex items-center gap-2 text-primary">
                <Icon className="size-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.22em]">{card.title}</span>
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
