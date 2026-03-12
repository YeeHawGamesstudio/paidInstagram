import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { badgeSizeClassNames, badgeToneClassNames, type BadgeSize, type BadgeTone } from "@/lib/ui/badge";

type StatusBadgeProps = {
  children: ReactNode;
  tone?: BadgeTone;
  size?: BadgeSize;
  className?: string;
};

export function StatusBadge({
  children,
  tone = "neutral",
  size = "sm",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold uppercase",
        badgeToneClassNames[tone],
        badgeSizeClassNames[size],
        className,
      )}
    >
      {children}
    </span>
  );
}
