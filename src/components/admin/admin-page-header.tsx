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
        "rounded-[1.75rem] bg-[linear-gradient(180deg,_rgba(24,24,30,0.96),_rgba(12,12,16,0.98))] shadow-[0_18px_48px_rgba(0,0,0,0.24)]",
        className,
      )}
      contentClassName={cn("lg:flex-row lg:items-end lg:justify-between", contentClassName)}
      eyebrowClassName={cn("text-[var(--color-admin)]", eyebrowClassName)}
      titleClassName={cn("text-4xl sm:text-5xl", titleClassName)}
    />
  );
}
