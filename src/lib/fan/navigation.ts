import type { RoleNavigationItem } from "@/components/shared/role-navigation";

export type FanNavItem = RoleNavigationItem;

export const fanNavigation: readonly FanNavItem[] = [
  {
    label: "Home",
    href: "/fan",
    icon: "house",
    matchPrefix: "/fan",
  },
  {
    label: "Subscriptions",
    href: "/fan/subscriptions",
    icon: "creditCard",
    matchPrefix: "/fan/subscriptions",
  },
  {
    label: "Messages",
    href: "/fan/messages",
    icon: "messageSquareText",
    matchPrefix: "/fan/messages",
  },
  {
    label: "Account",
    href: "/fan/account",
    icon: "userRound",
    matchPrefix: "/fan/account",
  },
];
