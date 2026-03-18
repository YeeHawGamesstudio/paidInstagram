import { FanStateCard } from "@/components/fan/fan-state-card";

export default function FanNotFound() {
  return (
    <FanStateCard
      title="Page not found"
      description="Page not found."
      actions={[
        { label: "Back to home", href: "/fan" },
        { label: "Open messages", href: "/fan/messages", variant: "outline" },
        { label: "Manage memberships", href: "/fan/subscriptions", variant: "outline" },
      ]}
    />
  );
}
