import { RolePageHeader, type RolePageHeaderProps } from "@/components/shared/role-page-header";
import { cn } from "@/lib/utils";

type CreatorPageHeaderProps = RolePageHeaderProps & {
  compact?: boolean;
};

export function CreatorPageHeader({
  compact = true,
  className,
  contentClassName,
  eyebrowClassName,
  titleClassName,
  descriptionClassName,
  actionsClassName,
  ...props
}: CreatorPageHeaderProps) {
  return (
    <RolePageHeader
      {...props}
      className={cn(
        "bg-[linear-gradient(180deg,_rgba(38,24,64,0.82),_rgba(14,12,20,0.96))] shadow-[0_20px_60px_rgba(0,0,0,0.28)]",
        compact ? "rounded-[1.6rem] p-4 sm:p-5" : null,
        className,
      )}
      contentClassName={cn(compact ? "gap-3 sm:items-center" : null, contentClassName)}
      eyebrowClassName={cn("text-[var(--color-creator)]", eyebrowClassName)}
      titleClassName={cn(compact ? "text-[1.95rem] sm:text-[2.6rem]" : "text-4xl sm:text-5xl", titleClassName)}
      descriptionClassName={cn(compact ? "mt-2 max-w-lg text-sm leading-6" : null, descriptionClassName)}
      actionsClassName={cn(compact ? "w-full self-start sm:w-auto sm:self-auto" : null, actionsClassName)}
    />
  );
}
