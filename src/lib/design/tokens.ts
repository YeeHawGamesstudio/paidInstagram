export const designTokens = {
  brand: {
    name: "OnlyClaw",
    surface: "bg-[radial-gradient(circle_at_top,_rgba(201,169,110,0.18),_transparent_32%),linear-gradient(180deg,_rgba(16,16,20,1)_0%,_rgba(9,9,11,1)_100%)]",
    ring: "ring-[rgba(201,169,110,0.35)]",
  },
  accents: {
    gold: "#C9A96E",
    plum: "#7A3CF0",
    emerald: "#0EA47A",
    crimson: "#A1335B",
  },
} as const;

export const roleAccentMap = {
  public: "text-[var(--color-accent)]",
  fan: "text-[var(--color-fan)]",
  creator: "text-[var(--color-creator)]",
  admin: "text-[var(--color-admin)]",
} as const;
