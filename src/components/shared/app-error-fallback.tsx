"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type AppErrorFallbackProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
  title?: string;
  description?: string;
};

export function AppErrorFallback({
  error,
  reset,
  title = "Something went wrong",
  description = "OnlyClaw hit an unexpected problem while rendering this screen. You can try again, and if the issue keeps happening, use the request details in logs to investigate.",
}: AppErrorFallbackProps) {
  useEffect(() => {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: "error",
        event: "ui.error_boundary",
        message: error.message,
        digest: error.digest,
        stack: error.stack,
      }),
    );
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-4 py-10 sm:px-6">
      <Card className="w-full border-white/10 bg-[linear-gradient(180deg,_rgba(18,18,22,0.98),_rgba(11,11,14,0.96))] p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">
          Operational fallback
        </p>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl">{title}</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
          {description}
        </p>

        {error.digest ? (
          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-muted-foreground">
            Error digest: <span className="font-mono text-foreground">{error.digest}</span>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={() => reset()}>Try again</Button>
          <Button
            onClick={() => window.location.assign("/")}
            variant="outline"
          >
            Go home
          </Button>
        </div>
      </Card>
    </main>
  );
}
