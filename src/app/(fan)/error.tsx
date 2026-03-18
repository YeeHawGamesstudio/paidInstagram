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
      title="Something went wrong"
      description="Something went wrong."
      secondaryText={error.digest ? `Reference: ${error.digest}` : undefined}
      actions={[
        { label: "Back to home", href: "/fan" },
        { label: "Open messages", href: "/fan/messages", variant: "outline" },
        { label: "Manage memberships", href: "/fan/subscriptions", variant: "outline" },
      ]}
    >
      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={() => reset()}>Try again</Button>
      </div>
    </FanStateCard>
  );
}
