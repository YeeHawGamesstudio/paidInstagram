import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  ADULT_ACCESS_COOKIE_NAME,
  isAdultAccessAcknowledged,
  shouldRequireAdultAccess,
} from "@/lib/compliance/scaffolding";
import { REQUEST_ID_HEADER } from "@/lib/observability/request";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

function applySecurityHeaders(response: NextResponse) {
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-site");
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "img-src 'self' data: blob: https:",
      "media-src 'self' blob: https:",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "connect-src 'self' https:",
    ].join("; "),
  );

  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const requestHeaders = new Headers(request.headers);
  const requestId = requestHeaders.get(REQUEST_ID_HEADER) ?? crypto.randomUUID();
  requestHeaders.set(REQUEST_ID_HEADER, requestId);

  if (!shouldRequireAdultAccess(pathname)) {
    const response = await updateSupabaseSession(request, requestHeaders);
    response.headers.set(REQUEST_ID_HEADER, requestId);
    return applySecurityHeaders(response);
  }

  const adultAccessCookie = request.cookies.get(ADULT_ACCESS_COOKIE_NAME)?.value;

  if (isAdultAccessAcknowledged(adultAccessCookie)) {
    const response = await updateSupabaseSession(request, requestHeaders);
    response.headers.set(REQUEST_ID_HEADER, requestId);
    return applySecurityHeaders(response);
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/18-plus";
  redirectUrl.searchParams.set("next", `${pathname}${search}`);

  const response = NextResponse.redirect(redirectUrl);
  response.headers.set(REQUEST_ID_HEADER, requestId);
  return applySecurityHeaders(response);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
