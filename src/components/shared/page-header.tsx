import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  className?: string;
  contentClassName?: string;
  eyebrowClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  actionsClassName?: string;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
  contentClassName,
  eyebrowClassName,
  titleClassName,
  descriptionClassName,
  actionsClassName,
}: PageHeaderProps) {
  return (
    <section className={cn("grid gap-4 rounded-[2rem] border border-white/10 p-5 sm:p-6", className)}>
      <div className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", contentClassName)}>
        <div className="max-w-3xl">
          <p className={cn("text-xs font-semibold uppercase tracking-[0.3em]", eyebrowClassName)}>{eyebrow}</p>
          <h1 className={cn("mt-2 font-display leading-[0.95]", titleClassName)}>{title}</h1>
          <p className={cn("mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-[15px]", descriptionClassName)}>
            {description}
          </p>
        </div>
        {actions ? <div className={cn("shrink-0", actionsClassName)}>{actions}</div> : null}
      </div>
    </section>
  );
}
