import { NextRequest, NextResponse } from "next/server";

import { processBillingWebhook } from "@/lib/billing/service";
import { classifyRouteError, jsonErrorResponse, jsonResponse } from "@/lib/observability/http";
import { logError, logInfo, logWarn } from "@/lib/observability/logger";
import { getRequestId } from "@/lib/observability/request";
import { RateLimitExceededError, consumeRateLimit } from "@/lib/security/rate-limit";

type RouteContext = {
  params: Promise<{
    provider: string;
  }>;
};

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { provider } = await context.params;
  const requestId = getRequestId(request);
  const clientIp = getClientIp(request);

  try {
    logInfo({
      event: "billing.webhook.received",
      message: "Received billing webhook request.",
      requestId,
      metadata: {
        clientIp,
        provider,
      },
    });

    const rateLimit = consumeRateLimit({
      key: `webhook:${provider}:${clientIp}`,
      limit: 60,
      windowMs: 60 * 1000,
      message: "Too many webhook requests. Please retry shortly.",
    });

    if (!rateLimit.allowed) {
      throw new RateLimitExceededError(
        "Too many webhook requests. Please retry shortly.",
        rateLimit.retryAfterSeconds,
      );
    }

    const result = await processBillingWebhook(provider, request);
    logInfo({
      event: "billing.webhook.processed",
      message: "Billing webhook was processed.",
      requestId,
      metadata: {
        handled: result.handled,
        eventId: result.eventId,
        eventType: result.eventType,
        provider,
      },
    });

    return jsonResponse(result, {
      requestId,
    });
  } catch (error) {
    const classified = classifyRouteError(error);
    const log = classified.logLevel === "error" ? logError : logWarn;

    log({
      event: "billing.webhook.failed",
      message: "Billing webhook processing failed.",
      requestId,
      metadata: {
        clientIp,
        error,
        provider,
        status: classified.status,
      },
    });

    return jsonErrorResponse({
      code: classified.code,
      headers: classified.retryAfterSeconds
        ? {
            "Retry-After": classified.retryAfterSeconds.toString(),
          }
        : undefined,
      message: classified.message,
      requestId,
      status: classified.status,
    });
  }
}
