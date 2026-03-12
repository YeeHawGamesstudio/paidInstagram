import "server-only";

import { cache } from "react";

import { CreatorState, SubscriptionStatus, type UserRole } from "@/generated/prisma/client";
import { env } from "@/lib/config/env";
import type {
  CreatorApprovalStatus,
  CreatorVerificationStatus,
} from "@/lib/compliance/scaffolding";
import { formatMonthlyPrice, formatTimeAgo } from "@/lib/formatting";
import { prisma } from "@/lib/prisma/client";
import { buildProtectedMediaUrl } from "@/lib/media/protection";
import { formatPriceMonthly, getDemoCreatorBySlug } from "@/lib/public/demo-data";
import { getSafeDisplayUrl } from "@/lib/security/url";
import { getOptionalViewer } from "@/lib/auth/viewer";

export type CreatorProfilePost = {
  id: string;
  title: string;
  caption: string;
  body: string;
  publishedLabel: string;
  imageUrl?: string;
  imageAlt: string;
  reportHref: string;
};

export type CreatorProfilePageData = {
  slug: string;
  displayName: string;
  username: string;
  headline: string;
  bio: string;
  avatarUrl?: string;
  coverUrl?: string;
  category: string;
  stats: {
    publicPosts: number;
    exclusiveDrops: number;
    replyWindow: string;
  };
  priceMonthlyCents: number;
  currency: string;
  formattedMonthlyPrice: string;
  isSubscribed: boolean;
  viewerRole: UserRole | null;
  compliance: {
    approvalStatus: CreatorApprovalStatus;
    verificationStatus: CreatorVerificationStatus;
    adultContentLabel: string;
    reportHref: string;
  };
  publicPosts: CreatorProfilePost[];
  subscriberPosts: CreatorProfilePost[];
};

function getSubscriptionEndsAt(subscription: { startedAt: Date; endsAt: Date | null }) {
  if (subscription.endsAt) {
    return subscription.endsAt;
  }

  const derived = new Date(subscription.startedAt);
  derived.setMonth(derived.getMonth() + 1);
  return derived;
}

function mapPublicPost(post: CreatorProfilePageData["publicPosts"][number]) {
  return post;
}

function getMediaVariant(mediaAsset: { thumbnailUrl: string | null }) {
  return mediaAsset.thumbnailUrl ? "thumbnail" : "original";
}

function getPublicMediaUrl(
  mediaAsset:
    | {
        id: string;
        thumbnailUrl: string | null;
      }
    | null
    | undefined,
) {
  if (!mediaAsset) {
    return undefined;
  }

  return buildProtectedMediaUrl({
    assetId: mediaAsset.id,
    variant: getMediaVariant(mediaAsset),
  });
}

function getProtectedPostMediaUrl(
  mediaAsset:
    | {
        id: string;
        thumbnailUrl: string | null;
      }
    | null
    | undefined,
) {
  if (!mediaAsset) {
    return undefined;
  }

  return buildProtectedMediaUrl({
    assetId: mediaAsset.id,
    variant: getMediaVariant(mediaAsset),
    signed: true,
  });
}

function getProtectedPostPreviewUrl(
  mediaAsset:
    | {
        id: string;
        thumbnailUrl: string | null;
      }
    | null
    | undefined,
) {
  if (!mediaAsset?.thumbnailUrl) {
    return undefined;
  }

  return buildProtectedMediaUrl({
    assetId: mediaAsset.id,
    variant: "thumbnail",
    signed: true,
  });
}

function getCreatorApprovalStatus(state: CreatorState): CreatorApprovalStatus {
  if (state === CreatorState.APPROVED) {
    return "APPROVED";
  }

  if (state === CreatorState.SUSPENDED) {
    return "SUSPENDED";
  }

  return "IN_REVIEW";
}

function getCreatorVerificationStatus(state: CreatorState): CreatorVerificationStatus {
  if (state === CreatorState.APPROVED) {
    return "IN_REVIEW";
  }

  if (state === CreatorState.SUSPENDED) {
    return "ACTION_REQUIRED";
  }

  return "SUBMITTED";
}

function mapSubscriberPost(
  post: {
    id: string;
    title: string | null;
    caption: string | null;
    body: string | null;
    publishedAt: Date | null;
    reportHref: string;
    mediaAssets: Array<{
      id: string;
      url: string;
      thumbnailUrl: string | null;
      altText: string | null;
    }>;
  },
  isSubscribed: boolean,
): CreatorProfilePost {
  const primaryMedia = post.mediaAssets[0];

  if (!isSubscribed) {
    return {
      id: post.id,
      title: "Subscriber-only post",
      caption: "Subscribe to unlock this creator's premium drop.",
      body: "This content stays server-side until an active subscription is confirmed.",
      publishedLabel: post.publishedAt ? formatTimeAgo(post.publishedAt) : "New",
      imageUrl: getProtectedPostPreviewUrl(primaryMedia),
      imageAlt: "Subscriber-only preview",
      reportHref: post.reportHref,
    };
  }

  return {
    id: post.id,
    title: post.title ?? "Subscriber-only post",
    caption: post.caption ?? "Premium creator drop",
    body: post.body ?? "Premium creator drop",
    publishedLabel: post.publishedAt ? formatTimeAgo(post.publishedAt) : "New",
    imageUrl: getProtectedPostMediaUrl(primaryMedia),
    imageAlt: primaryMedia?.altText ?? post.title ?? "Premium creator post",
    reportHref: post.reportHref,
  };
}

export const getCreatorProfilePageData = cache(
  async (slug: string): Promise<CreatorProfilePageData | null> => {
    try {
      const viewer = await getOptionalViewer();

      const creator = await prisma.creatorProfile.findFirst({
        where: {
          slug,
          state: CreatorState.APPROVED,
        },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
          posts: {
            where: {
              isPublished: true,
            },
            orderBy: {
              publishedAt: "desc",
            },
            include: {
              mediaAssets: {
                orderBy: {
                  sortOrder: "asc",
                },
              },
            },
          },
        },
      });

      if (!creator?.user.profile) {
        return null;
      }

      let isSubscribed = false;

      if (viewer?.role === "FAN") {
        const viewerSubscription = await prisma.subscription.findFirst({
          where: {
            creatorProfileId: creator.id,
            fanId: viewer.id,
          },
        });

        isSubscribed =
          viewerSubscription?.status === SubscriptionStatus.ACTIVE &&
          getSubscriptionEndsAt(viewerSubscription).getTime() > Date.now();
      }

      const publicPosts = creator.posts.filter((post) => post.visibility === "PUBLIC");
      const subscriberPosts = creator.posts.filter((post) => post.visibility === "SUBSCRIBER_ONLY");
      const latestCoverMedia = creator.posts[0]?.mediaAssets[0];
      const latestCoverPost = creator.posts[0];

      return {
        slug: creator.slug,
        displayName: creator.user.profile.displayName,
        username: creator.user.profile.username ?? creator.slug,
        headline: creator.headline ?? "Premium creator",
        bio: creator.bio ?? creator.user.profile.bio ?? "Premium creator profile",
        avatarUrl: getSafeDisplayUrl(creator.user.profile.avatarUrl),
        coverUrl:
          latestCoverPost?.visibility === "SUBSCRIBER_ONLY"
            ? getProtectedPostPreviewUrl(latestCoverMedia)
            : getPublicMediaUrl(latestCoverMedia),
        category: "Premium creator",
        stats: {
          publicPosts: publicPosts.length,
          exclusiveDrops: subscriberPosts.length,
          replyWindow: creator.subscriptionPriceCents >= 1400 ? "Replies in ~3h" : "Replies in ~4h",
        },
        priceMonthlyCents: creator.subscriptionPriceCents,
        currency: creator.currency,
        formattedMonthlyPrice: formatMonthlyPrice(creator.subscriptionPriceCents, creator.currency),
        isSubscribed,
        viewerRole: viewer?.role ?? null,
        compliance: {
          approvalStatus: getCreatorApprovalStatus(creator.state),
          verificationStatus: getCreatorVerificationStatus(creator.state),
          adultContentLabel: "18+ self-attestation gate required",
          reportHref: `/report?target=creator&subject=${encodeURIComponent(creator.user.profile.displayName)}&url=${encodeURIComponent(`/creators/${creator.slug}`)}&targetCreatorProfileId=${encodeURIComponent(creator.id)}`,
        },
        publicPosts: publicPosts.map((post) =>
          mapPublicPost({
            id: post.id,
            title: post.title ?? "Public post",
            caption: post.caption ?? "Public teaser",
            body: post.body ?? "Public teaser",
            publishedLabel: post.publishedAt ? formatTimeAgo(post.publishedAt) : "New",
            imageUrl: getPublicMediaUrl(post.mediaAssets[0]),
            imageAlt: post.mediaAssets[0]?.altText ?? post.title ?? "Creator post",
            reportHref: `/report?target=post&subject=${encodeURIComponent(post.title ?? creator.user.profile!.displayName)}&url=${encodeURIComponent(`/creators/${creator.slug}`)}&targetPostId=${encodeURIComponent(post.id)}`,
          }),
        ),
        subscriberPosts: subscriberPosts.map((post) =>
          mapSubscriberPost(
            {
              id: post.id,
              title: post.title,
              caption: post.caption,
              body: post.body,
              publishedAt: post.publishedAt,
              reportHref: `/report?target=post&subject=${encodeURIComponent(post.title ?? creator.user.profile!.displayName)}&url=${encodeURIComponent(`/creators/${creator.slug}`)}&targetPostId=${encodeURIComponent(post.id)}`,
              mediaAssets: post.mediaAssets.map((asset) => ({
                id: asset.id,
                url: asset.url,
                thumbnailUrl: asset.thumbnailUrl,
                altText: asset.altText,
              })),
            },
            isSubscribed,
          ),
        ),
      };
    } catch (error) {
      if (!env.allowDemoDataFallback) {
        throw error;
      }

      const demoCreator = getDemoCreatorBySlug(slug);

      if (!demoCreator) {
        return null;
      }

      const publicPosts = demoCreator.posts.filter((post) => post.visibility === "PUBLIC");
      const subscriberPosts = demoCreator.posts.filter((post) => post.visibility === "SUBSCRIBER_ONLY");

      return {
        slug: demoCreator.slug,
        displayName: demoCreator.displayName,
        username: demoCreator.username,
        headline: demoCreator.headline,
        bio: demoCreator.bio,
        avatarUrl: demoCreator.avatarUrl,
        coverUrl: demoCreator.coverUrl,
        category: demoCreator.category,
        stats: {
          publicPosts: publicPosts.length,
          exclusiveDrops: subscriberPosts.length,
          replyWindow: demoCreator.stats.replyWindow,
        },
        priceMonthlyCents: demoCreator.priceMonthlyCents,
        currency: demoCreator.currency,
        formattedMonthlyPrice: `${formatPriceMonthly(demoCreator.priceMonthlyCents, demoCreator.currency)}/mo`,
        isSubscribed: false,
        viewerRole: null,
        compliance: demoCreator.compliance,
        publicPosts: publicPosts.map((post) => ({
          id: post.id,
          title: post.title,
          caption: post.caption,
          body: post.body,
          publishedLabel: post.publishedLabel,
          imageUrl: post.imageUrl,
          imageAlt: post.imageAlt,
          reportHref: demoCreator.compliance.reportHref,
        })),
        subscriberPosts: subscriberPosts.map((post) => ({
          id: post.id,
          title: post.title,
          caption: post.caption,
          body: post.body,
          publishedLabel: post.publishedLabel,
          imageUrl: post.imageUrl,
          imageAlt: post.imageAlt,
          reportHref: demoCreator.compliance.reportHref,
        })),
      };
    }
  },
);
