export const REQUEST_ID_HEADER = "x-request-id";

export function getRequestId(request: Request) {
  return (
    request.headers.get(REQUEST_ID_HEADER) ??
    request.headers.get("x-vercel-id") ??
    crypto.randomUUID()
  );
}
