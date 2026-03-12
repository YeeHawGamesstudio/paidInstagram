import type { RoleNavigationItem } from "@/components/shared/role-navigation";

export type AdminNavItem = RoleNavigationItem;

export const adminNavigation: readonly AdminNavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: "layoutDashboard",
    matchPrefix: "/admin",
  },
  {
    label: "Creators",
    href: "/admin/creators",
    icon: "badgeCheck",
    matchPrefix: "/admin/creators",
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: "users",
    matchPrefix: "/admin/users",
  },
  {
    label: "Reports",
    href: "/admin/reports",
    icon: "shieldAlert",
    matchPrefix: "/admin/reports",
  },
  {
    label: "Review",
    href: "/admin/review",
    icon: "clipboardList",
    matchPrefix: "/admin/review",
  },
  {
    label: "Audit",
    href: "/admin/audit",
    icon: "scrollText",
    matchPrefix: "/admin/audit",
  },
];
