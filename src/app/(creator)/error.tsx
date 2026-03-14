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
      eyebrow="Creator fallback"
      title="This creator screen could not load"
      description="OnlyClaw hit an unexpected problem while loading this creator page. You can try again or jump back to another creator workflow."
      secondaryText={
        error.digest
          ? `Error reference: ${error.digest}`
          : "Try again first. If the problem keeps happening, the request details were logged for follow-up."
      }
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
