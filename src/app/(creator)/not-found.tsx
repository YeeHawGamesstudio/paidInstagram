import { CreatorStateCard } from "@/components/creator/creator-state-card";

export default function CreatorNotFound() {
  return (
    <CreatorStateCard
      eyebrow="Creator not found"
      title="That creator page is no longer available"
      description="The link may be outdated, the page may have moved, or the route is not available."
      secondaryText="Try navigating from the creator dashboard instead."
      actions={[
        { label: "Open overview", href: "/creator" },
        { label: "Open messages", href: "/creator/messages", variant: "outline" },
        { label: "Open compliance", href: "/creator/compliance", variant: "outline" },
      ]}
    />
  );
}
