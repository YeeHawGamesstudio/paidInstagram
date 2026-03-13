import { RolePageHeader, type RolePageHeaderProps } from "@/components/shared/role-page-header";
import { cn } from "@/lib/utils";

export function AdminPageHeader({
  className,
  contentClassName,
  eyebrowClassName,
  titleClassName,
  ...props
}: RolePageHeaderProps) {
  return (
    <RolePageHeader
      {...props}
      className={cn(
        "rounded-[1.75rem] border-white/12 bg-[linear-gradient(180deg,_rgba(24,24,30,0.98),_rgba(14,14,18,0.99))] shadow-[0_18px_48px_rgba(0,0,0,0.24)]",
        className,
      )}
      contentClassName={cn("lg:flex-row lg:items-end lg:justify-between", contentClassName)}
      eyebrowClassName={cn("text-[var(--color-admin)]", eyebrowClassName)}
      titleClassName={cn("text-3xl sm:text-4xl", titleClassName)}
      descriptionClassName={cn("text-foreground/72", props.descriptionClassName)}
    />
  );
}
