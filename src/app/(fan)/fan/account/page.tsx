import Link from "next/link";
import { Bell, CreditCard, ShieldCheck, SlidersHorizontal } from "lucide-react";

import { FanPageHeader } from "@/components/fan/fan-page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getFanShellProfile } from "@/lib/fan/server-data";

const preferenceCards = [
  {
    title: "Notifications",
    icon: Bell,
    rows: ["Instant alerts for creator replies", "Mute overnight promos", "Renewal reminders enabled"],
  },
  {
    title: "Chat preferences",
    icon: SlidersHorizontal,
    rows: ["Show premium media larger on mobile", "Keep paid drops clearly labeled", "Compact inbox preview on desktop"],
  },
  {
    title: "Privacy",
    icon: ShieldCheck,
    rows: ["Profile visibility: private", "Purchase previews hidden from creators", "Device session verified"],
  },
] as const;

export default async function FanAccountPage() {
  const fanProfile = await getFanShellProfile();

  return (
    <div className="grid gap-5">
      <FanPageHeader
        eyebrow="Account"
        title="Settings and preferences"
        description="Account-level controls for notifications, chat preferences, privacy, and the handoff into billing settings."
        actions={
          <Button asChild variant="outline">
            <Link href="/fan/billing">
              <CreditCard className="size-4" />
              Billing settings
            </Link>
          </Button>
        }
      />

      <Card className="border-white/10 bg-[radial-gradient(circle_at_top,_rgba(201,169,110,0.08),_transparent_16rem),linear-gradient(180deg,_rgba(20,20,24,0.98),_rgba(11,11,14,0.96))] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">Fan profile</p>
            <h2 className="mt-2 font-display text-3xl">{fanProfile.displayName}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{fanProfile.handle}</p>
          </div>
          <div className="grid gap-2 text-sm text-muted-foreground sm:text-right">
            <p>{fanProfile.membershipCount} active memberships</p>
            <p>{fanProfile.unreadMessages} unread messages</p>
            <p>{fanProfile.nextRenewalLabel}</p>
          </div>
        </div>
      </Card>

      <section className="grid gap-4 lg:grid-cols-3">
        {preferenceCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title} className="border-white/10 bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <div className="flex items-center gap-2 text-primary">
                <Icon className="size-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.22em]">{card.title}</span>
              </div>

              <div className="mt-4 grid gap-3">
                {card.rows.map((row) => (
                  <div key={row} className="rounded-3xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-foreground/82 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                    {row}
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
