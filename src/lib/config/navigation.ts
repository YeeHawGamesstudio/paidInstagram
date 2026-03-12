import type { AppSection } from "@/lib/auth/access";

export type NavItem = {
  label: string;
  href: string;
  section: AppSection;
};

export const primaryNavigation: NavItem[] = [
  { label: "Home", href: "/", section: "public" },
  { label: "Fan", href: "/fan", section: "fan" },
  { label: "Creator", href: "/creator", section: "creator" },
  { label: "Admin", href: "/admin", section: "admin" },
];
