export type BadgeTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "creator"
  | "admin";

export type BadgeSize = "xs" | "sm";

export const badgeToneClassNames: Record<BadgeTone, string> = {
  neutral: "border-white/10 bg-white/[0.04] text-muted-foreground",
  primary: "border-primary/20 bg-primary/10 text-primary",
  success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  warning: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  danger: "border-rose-400/20 bg-rose-400/10 text-rose-300",
  info: "border-sky-400/20 bg-sky-400/10 text-sky-300",
  creator: "border-[var(--color-creator)]/20 bg-[var(--color-creator)]/10 text-[var(--color-creator)]",
  admin: "border-[var(--color-admin)]/20 bg-[var(--color-admin)]/10 text-[var(--color-admin)]",
};

export const badgeSizeClassNames: Record<BadgeSize, string> = {
  xs: "px-2.5 py-0.5 text-[10px] tracking-[0.18em]",
  sm: "px-3 py-1 text-[11px] tracking-[0.18em]",
};
