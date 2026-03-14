import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type EmptyStateCardProps = {
  children: ReactNode;
  className?: string;
};

export function EmptyStateCard({ children, className }: EmptyStateCardProps) {
  return (
    <Card className={cn("border-dashed border-white/12 bg-white/[0.02] p-6 text-sm text-muted-foreground", className)}>
      {children}
    </Card>
  );
}
