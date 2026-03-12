import { logInfo } from "@/lib/observability/logger";

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  logInfo({
    event: "app.startup",
    message: "OnlyClaw server runtime initialized.",
    metadata: {
      runtime: process.env.NEXT_RUNTIME,
    },
  });
}
