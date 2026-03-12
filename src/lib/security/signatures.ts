import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

function toBuffer(value: string) {
  return Buffer.from(value, "utf8");
}

export function signPayload(secret: string, payload: string) {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function verifySignedPayload(secret: string, payload: string, signature: string) {
  const expected = toBuffer(signPayload(secret, payload));
  const received = toBuffer(signature);

  if (expected.length !== received.length) {
    return false;
  }

  return timingSafeEqual(expected, received);
}

export function signTimestampedPayload(secret: string, timestamp: string, payload: string) {
  return signPayload(secret, `${timestamp}.${payload}`);
}
