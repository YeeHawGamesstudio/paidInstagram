import { RolePageHeader, type RolePageHeaderProps } from "@/components/shared/role-page-header";
import { cn } from "@/lib/utils";

export function FanPageHeader({
  className,
  eyebrowClassName,
  titleClassName,
  descriptionClassName,
  actionsClassName,
  ...props
}: RolePageHeaderProps) {
  return (
    <RolePageHeader
      {...props}
      className={cn(
        "bg-[radial-gradient(circle_at_top,_rgba(201,169,110,0.08),_transparent_18rem),linear-gradient(180deg,_rgba(26,26,32,0.94),_rgba(13,13,17,0.98))] shadow-[0_24px_60px_rgba(0,0,0,0.28)]",
        className,
      )}
      eyebrowClassName={cn("text-primary", eyebrowClassName)}
      titleClassName={cn("text-[2.35rem] sm:text-5xl", titleClassName)}
      descriptionClassName={cn("max-w-xl", descriptionClassName)}
      actionsClassName={cn("self-start sm:self-auto", actionsClassName)}
    />
  );
}
