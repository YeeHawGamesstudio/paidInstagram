import { RolePageHeader, type RolePageHeaderProps } from "@/components/shared/role-page-header";
import { cn } from "@/lib/utils";

type FanPageHeaderProps = RolePageHeaderProps & {
  compact?: boolean;
};

export function FanPageHeader({
  compact = true,
  className,
  contentClassName,
  eyebrowClassName,
  titleClassName,
  descriptionClassName,
  actionsClassName,
  ...props
}: FanPageHeaderProps) {
  return (
    <RolePageHeader
      {...props}
      className={cn(
        "bg-[radial-gradient(circle_at_top,_rgba(201,169,110,0.08),_transparent_18rem),linear-gradient(180deg,_rgba(26,26,32,0.94),_rgba(13,13,17,0.98))] shadow-[0_24px_60px_rgba(0,0,0,0.28)]",
        compact ? "rounded-[1.6rem] p-4 sm:p-5" : null,
        className,
      )}
      contentClassName={cn(compact ? "gap-3 sm:items-center" : null, contentClassName)}
      eyebrowClassName={cn("text-primary", eyebrowClassName)}
      titleClassName={cn(compact ? "text-[1.9rem] sm:text-[2.6rem]" : "text-[2.35rem] sm:text-5xl", titleClassName)}
      descriptionClassName={cn(compact ? "mt-2 max-w-lg text-sm leading-6" : "max-w-xl", descriptionClassName)}
      actionsClassName={cn("self-start sm:self-auto", compact ? "w-full sm:w-auto" : null, actionsClassName)}
    />
  );
}
