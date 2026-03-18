"use client";

import { useActionState, useMemo, useState } from "react";
import { BadgeDollarSign, Lock, RefreshCcw } from "lucide-react";

import { updateCreatorPricingAction, type CreatorPricingActionState } from "@/app/actions/creator-pricing";
import type { CreatorPricingView } from "@/lib/creator/server-data";
import { formatCurrency } from "@/lib/formatting";
import { CreatorPageHeader } from "@/components/creator/creator-page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: CreatorPricingActionState = {
  status: "idle",
  message: "",
};

type CreatorPricingFormProps = {
  pricing: CreatorPricingView;
};

function clampValue(value: number, min: number, max: number) {
  if (Number.isNaN(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, value));
}

function clampOfferValue(nextValue: number) {
  if (Number.isNaN(nextValue)) {
    return 0;
  }

  return Math.max(0, nextValue);
}

export function CreatorPricingForm({ pricing }: CreatorPricingFormProps) {
  const [state, formAction, pending] = useActionState(updateCreatorPricingAction, initialState);
  const [monthlyPrice, setMonthlyPrice] = useState(pricing.monthlyPriceCents);
  const [paidMessageDefault, setPaidMessageDefault] = useState(pricing.paidMessageDefaultCents);
  const [bundleDefault, setBundleDefault] = useState(pricing.bundleDefaultCents);
  const [trialEnabled, setTrialEnabled] = useState(pricing.trialEnabled);

  function updateMonthlyPrice(nextValue: number) {
    setMonthlyPrice(clampValue(nextValue, pricing.minMonthlyPriceCents, pricing.maxMonthlyPriceCents));
  }

  function resetDraftValues() {
    setMonthlyPrice(pricing.monthlyPriceCents);
    setPaidMessageDefault(pricing.paidMessageDefaultCents);
    setBundleDefault(pricing.bundleDefaultCents);
    setTrialEnabled(pricing.trialEnabled);
  }

  const monthlyDelta = useMemo(
    () => monthlyPrice - pricing.suggestedMonthlyPriceCents,
    [monthlyPrice, pricing.suggestedMonthlyPriceCents],
  );
  const lockedVsMembershipDelta = paidMessageDefault - monthlyPrice;
  const bundleVsLockedDelta = bundleDefault - paidMessageDefault;

  return (
    <div className="grid gap-6">
      <CreatorPageHeader
        eyebrow="Pricing"
        title="Membership and offer pricing"
        description="Set your monthly membership price. Locked-message and bundle pricing options are coming soon."
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="border-white/10 bg-[linear-gradient(180deg,_rgba(20,20,24,0.98),_rgba(11,11,14,0.96))] p-5 sm:p-6">
          <form action={formAction} className="grid gap-6">
            <input type="hidden" name="monthlyPriceCents" value={monthlyPrice} />

            <div>
              <div className="flex items-center gap-2 text-[var(--color-creator)]">
                <BadgeDollarSign className="size-4" />
                <p className="text-xs font-semibold uppercase tracking-[0.24em]">Monthly subscription</p>
              </div>
              <h2 className="mt-3 font-display text-4xl">{formatCurrency(monthlyPrice, pricing.currency)}/mo</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                This price is shown on your public profile and used for new subscriptions.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Membership</p>
                <p className="mt-2 font-semibold text-foreground">{formatCurrency(monthlyPrice, pricing.currency)}/mo</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {monthlyDelta === 0
                    ? "Matches the suggested benchmark."
                    : monthlyDelta > 0
                      ? `${formatCurrency(monthlyDelta, pricing.currency)} above the suggested benchmark.`
                      : `${formatCurrency(Math.abs(monthlyDelta), pricing.currency)} below the suggested benchmark.`}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Locked message default</p>
                <p className="mt-2 font-semibold text-foreground">{formatCurrency(paidMessageDefault, pricing.currency)}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {lockedVsMembershipDelta >= 0
                    ? `${formatCurrency(lockedVsMembershipDelta, pricing.currency)} above one month of membership.`
                    : `${formatCurrency(Math.abs(lockedVsMembershipDelta), pricing.currency)} below one month of membership.`}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Bundle default</p>
                <p className="mt-2 font-semibold text-foreground">{formatCurrency(bundleDefault, pricing.currency)}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {bundleVsLockedDelta >= 0
                    ? `${formatCurrency(bundleVsLockedDelta, pricing.currency)} above the locked-message default.`
                    : `${formatCurrency(Math.abs(bundleVsLockedDelta), pricing.currency)} below the locked-message default.`}
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
                  min={pricing.minMonthlyPriceCents}
                  max={pricing.maxMonthlyPriceCents}
                  step={100}
                  value={monthlyPrice}
                  onChange={(event) => updateMonthlyPrice(Number(event.target.value))}
                  className="w-full accent-[var(--color-creator)]"
                />
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatCurrency(pricing.minMonthlyPriceCents, pricing.currency)}</span>
                  <span>Suggested {formatCurrency(pricing.suggestedMonthlyPriceCents, pricing.currency)}</span>
                  <span>{formatCurrency(pricing.maxMonthlyPriceCents, pricing.currency)}</span>
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
                    inputMode="decimal"
                  />
                  <Button type="button" variant="outline" onClick={() => updateMonthlyPrice(monthlyPrice + 100)}>
                    + $1
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">2. One-off offer defaults</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  These defaults will be used when paid-message and bundle features become available.
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
                      Good for single-message unlocks and one-off paid replies. This value does not save yet.
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
                      Good for image packs or mixed media bundles with higher perceived value. This value does not save yet.
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
                  <p className="text-xs font-semibold uppercase tracking-[0.22em]">Save scope</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Saving is live for membership price only. Reset returns this page to the last loaded draft values.
                </p>
              </div>
            </div>

            {state.message ? (
              <p
                className={`text-sm ${
                  state.status === "error" ? "text-destructive" : "text-[var(--color-success,#7ee787)]"
                }`}
              >
                {state.message}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Save membership price"}
              </Button>
              <Button type="button" variant="outline" onClick={resetDraftValues} disabled={pending}>
                Reset unsaved changes
              </Button>
            </div>
          </form>
        </Card>

        <aside className="grid gap-4 self-start xl:sticky xl:top-24">
          <Card className="border-white/10 bg-[linear-gradient(180deg,_rgba(45,24,75,0.32),_rgba(11,11,15,0.98))] p-5">
            <div className="flex items-center gap-2 text-[var(--color-creator)]">
              <Lock className="size-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.24em]">Pricing snapshot</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Use this rail to confirm the current relationship between membership, locked messages, bundles, and trial mode.
            </p>
            <div className="mt-4 rounded-[1.75rem] border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Monthly membership</p>
              <p className="mt-2 font-display text-3xl">{formatCurrency(monthlyPrice, pricing.currency)}/mo</p>
              <p className="mt-4 text-sm text-muted-foreground">
                Suggested benchmark: {formatCurrency(pricing.suggestedMonthlyPriceCents, pricing.currency)}/mo
              </p>
            </div>
            <div className="mt-4 grid gap-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Locked message</p>
                <p className="mt-2 text-lg font-semibold">{formatCurrency(paidMessageDefault, pricing.currency)}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {lockedVsMembershipDelta >= 0 ? "Above" : "Below"} membership by{" "}
                  {formatCurrency(Math.abs(lockedVsMembershipDelta), pricing.currency)}
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Media bundle</p>
                <p className="mt-2 text-lg font-semibold">{formatCurrency(bundleDefault, pricing.currency)}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {bundleVsLockedDelta >= 0 ? "Above" : "Below"} locked message by{" "}
                  {formatCurrency(Math.abs(bundleVsLockedDelta), pricing.currency)}
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 text-sm text-muted-foreground">
              Trial mode: {trialEnabled ? "Enabled" : "Off"}
            </div>
          </Card>
        </aside>
      </section>
    </div>
  );
}
