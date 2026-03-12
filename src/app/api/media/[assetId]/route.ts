import { NextResponse } from "next/server";

import { MediaAccessType, PostVisibility } from "@/generated/prisma/client";
import { getOptionalViewer } from "@/lib/auth/viewer";
import { hasActiveSubscriptionAccess } from "@/lib/billing/state";
import { env } from "@/lib/config/env";
import type { MediaVariant } from "@/lib/media/protection";
import { verifyProtectedMediaSignature } from "@/lib/media/protection";
import { jsonErrorResponse } from "@/lib/observability/http";
import { logError, logWarn } from "@/lib/observability/logger";
import { getRequestId } from "@/lib/observability/request";
import { prisma } from "@/lib/prisma/client";

type RouteContext = {
  params: Promise<{
    assetId: string;
  }>;
};

export const dynamic = "force-dynamic";

function isAllowedMediaHost(hostname: string) {
  const normalized = hostname.toLowerCase();

  return env.allowedMediaHosts.some(
    (allowedHost) => normalized === allowedHost || normalized.endsWith(`.${allowedHost}`),
  );
}

function resolveMediaTarget(request: Request, rawUrl: string | null | undefined) {
  if (!rawUrl) {
    return null;
  }

  try {
    const resolved = rawUrl.startsWith("/")
      ? new URL(rawUrl, request.url)
      : new URL(rawUrl);

    if (!["http:", "https:"].includes(resolved.protocol)) {
      return null;
    }

    if (resolved.pathname.startsWith("/api/media/")) {
      return null;
    }

    if (env.allowedMediaHosts.length > 0 && !isAllowedMediaHost(resolved.hostname)) {
      return null;
    }

    if (env.isProduction && env.allowedMediaHosts.length === 0) {
      return null;
    }

    return resolved;
  } catch {
    return null;
  }
}

function parseVariant(value: string | null): MediaVariant {
  return value === "original" ? "original" : "thumbnail";
}

async function viewerHasActiveSubscription(viewerId: string, creatorProfileId: string) {
  const subscription = await prisma.subscription.findFirst({
    where: {
      fanId: viewerId,
      creatorProfileId,
    },
  });

  return subscription ? hasActiveSubscriptionAccess(subscription) : false;
}

export async function GET(request: Request, context: RouteContext) {
  const { assetId } = await context.params;
  const requestId = getRequestId(request);
  const requestUrl = new URL(request.url);
  const variant = parseVariant(requestUrl.searchParams.get("variant"));
  const expiresParam = requestUrl.searchParams.get("expires");
  const signature = requestUrl.searchParams.get("sig");

  const deny = (status: number, code: string, message: string, reason: string) => {
    logWarn({
      event: "media.request.denied",
      message: "Media request was denied.",
      requestId,
      metadata: {
        assetId,
        code,
        reason,
        status,
        variant,
      },
    });

    return jsonErrorResponse({
      code,
      message,
      requestId,
      status,
    });
  };

  try {
    const viewer = await getOptionalViewer();
    const asset = await prisma.mediaAsset.findUnique({
      where: {
        id: assetId,
      },
      include: {
        post: {
          select: {
            id: true,
            visibility: true,
            isPublished: true,
            creatorProfileId: true,
            creatorProfile: {
              select: {
                userId: true,
              },
            },
          },
        },
        message: {
          select: {
            id: true,
            isLocked: true,
            conversation: {
              select: {
                fanId: true,
                creatorProfile: {
                  select: {
                    userId: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!asset) {
      return deny(404, "media_not_found", "Media asset not found.", "missing_asset");
    }

    const requiresSignedAccess =
      Boolean(asset.message) ||
      asset.accessType !== MediaAccessType.PUBLIC ||
      asset.post?.visibility === PostVisibility.SUBSCRIBER_ONLY;

    if (requiresSignedAccess) {
      const expiresAt = Number(expiresParam);

      if (
        !signature ||
        !Number.isFinite(expiresAt) ||
        !verifyProtectedMediaSignature({
          assetId,
          variant,
          expiresAt,
          signature,
        })
      ) {
        return deny(
          403,
          "invalid_media_signature",
          "Protected media URL is invalid or expired.",
          "invalid_signature",
        );
      }
    }

    const isAdmin = viewer?.role === "ADMIN";

    if (asset.post) {
      const isCreatorOwner = viewer?.id === asset.post.creatorProfile.userId;

      if (!asset.post.isPublished && !isAdmin && !isCreatorOwner) {
        return deny(403, "media_unavailable", "This media is unavailable.", "unpublished_post");
      }

      const isPublicPost =
        asset.post.visibility === PostVisibility.PUBLIC &&
        asset.accessType === MediaAccessType.PUBLIC;

      if (!isPublicPost && !isAdmin && !isCreatorOwner) {
        if (variant === "thumbnail" && asset.post.visibility === PostVisibility.SUBSCRIBER_ONLY && asset.thumbnailUrl) {
          // Signed teaser thumbnails are allowed for public profile previews.
        } else if (viewer?.role === "FAN") {
          const hasAccess = await viewerHasActiveSubscription(viewer.id, asset.post.creatorProfileId);

          if (!hasAccess) {
            return deny(
              403,
              "subscription_required",
              "An active subscription is required for this media.",
              "missing_subscription",
            );
          }
        } else {
          return deny(
            403,
            "subscription_required",
            "An active subscription is required for this media.",
            "unauthenticated_subscription_access",
          );
        }
      }
    }

    if (asset.message) {
      const isCreatorOwner = viewer?.id === asset.message.conversation.creatorProfile.userId;
      const isConversationFan = viewer?.id === asset.message.conversation.fanId;

      if (!isAdmin && !isCreatorOwner && !isConversationFan) {
        return deny(
          403,
          "conversation_access_denied",
          "You do not have access to this conversation media.",
          "conversation_membership_required",
        );
      }

      if (
        !isAdmin &&
        !isCreatorOwner &&
        (asset.message.isLocked || asset.accessType !== MediaAccessType.PUBLIC) &&
        !(variant === "thumbnail" && asset.thumbnailUrl)
      ) {
        const unlock = viewer
          ? await prisma.messageUnlock.findFirst({
              where: {
                purchaserId: viewer.id,
                OR: [
                  {
                    messageId: asset.message.id,
                  },
                  {
                    mediaAssetId: asset.id,
                  },
                ],
              },
            })
          : null;

        if (!unlock) {
          return deny(
            403,
            "unlock_required",
            "Unlock purchase required for this media.",
            "missing_unlock",
          );
        }
      }
    }

    const sourceUrl =
      variant === "original" || !asset.thumbnailUrl
        ? asset.url
        : asset.thumbnailUrl;
    const targetUrl = resolveMediaTarget(request, sourceUrl);

    if (!targetUrl) {
      return deny(403, "media_origin_denied", "Media origin is not allowed.", "invalid_origin");
    }

    const upstream = await fetch(targetUrl, {
      cache: "no-store",
    });

    if (!upstream.ok || !upstream.body) {
      logWarn({
        event: "media.upstream.unavailable",
        message: "Media origin did not return a usable response.",
        requestId,
        metadata: {
          assetId,
          status: upstream.status,
          targetUrl: targetUrl.toString(),
          variant,
        },
      });

      return jsonErrorResponse({
        code: "media_unavailable",
        message: "Media could not be loaded.",
        requestId,
        status: 404,
      });
    }

    const contentType = upstream.headers.get("content-type");

    if (
      contentType &&
      !contentType.startsWith("image/") &&
      !contentType.startsWith("video/") &&
      !contentType.startsWith("audio/")
    ) {
      logWarn({
        event: "media.upstream.invalid_content_type",
        message: "Media origin returned an unexpected content type.",
        requestId,
        metadata: {
          assetId,
          contentType,
          targetUrl: targetUrl.toString(),
          variant,
        },
      });

      return jsonErrorResponse({
        code: "invalid_media_type",
        message: "Media origin returned an unexpected content type.",
        requestId,
        status: 415,
      });
    }

    const headers = new Headers();

    if (contentType) {
      headers.set("content-type", contentType);
    }

    headers.set(
      "cache-control",
      requiresSignedAccess ? "private, no-store" : "public, max-age=300, stale-while-revalidate=600",
    );
    headers.set("content-disposition", "inline");
    headers.set("cross-origin-resource-policy", "same-site");
    headers.set("x-content-type-options", "nosniff");
    headers.set("x-request-id", requestId);

    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (error) {
    logError({
      event: "media.request.failed",
      message: "Media request failed unexpectedly.",
      requestId,
      metadata: {
        assetId,
        error,
        variant,
      },
    });

    return jsonErrorResponse({
      code: "internal_error",
      message: "Media could not be loaded right now.",
      requestId,
      status: 500,
    });
  }
}
