import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string | number;
  detail?: string;
  icon?: LucideIcon;
  reverse?: boolean;
  className?: string;
  labelClassName?: string;
  valueClassName?: string;
  detailClassName?: string;
  iconClassName?: string;
};

export function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  reverse = false,
  className,
  labelClassName,
  valueClassName,
  detailClassName,
  iconClassName,
}: MetricCardProps) {
  return (
    <Card className={cn("border-white/12 bg-white/[0.05] p-5", className)}>
      {reverse ? <p className={cn("font-display text-4xl", valueClassName)}>{value}</p> : null}
      <div className={cn("flex items-center gap-2 text-primary", !reverse && "mt-0", reverse && "mt-1", labelClassName)}>
        {Icon ? <Icon className={cn("size-4", iconClassName)} /> : null}
        <span className="text-xs font-semibold uppercase tracking-[0.2em]">{label}</span>
      </div>
      {!reverse ? <p className={cn("mt-3 font-display text-3xl sm:text-4xl", valueClassName)}>{value}</p> : null}
      {detail ? <p className={cn("mt-2 text-sm leading-5 text-foreground/72", detailClassName)}>{detail}</p> : null}
    </Card>
  );
}
