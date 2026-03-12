import "server-only";

import { env } from "@/lib/config/env";
import { signPayload, verifySignedPayload } from "@/lib/security/signatures";

export type MediaVariant = "thumbnail" | "original";

const SIGNED_MEDIA_TTL_MS = 1000 * 60 * 5;

type BuildProtectedMediaUrlInput = {
  assetId: string;
  variant: MediaVariant;
  signed?: boolean;
};

function getSignaturePayload(assetId: string, variant: MediaVariant, expiresAt: number) {
  return `${assetId}:${variant}:${expiresAt}`;
}

export function buildProtectedMediaUrl(input: BuildProtectedMediaUrlInput) {
  const basePath = `/api/media/${encodeURIComponent(input.assetId)}?variant=${input.variant}`;

  if (!input.signed) {
    return basePath;
  }

  const expiresAt = Date.now() + SIGNED_MEDIA_TTL_MS;
  const payload = getSignaturePayload(input.assetId, input.variant, expiresAt);
  const signature = signPayload(env.mediaSigningSecret, payload);

  return `${basePath}&expires=${expiresAt}&sig=${signature}`;
}

export function verifyProtectedMediaSignature(input: {
  assetId: string;
  variant: MediaVariant;
  expiresAt: number;
  signature: string;
}) {
  if (!Number.isFinite(input.expiresAt) || input.expiresAt <= Date.now()) {
    return false;
  }

  return verifySignedPayload(
    env.mediaSigningSecret,
    getSignaturePayload(input.assetId, input.variant, input.expiresAt),
    input.signature,
  );
}
