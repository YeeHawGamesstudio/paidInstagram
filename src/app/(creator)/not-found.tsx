import { CreatorStateCard } from "@/components/creator/creator-state-card";

export default function CreatorNotFound() {
  return (
    <CreatorStateCard
      eyebrow="Creator not found"
      title="That creator page is no longer available"
      description="The link may be outdated, the page may have moved, or this launch slice may not include the deep link you tried to open."
      secondaryText="Creator messaging currently stops at the inbox and composer surfaces, so thread-detail deep links are not available in this slice."
      actions={[
        { label: "Open overview", href: "/creator" },
        { label: "Open messages", href: "/creator/messages", variant: "outline" },
        { label: "Open compliance", href: "/creator/compliance", variant: "outline" },
      ]}
    />
  );
}
