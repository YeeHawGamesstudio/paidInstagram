import { FanStateCard } from "@/components/fan/fan-state-card";

export default function FanNotFound() {
  return (
    <FanStateCard
      eyebrow="Fan not found"
      title="That fan page is no longer available"
      description="The link may be outdated, the conversation may not belong to this fan account, or the page may have moved."
      secondaryText="Try returning to your inbox, memberships, or billing to keep browsing from a known fan route."
      actions={[
        { label: "Open inbox", href: "/fan/messages" },
        { label: "Manage memberships", href: "/fan/subscriptions", variant: "outline" },
        { label: "Open billing", href: "/fan/billing", variant: "outline" },
      ]}
    />
  );
}
