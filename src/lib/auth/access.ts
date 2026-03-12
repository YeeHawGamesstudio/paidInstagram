import type { UserRole } from "@/lib/auth/roles";

export type AppSection = "public" | "fan" | "creator" | "admin";

export const sectionAccess: Record<AppSection, UserRole[]> = {
  public: [],
  fan: ["FAN"],
  creator: ["CREATOR"],
  admin: ["ADMIN"],
};

export function canAccessSection(role: UserRole | null, section: AppSection) {
  if (section === "public") {
    return true;
  }

  if (!role) {
    return false;
  }

  return sectionAccess[section].includes(role);
}
