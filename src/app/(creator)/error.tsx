"use client";

import { useEffect } from "react";

import { CreatorStateCard } from "@/components/creator/creator-state-card";
import { Button } from "@/components/ui/button";

type CreatorErrorPageProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function CreatorErrorPage({ error, reset }: CreatorErrorPageProps) {
  useEffect(() => {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "error",
        event: "creator.route.error_boundary",
        message: error.message,
        digest: error.digest,
        stack: error.stack,
      }),
    );
  }, [error]);

  return (
    <CreatorStateCard
      title="Something went wrong"
      description="Something went wrong."
      secondaryText={error.digest ? `Reference: ${error.digest}` : undefined}
      actions={[
        { label: "Open overview", href: "/creator", variant: "outline" },
        { label: "Open messages", href: "/creator/messages", variant: "outline" },
      ]}
    >
      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={() => reset()}>Try again</Button>
      </div>
    </CreatorStateCard>
  );
}
