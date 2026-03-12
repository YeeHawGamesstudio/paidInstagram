"use client";

import { useState } from "react";
import { BadgeDollarSign, Lock } from "lucide-react";

import { CreatorPageHeader } from "@/components/creator/creator-page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  creatorPricingSettings,
  creatorProfileSummary,
  formatCreatorCurrency,
} from "@/lib/creator/demo-data";

export default function CreatorPricingPage() {
  const [monthlyPrice, setMonthlyPrice] = useState(creatorProfileSummary.monthlyPriceCents);
  const [paidMessageDefault, setPaidMessageDefault] = useState(creatorPricingSettings.paidMessageDefaultCents);
  const [bundleDefault, setBundleDefault] = useState(creatorPricingSettings.bundleDefaultCents);
  const [trialEnabled, setTrialEnabled] = useState(false);

  function updateMonthlyPrice(nextValue: number) {
    if (Number.isNaN(nextValue)) {
      return;
    }

    const clamped = Math.min(
      creatorPricingSettings.maxMonthlyPriceCents,
      Math.max(creatorPricingSettings.minMonthlyPriceCents, nextValue),
    );
    setMonthlyPrice(clamped);
  }

  return (
    <div className="grid gap-6">
      <CreatorPageHeader
        eyebrow="Pricing"
        title="Tune subscription and offer pricing"
        description="Review membership and paid-message price positioning here before settings persistence is enabled for this environment."
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="border-white/10 bg-[linear-gradient(180deg,_rgba(20,20,24,0.98),_rgba(11,11,14,0.96))] p-5 sm:p-6">
          <div className="grid gap-6">
            <div>
              <div className="flex items-center gap-2 text-[var(--color-creator)]">
                <BadgeDollarSign className="size-4" />
                <p className="text-xs font-semibold uppercase tracking-[0.24em]">Monthly subscription</p>
              </div>
              <h2 className="mt-3 font-display text-4xl">{formatCreatorCurrency(monthlyPrice)}/mo</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Position the monthly membership as premium, but still easy for the right fans to say yes to.
              </p>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="monthly-price-range">Membership price</Label>
              <input
                id="monthly-price-range"
                type="range"
                min={creatorPricingSettings.minMonthlyPriceCents}
                max={creatorPricingSettings.maxMonthlyPriceCents}
                step={100}
                value={monthlyPrice}
                onChange={(event) => updateMonthlyPrice(Number(event.target.value))}
                className="accent-[var(--color-creator)]"
              />
              <div className="grid gap-3 sm:grid-cols-3">
                <Button type="button" variant="outline" onClick={() => updateMonthlyPrice(monthlyPrice - 100)}>
                  - $1
                </Button>
                <Input
                  value={monthlyPrice / 100}
                  onChange={(event) => updateMonthlyPrice(Number(event.target.value) * 100)}
                />
                <Button type="button" variant="outline" onClick={() => updateMonthlyPrice(monthlyPrice + 100)}>
                  + $1
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="paid-message-default">Locked message default</Label>
                <Input
                  id="paid-message-default"
                  value={paidMessageDefault / 100}
                  onChange={(event) => setPaidMessageDefault(Number(event.target.value || 0) * 100)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bundle-default">Media bundle default</Label>
                <Input
                  id="bundle-default"
                  value={bundleDefault / 100}
                  onChange={(event) => setBundleDefault(Number(event.target.value || 0) * 100)}
                />
              </div>
            </div>

            <label className="flex items-center gap-3 rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-foreground">
              <input
                type="checkbox"
                checked={trialEnabled}
                onChange={(event) => setTrialEnabled(event.target.checked)}
                className="size-4 rounded border-white/20 bg-transparent accent-[var(--color-creator)]"
              />
              Preview a 3-day trial option
            </label>

            <div className="flex flex-wrap gap-3">
              <Button type="button" disabled>
                Save unavailable
              </Button>
              <Button type="button" variant="outline" disabled>
                Reset unavailable
              </Button>
            </div>
          </div>
        </Card>

        <aside className="grid gap-4 self-start xl:sticky xl:top-24">
          <Card className="border-white/10 bg-[linear-gradient(180deg,_rgba(45,24,75,0.32),_rgba(11,11,15,0.98))] p-5">
            <div className="flex items-center gap-2 text-[var(--color-creator)]">
              <Lock className="size-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.24em]">Pricing preview</p>
            </div>
            <div className="mt-4 rounded-[1.75rem] border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Monthly membership</p>
              <p className="mt-2 font-display text-3xl">{formatCreatorCurrency(monthlyPrice)}/mo</p>
              <p className="mt-4 text-sm text-muted-foreground">
                Suggested benchmark: {formatCreatorCurrency(creatorPricingSettings.suggestedMonthlyPriceCents)}/mo
              </p>
            </div>
            <div className="mt-4 grid gap-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Locked message</p>
                <p className="mt-2 text-lg font-semibold">{formatCreatorCurrency(paidMessageDefault)}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Media bundle</p>
                <p className="mt-2 text-lg font-semibold">{formatCreatorCurrency(bundleDefault)}</p>
              </div>
            </div>
            <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 text-sm text-muted-foreground">
              Trial mode: {trialEnabled ? "Enabled for preview" : "Disabled"}
            </div>
          </Card>
        </aside>
      </section>
    </div>
  );
}
