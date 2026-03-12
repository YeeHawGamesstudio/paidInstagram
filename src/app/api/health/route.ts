import { logError, logWarn } from "@/lib/observability/logger";
import { jsonResponse } from "@/lib/observability/http";
import { getRequestId } from "@/lib/observability/request";
import { getOperationalReadinessSnapshot } from "@/lib/operations/readiness";

export const dynamic = "force-dynamic";

async function buildHealthResponse(request: Request) {
  const requestId = getRequestId(request);
  const snapshot = await getOperationalReadinessSnapshot();
  const statusCode = snapshot.status === "fail" ? 503 : 200;

  if (snapshot.status === "fail") {
    logError({
      event: "healthcheck.failed",
      message: "Health check reported a failing dependency.",
      requestId,
      metadata: {
        checks: snapshot.checks,
        summary: snapshot.summary,
      },
    });
  } else if (snapshot.status === "warn") {
    logWarn({
      event: "healthcheck.warn",
      message: "Health check reported operational warnings.",
      requestId,
      metadata: {
        checks: snapshot.checks,
        summary: snapshot.summary,
      },
    });
  }

  return {
    requestId,
    response: jsonResponse(
      {
        ok: snapshot.status !== "fail",
        checkedAt: snapshot.checkedAt,
        status: snapshot.status,
      },
      {
        headers: {
          "cache-control": "no-store",
        },
        requestId,
        status: statusCode,
      },
    ),
  };
}

export async function GET(request: Request) {
  const { response } = await buildHealthResponse(request);
  return response;
}

export async function HEAD(request: Request) {
  const { requestId, response } = await buildHealthResponse(request);

  return new Response(null, {
    headers: response.headers,
    status: response.status,
    statusText: response.statusText,
  });
}
