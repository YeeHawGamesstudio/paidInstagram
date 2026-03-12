import type { RoleNavigationItem } from "@/components/shared/role-navigation";

export type CreatorNavItem = RoleNavigationItem;

export const creatorNavigation: readonly CreatorNavItem[] = [
  {
    label: "Overview",
    href: "/creator",
    icon: "house",
    matchPrefix: "/creator",
  },
  {
    label: "Posts",
    href: "/creator/posts",
    icon: "layoutGrid",
    matchPrefix: "/creator/posts",
  },
  {
    label: "New post",
    href: "/creator/posts/new",
    icon: "imagePlus",
    matchPrefix: "/creator/posts/new",
  },
  {
    label: "Messages",
    href: "/creator/messages",
    icon: "messageSquareText",
    matchPrefix: "/creator/messages",
  },
  {
    label: "Subscribers",
    href: "/creator/subscribers",
    icon: "users",
    matchPrefix: "/creator/subscribers",
  },
  {
    label: "Pricing",
    href: "/creator/pricing",
    icon: "badgeDollarSign",
    matchPrefix: "/creator/pricing",
  },
  {
    label: "Compliance",
    href: "/creator/compliance",
    icon: "shieldCheck",
    matchPrefix: "/creator/compliance",
  },
  {
    label: "Settings",
    href: "/creator/settings",
    icon: "settings",
    matchPrefix: "/creator/settings",
  },
];
