import { NextResponse } from "next/server";

import { AccessDeniedError } from "@/lib/auth/viewer";
import { BillingConfigurationError, BillingProcessingError } from "@/lib/billing/errors";
import { REQUEST_ID_HEADER } from "@/lib/observability/request";
import { RateLimitExceededError } from "@/lib/security/rate-limit";

type ResponseOptions = {
  headers?: HeadersInit;
  requestId: string;
  status?: number;
};

export type ClassifiedRouteError = {
  code: string;
  logLevel: "warn" | "error";
  message: string;
  retryAfterSeconds?: number;
  status: number;
};

export function jsonResponse<T>(body: T, options: ResponseOptions) {
  const headers = new Headers(options.headers);
  headers.set(REQUEST_ID_HEADER, options.requestId);

  return NextResponse.json(body, {
    headers,
    status: options.status ?? 200,
  });
}

export function jsonErrorResponse(input: {
  code: string;
  headers?: HeadersInit;
  message: string;
  requestId: string;
  status: number;
}) {
  return jsonResponse(
    {
      ok: false,
      code: input.code,
      message: input.message,
      requestId: input.requestId,
    },
    {
      headers: input.headers,
      requestId: input.requestId,
      status: input.status,
    },
  );
}

export function classifyRouteError(error: unknown): ClassifiedRouteError {
  if (error instanceof RateLimitExceededError) {
    return {
      code: "rate_limited",
      logLevel: "warn",
      message: error.message,
      retryAfterSeconds: error.retryAfterSeconds,
      status: 429,
    };
  }

  if (error instanceof AccessDeniedError) {
    return {
      code: "access_denied",
      logLevel: "warn",
      message: error.message,
      status: 403,
    };
  }

  if (error instanceof BillingConfigurationError) {
    return {
      code: "billing_unavailable",
      logLevel: "error",
      message: error.message,
      status: 503,
    };
  }

  if (error instanceof BillingProcessingError) {
    return {
      code: "invalid_request",
      logLevel: "warn",
      message: error.message,
      status: 400,
    };
  }

  return {
    code: "internal_error",
    logLevel: "error",
    message: "The server could not complete this request.",
    status: 500,
  };
}
