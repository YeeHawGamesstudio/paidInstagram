import { RolePageHeader, type RolePageHeaderProps } from "@/components/shared/role-page-header";
import { cn } from "@/lib/utils";

export function CreatorPageHeader({
  className,
  eyebrowClassName,
  titleClassName,
  ...props
}: RolePageHeaderProps) {
  return (
    <RolePageHeader
      {...props}
      className={cn(
        "bg-[linear-gradient(180deg,_rgba(38,24,64,0.82),_rgba(14,12,20,0.96))] shadow-[0_20px_60px_rgba(0,0,0,0.28)]",
        className,
      )}
      eyebrowClassName={cn("text-[var(--color-creator)]", eyebrowClassName)}
      titleClassName={cn("text-4xl sm:text-5xl", titleClassName)}
    />
  );
}
