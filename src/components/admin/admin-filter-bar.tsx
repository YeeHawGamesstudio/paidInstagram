import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AdminFilterChip = {
  label: string;
  href: string;
  active?: boolean;
};

type AdminSortOption = {
  label: string;
  value: string;
};

type AdminFilterBarProps = {
  action: string;
  searchValue: string;
  searchPlaceholder: string;
  selectedSort: string;
  sortOptions: AdminSortOption[];
  chips: AdminFilterChip[];
  clearHref: string;
  showClear: boolean;
  preservedParams?: Record<string, string | undefined>;
};

export function AdminFilterBar({
  action,
  searchValue,
  searchPlaceholder,
  selectedSort,
  sortOptions,
  chips,
  clearHref,
  showClear,
  preservedParams,
}: AdminFilterBarProps) {
  return (
    <Card className="border-white/10 bg-white/[0.04] p-4 shadow-none">
      <form action={action} className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_13rem_auto]">
        {preservedParams
          ? Object.entries(preservedParams).map(([key, value]) =>
              value ? <input key={key} type="hidden" name={key} value={value} /> : null,
            )
          : null}
        <Input
          type="search"
          name="q"
          defaultValue={searchValue}
          placeholder={searchPlaceholder}
          className="border-white/10 bg-black/20"
        />
        <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Sort
          <select
            name="sort"
            defaultValue={selectedSort}
            className="h-11 rounded-2xl border border-white/10 bg-black/20 px-4 text-sm font-medium text-foreground outline-none transition focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/25"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap gap-2 self-end">
          <button type="submit" className={buttonVariants({ size: "sm" })}>
            Apply
          </button>
          {showClear ? (
            <Link href={clearHref} className={buttonVariants({ size: "sm", variant: "ghost" })}>
              Clear
            </Link>
          ) : null}
        </div>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <Link
            key={chip.label}
            href={chip.href}
            className={cn(
              buttonVariants({ size: "sm", variant: chip.active ? "default" : "outline" }),
              !chip.active && "border-white/10 bg-white/[0.02]",
            )}
          >
            {chip.label}
          </Link>
        ))}
      </div>
    </Card>
  );
}
