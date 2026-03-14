"use client";

import { useState } from "react";
import { BadgeDollarSign, Lock, RefreshCcw } from "lucide-react";

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

  function clampOfferValue(nextValue: number) {
    if (Number.isNaN(nextValue)) {
      return 0;
    }

    return Math.max(0, nextValue);
  }

  const monthlyDelta = monthlyPrice - creatorPricingSettings.suggestedMonthlyPriceCents;
  const lockedVsMembershipDelta = paidMessageDefault - monthlyPrice;
  const bundleVsLockedDelta = bundleDefault - paidMessageDefault;

  return (
    <div className="grid gap-6">
      <CreatorPageHeader
        eyebrow="Pricing"
        title="Membership and offer pricing"
        description="Adjust membership, locked-message, and bundle defaults. Saving stays disabled in this preview."
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
                Set a monthly price that matches the current preview range.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Membership</p>
                <p className="mt-2 font-semibold text-foreground">{formatCreatorCurrency(monthlyPrice)}/mo</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {monthlyDelta === 0
                    ? "Matches the suggested benchmark."
                    : monthlyDelta > 0
                      ? `${formatCreatorCurrency(monthlyDelta)} above the suggested benchmark.`
                      : `${formatCreatorCurrency(Math.abs(monthlyDelta))} below the suggested benchmark.`}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Locked message default</p>
                <p className="mt-2 font-semibold text-foreground">{formatCreatorCurrency(paidMessageDefault)}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {lockedVsMembershipDelta >= 0
                    ? `${formatCreatorCurrency(lockedVsMembershipDelta)} above one month of membership.`
                    : `${formatCreatorCurrency(Math.abs(lockedVsMembershipDelta))} below one month of membership.`}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Bundle default</p>
                <p className="mt-2 font-semibold text-foreground">{formatCreatorCurrency(bundleDefault)}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {bundleVsLockedDelta >= 0
                    ? `${formatCreatorCurrency(bundleVsLockedDelta)} above the locked-message default.`
                    : `${formatCreatorCurrency(Math.abs(bundleVsLockedDelta))} below the locked-message default.`}
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              <div>
                <Label htmlFor="monthly-price-range">1. Set membership price</Label>
                <p className="mt-1 text-sm text-muted-foreground">
                  Use the slider or field below. Both stay synced so the monthly price is easy to adjust on mobile.
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-4">
                <input
                  id="monthly-price-range"
                  type="range"
                  min={creatorPricingSettings.minMonthlyPriceCents}
                  max={creatorPricingSettings.maxMonthlyPriceCents}
                  step={100}
                  value={monthlyPrice}
                  onChange={(event) => updateMonthlyPrice(Number(event.target.value))}
                  className="w-full accent-[var(--color-creator)]"
                />
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatCreatorCurrency(creatorPricingSettings.minMonthlyPriceCents)}</span>
                  <span>Suggested {formatCreatorCurrency(creatorPricingSettings.suggestedMonthlyPriceCents)}</span>
                  <span>{formatCreatorCurrency(creatorPricingSettings.maxMonthlyPriceCents)}</span>
                </div>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="monthly-price-input">Monthly price</Label>
                  <span className="text-xs text-muted-foreground">Type a value or tap the step buttons.</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(9rem,12rem)_minmax(0,1fr)] sm:items-center">
                  <Button type="button" variant="outline" onClick={() => updateMonthlyPrice(monthlyPrice - 100)}>
                    - $1
                  </Button>
                  <Input
                    id="monthly-price-input"
                    value={monthlyPrice / 100}
                    onChange={(event) => updateMonthlyPrice(Number(event.target.value) * 100)}
                    className="text-center"
                  />
                  <Button type="button" variant="outline" onClick={() => updateMonthlyPrice(monthlyPrice + 100)}>
                    + $1
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">2. Set one-off offer defaults</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  These should relate back to the membership price so fans understand when a one-off offer costs more than a month.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-4">
                  <div className="grid gap-2">
                    <Label htmlFor="paid-message-default">Locked message default</Label>
                    <Input
                      id="paid-message-default"
                      value={paidMessageDefault / 100}
                      onChange={(event) =>
                        setPaidMessageDefault(clampOfferValue(Number(event.target.value || 0) * 100))
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Good for single-message unlocks and one-off paid replies.
                    </p>
                  </div>
                </div>
                <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-4">
                  <div className="grid gap-2">
                    <Label htmlFor="bundle-default">Media bundle default</Label>
                    <Input
                      id="bundle-default"
                      value={bundleDefault / 100}
                      onChange={(event) => setBundleDefault(clampOfferValue(Number(event.target.value || 0) * 100))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Good for image packs or mixed media bundles with higher perceived value.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_18rem]">
              <label className="flex items-center gap-3 rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={trialEnabled}
                  onChange={(event) => setTrialEnabled(event.target.checked)}
                  className="size-4 rounded border-white/20 bg-transparent accent-[var(--color-creator)]"
                />
                Preview a 3-day trial option
              </label>

              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <RefreshCcw className="size-4" />
                  <p className="text-xs font-semibold uppercase tracking-[0.22em]">Save state</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Save and reset stay disabled in this preview. You can validate pricing relationships and control behavior here.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="button" disabled>
                Save disabled in preview
              </Button>
              <Button type="button" variant="outline" disabled>
                Reset disabled
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
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Use this rail to confirm the current relationship between membership, locked messages, bundles, and trial mode.
            </p>
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
                <p className="mt-2 text-sm text-muted-foreground">
                  {lockedVsMembershipDelta >= 0 ? "Above" : "Below"} membership by{" "}
                  {formatCreatorCurrency(Math.abs(lockedVsMembershipDelta))}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Media bundle</p>
                <p className="mt-2 text-lg font-semibold">{formatCreatorCurrency(bundleDefault)}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {bundleVsLockedDelta >= 0 ? "Above" : "Below"} locked message by{" "}
                  {formatCreatorCurrency(Math.abs(bundleVsLockedDelta))}
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 text-sm text-muted-foreground">
              Trial mode: {trialEnabled ? "Enabled for preview" : "Off in preview"}
            </div>
          </Card>
        </aside>
      </section>
    </div>
  );
}
