import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AdminEntityFact = {
  label: string;
  value: string | number;
};

type AdminEntityFactsProps = {
  items: AdminEntityFact[];
  className?: string;
};

export function AdminEntityFacts({ items, className }: AdminEntityFactsProps) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-4", className)}>
      {items.map((item) => (
        <Card key={item.label} className="rounded-2xl border-white/12 bg-white/[0.045] px-4 py-3 shadow-none">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
          <p className="mt-1.5 text-sm font-medium leading-5 text-foreground">{item.value}</p>
        </Card>
      ))}
    </div>
  );
}
