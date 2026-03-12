"use client";

import { AppErrorFallback } from "@/components/shared/app-error-fallback";

type ErrorPageProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return <AppErrorFallback error={error} reset={reset} />;
}
