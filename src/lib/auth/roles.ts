export const userRoles = ["FAN", "CREATOR", "ADMIN"] as const;

export type UserRole = (typeof userRoles)[number];

export const roleLabels: Record<UserRole, string> = {
  FAN: "Fan",
  CREATOR: "Creator",
  ADMIN: "Admin",
};
