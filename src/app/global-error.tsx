"use client";

import { AppErrorFallback } from "@/components/shared/app-error-fallback";

import "./globals.css";

type GlobalErrorPageProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function GlobalErrorPage({
  error,
  reset,
}: GlobalErrorPageProps) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased">
        <AppErrorFallback
          error={error}
          reset={reset}
          title="A global application error occurred"
          description="OnlyClaw could not recover this screen automatically. Retry the request, and if it continues, inspect the server logs and health endpoint to confirm runtime and dependency state."
        />
      </body>
    </html>
  );
}
