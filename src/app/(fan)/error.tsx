"use client";

import { useEffect } from "react";

import { FanStateCard } from "@/components/fan/fan-state-card";
import { Button } from "@/components/ui/button";

type FanErrorPageProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function FanErrorPage({ error, reset }: FanErrorPageProps) {
  useEffect(() => {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "error",
        event: "fan.route.error_boundary",
        message: error.message,
        digest: error.digest,
        stack: error.stack,
      }),
    );
  }, [error]);

  return (
    <FanStateCard
      eyebrow="Fan fallback"
      title="This fan screen could not load"
      description="OnlyClaw hit an unexpected problem while loading this fan page. You can try again or jump back to another fan area."
      secondaryText={error.digest ? `Error reference: ${error.digest}` : "Try again first. If the problem keeps happening, the request details were logged for follow-up."}
      actions={[
        { label: "Open inbox", href: "/fan/messages", variant: "outline" },
        { label: "Manage memberships", href: "/fan/subscriptions", variant: "outline" },
      ]}
    >
      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={() => reset()}>Try again</Button>
      </div>
    </FanStateCard>
  );
}
