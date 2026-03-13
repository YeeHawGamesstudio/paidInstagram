"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BadgeCheck,
  BadgeDollarSign,
  ClipboardList,
  CreditCard,
  House,
  ImagePlus,
  LayoutDashboard,
  LayoutGrid,
  MessageSquareText,
  ScrollText,
  Settings,
  ShieldAlert,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

const roleNavigationIcons = {
  badgeCheck: BadgeCheck,
  badgeDollarSign: BadgeDollarSign,
  clipboardList: ClipboardList,
  creditCard: CreditCard,
  house: House,
  imagePlus: ImagePlus,
  layoutDashboard: LayoutDashboard,
  layoutGrid: LayoutGrid,
  messageSquareText: MessageSquareText,
  scrollText: ScrollText,
  settings: Settings,
  shieldAlert: ShieldAlert,
  shieldCheck: ShieldCheck,
  userRound: UserRound,
  users: Users,
} as const;

export type RoleNavigationIconName = keyof typeof roleNavigationIcons;

export type RoleNavigationItem = {
  label: string;
  href: string;
  icon: RoleNavigationIconName;
  matchPrefix: string;
};

type RoleNavigationProps = {
  items: readonly RoleNavigationItem[];
  rootHref: string;
  desktopWrapperClassName?: string;
  desktopNavClassName?: string;
  desktopItemClassName?: string;
  desktopActiveClassName?: string;
  desktopInactiveClassName?: string;
  mobileWrapperClassName?: string;
  mobileNavClassName?: string;
  mobileItemClassName?: string;
  mobileActiveClassName?: string;
  mobileInactiveClassName?: string;
  iconClassName?: string;
  mobileIconClassName?: string;
};

function isItemActive(pathname: string, href: string, matchPrefix: string, rootHref: string) {
  if (href === rootHref) {
    return pathname === href;
  }

  return pathname.startsWith(matchPrefix);
}

export function RoleNavigation({
  items,
  rootHref,
  desktopWrapperClassName,
  desktopNavClassName,
  desktopItemClassName,
  desktopActiveClassName,
  desktopInactiveClassName,
  mobileWrapperClassName,
  mobileNavClassName,
  mobileItemClassName,
  mobileActiveClassName,
  mobileInactiveClassName,
  iconClassName,
  mobileIconClassName,
}: RoleNavigationProps) {
  const pathname = usePathname();

  return (
    <>
      <div className={cn("hidden md:block", desktopWrapperClassName)}>
        <nav className={cn("flex flex-wrap gap-2", desktopNavClassName)}>
          {items.map((item) => {
            const active = isItemActive(pathname, item.href, item.matchPrefix, rootHref);
            const Icon = roleNavigationIcons[item.icon];

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm transition",
                  active ? desktopActiveClassName : desktopInactiveClassName,
                  desktopItemClassName,
                )}
              >
                <Icon className={cn("size-4", iconClassName)} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className={cn("fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-background/94 px-2 py-2 backdrop-blur-xl md:hidden", mobileWrapperClassName)}>
        <nav className={cn("mx-auto flex max-w-7xl gap-1.5 overflow-x-auto pb-1", mobileNavClassName)}>
          {items.map((item) => {
            const active = isItemActive(pathname, item.href, item.matchPrefix, rootHref);
            const Icon = roleNavigationIcons[item.icon];

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-medium",
                  active ? mobileActiveClassName : mobileInactiveClassName,
                  mobileItemClassName,
                )}
              >
                <Icon className={cn("size-3", mobileIconClassName)} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
