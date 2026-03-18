"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, Rows3 } from "lucide-react";

import { CreatorCard } from "@/components/public/creator-card";
import { MetricCard } from "@/components/shared/metric-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { demoCreators } from "@/lib/public/demo-data";

type CreatorBrowseLayout = "grid" | "list";

export default function DiscoverCreatorsPage() {
  const [layout, setLayout] = useState<CreatorBrowseLayout>("grid");

  const stats = useMemo(
    () => [
      { label: "Creators live", value: demoCreators.length.toString().padStart(2, "0") },
      {
        label: "Starting from",
        value: `$${Math.min(...demoCreators.map((creator) => creator.priceMonthlyCents / 100)).toFixed(0)}`,
      },
      { label: "Categories", value: String(new Set(demoCreators.map((c) => c.category)).size).padStart(2, "0") },
    ],
    [],
  );

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <Card className="border-white/10 bg-[radial-gradient(circle_at_top,_rgba(201,169,110,0.14),_transparent_20rem),linear-gradient(180deg,_rgba(20,20,24,0.98)_0%,_rgba(11,11,14,0.96)_100%)] p-6 sm:p-8">
          <h1 className="max-w-3xl font-display text-[3.25rem] leading-none sm:text-6xl">The roster</h1>
        </Card>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {stats.map((stat) => (
            <MetricCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              reverse
              className="border-white/10 bg-white/[0.03] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
              labelClassName="text-muted-foreground"
              valueClassName="text-3xl"
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div />

        <div className="inline-flex w-full rounded-full border border-white/10 bg-white/[0.03] p-1 sm:w-auto">
          <Button
            type="button"
            size="sm"
            variant={layout === "grid" ? "default" : "ghost"}
            onClick={() => setLayout("grid")}
            className="flex-1 sm:flex-none"
          >
            <LayoutGrid className="size-4" />
            Grid
          </Button>
          <Button
            type="button"
            size="sm"
            variant={layout === "list" ? "default" : "ghost"}
            onClick={() => setLayout("list")}
            className="flex-1 sm:flex-none"
          >
            <Rows3 className="size-4" />
            List
          </Button>
        </div>
      </section>

      <section className={layout === "grid" ? "grid gap-5 xl:grid-cols-2" : "grid gap-5"}>
        {demoCreators.map((creator) => (
          <CreatorCard key={creator.slug} creator={creator} layout={layout} />
        ))}
      </section>
    </main>
  );
}
