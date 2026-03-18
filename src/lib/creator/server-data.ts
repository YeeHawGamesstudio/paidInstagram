import "server-only";

import { cache } from "react";

import { PostVisibility, TransactionStatus } from "@/generated/prisma/client";
import type { CreatorConversationPreview, CreatorSubscriber } from "@/lib/creator/demo-data";
import {
  creatorConversations as demoCreatorConversations,
  creatorPosts as demoCreatorPosts,
  creatorPricingSettings,
  creatorProfileFormDefaults,
  creatorProfileSummary,
  creatorSubscribers,
} from "@/lib/creator/demo-data";
import { requireRole } from "@/lib/auth/viewer";
import { getSubscriptionAccessEndsAt, hasActiveSubscriptionAccess } from "@/lib/billing/state";
import { env } from "@/lib/config/env";
import { formatDateTimeLabel, formatShortDate, formatTimeAgo } from "@/lib/formatting";
import { prisma } from "@/lib/prisma/client";
import { getSafeDisplayUrl } from "@/lib/security/url";

export type CreatorManagedPostView = {
  id: string;
  title: string;
  caption: string;
  visibility: "PUBLIC" | "SUBSCRIBER_ONLY";
  status: "PUBLISHED" | "SCHEDULED" | "DRAFT";
  publishedLabel: string;
  coverUrl: string;
  engagementLabel: string;
  earningsLabel: string;
};

export type CreatorSettingsView = {
  displayName: string;
  username: string;
  headline: string;
  bio: string;
  location: string;
  replyWindow: string;
  welcomeMessage: string;
  rightsContactEmail: string;
  adultDisclosure: string;
  avatarUrl?: string;
  handle: string;
};

export type CreatorPricingView = {
  currency: string;
  monthlyPriceCents: number;
  minMonthlyPriceCents: number;
  maxMonthlyPriceCents: number;
  suggestedMonthlyPriceCents: number;
  paidMessageDefaultCents: number;
  bundleDefaultCents: number;
  trialEnabled: boolean;
};

export type CreatorSubscriberView = CreatorSubscriber & {
  conversationId: string | null;
  currency: string;
};

function buildPreviewText(message: { body: string | null; previewText: string | null; isLocked: boolean }) {
  if (message.isLocked) {
    return `Locked drop: ${message.previewText ?? "Premium message"}`;
  }

  return message.previewText ?? message.body ?? "Conversation updated";
}

function countUnreadFanMessages(
  messages: Array<{
    createdAt: Date;
    senderId: string;
  }>,
  creatorUserId: string,
) {
  const latestCreatorReply = messages.find((message) => message.senderId === creatorUserId);

  if (!latestCreatorReply) {
    return messages.filter((message) => message.senderId !== creatorUserId).length;
  }

  return messages.filter(
    (message) =>
      message.senderId !== creatorUserId && message.createdAt.getTime() > latestCreatorReply.createdAt.getTime(),
  ).length;
}

function getSuggestedOfferCents(priceCents: number, activeSubscription: boolean) {
  if (activeSubscription) {
    return Math.max(priceCents + 300, 1200);
  }

  return Math.max(Math.round(priceCents * 0.8), 900);
}

function getPostStatus(post: { isPublished: boolean; publishedAt: Date | null }) {
  if (post.isPublished) {
    return "PUBLISHED" as const;
  }

  if (post.publishedAt && post.publishedAt.getTime() > Date.now()) {
    return "SCHEDULED" as const;
  }

  return "DRAFT" as const;
}

function getPostPublishedLabel(post: { isPublished: boolean; publishedAt: Date | null; createdAt: Date }) {
  if (post.isPublished && post.publishedAt) {
    return formatTimeAgo(post.publishedAt);
  }

  if (!post.isPublished && post.publishedAt && post.publishedAt.getTime() > Date.now()) {
    return `Scheduled for ${formatDateTimeLabel(post.publishedAt)}`;
  }

  return `Draft updated ${formatTimeAgo(post.createdAt)}`;
}

function getPostEngagementLabel(status: CreatorManagedPostView["status"]) {
  if (status === "PUBLISHED") {
    return "Performance metrics will appear here as fans open the post.";
  }

  if (status === "SCHEDULED") {
    return "This post will start collecting metrics after it goes live.";
  }

  return "No audience data yet.";
}

function getPostEarningsLabel(
  status: CreatorManagedPostView["status"],
  visibility: CreatorManagedPostView["visibility"],
) {
  if (status === "PUBLISHED" && visibility === "SUBSCRIBER_ONLY") {
    return "Supports subscriber retention once live.";
  }

  if (status === "PUBLISHED") {
    return "Built to drive discovery and membership conversion.";
  }

  if (status === "SCHEDULED") {
    return visibility === "SUBSCRIBER_ONLY"
      ? "Positioned as a subscriber-value drop."
      : "Positioned as a teaser for the next paid moment.";
  }

  return visibility === "SUBSCRIBER_ONLY"
    ? "Drafted as a member-value post."
    : "Drafted as a public conversion teaser.";
}

function getSubscriberStatus(input: {
  activeSubscription: boolean;
  cancelAtPeriodEnd: boolean;
  lastPaymentFailureAt: Date | null;
  lifetimeSpendCents: number;
  accessEndsAt: Date;
}) {
  if (
    !input.activeSubscription ||
    input.cancelAtPeriodEnd ||
    input.lastPaymentFailureAt ||
    input.accessEndsAt.getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000
  ) {
    return "AT_RISK" as const;
  }

  if (input.lifetimeSpendCents >= 3 * 1000) {
    return "VIP" as const;
  }

  return "ACTIVE" as const;
}

function getSubscriberNote(status: CreatorSubscriberView["status"], activeSubscription: boolean) {
  if (status === "VIP") {
    return "High-value subscriber with strong retention upside and room for tailored outreach.";
  }

  if (status === "AT_RISK") {
    return activeSubscription
      ? "Subscription needs attention soon because renewal or payment risk is visible."
      : "Membership access is no longer active, so this fan now needs recovery messaging.";
  }

  return "Stable active subscriber with room for steady retention and occasional upsell.";
}

export const getCreatorConversationPreviews = cache(async (): Promise<CreatorConversationPreview[]> => {
  try {
    const viewer = await requireRole("CREATOR");

    if (!viewer.creatorProfile) {
      throw new Error("The active creator account is missing a creator profile.");
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        creatorProfileId: viewer.creatorProfile.id,
      },
      include: {
        fan: {
          include: {
            profile: true,
          },
        },
        messages: {
          select: {
            body: true,
            createdAt: true,
            isLocked: true,
            previewText: true,
            senderId: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        lastMessageAt: "desc",
      },
    });

    const subscriptions = await prisma.subscription.findMany({
      where: {
        creatorProfileId: viewer.creatorProfile.id,
        fanId: {
          in: conversations.map((conversation) => conversation.fanId),
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const subscriptionByFanId = new Map(
      subscriptions.map((subscription) => [subscription.fanId, subscription]),
    );

    return conversations
      .filter((conversation) => conversation.fan.profile)
      .map((conversation) => {
        const latestMessage = conversation.messages[0];
        const subscription = subscriptionByFanId.get(conversation.fanId);
        const activeSubscription = subscription ? hasActiveSubscriptionAccess(subscription) : false;
        const unreadCount = countUnreadFanMessages(conversation.messages, viewer.id);

        return {
          id: conversation.id,
          fanName: conversation.fan.profile!.displayName,
          fanHandle: conversation.fan.profile!.username ? `@${conversation.fan.profile!.username}` : "@fan",
          fanAvatarUrl: getSafeDisplayUrl(conversation.fan.profile!.avatarUrl) ?? "",
          tone: unreadCount > 0 ? "UNREAD" : activeSubscription ? "VIP" : "QUIET",
          lastMessagePreview: latestMessage ? buildPreviewText(latestMessage) : "No messages yet",
          lastMessageAt: latestMessage ? formatTimeAgo(latestMessage.createdAt) : "Just unlocked",
          unreadCount,
          activeSubscription,
          suggestedOfferCents: getSuggestedOfferCents(
            subscription?.priceCents ?? viewer.creatorProfile!.subscriptionPriceCents,
            activeSubscription,
          ),
        } satisfies CreatorConversationPreview;
      });
  } catch (error) {
    if (!env.allowDemoDataFallback) {
      throw error;
    }

    return demoCreatorConversations;
  }
});

export const getCreatorManagedPosts = cache(async (): Promise<CreatorManagedPostView[]> => {
  try {
    const viewer = await requireRole("CREATOR");

    if (!viewer.creatorProfile) {
      throw new Error("The active creator account is missing a creator profile.");
    }

    const posts = await prisma.post.findMany({
      where: {
        creatorProfileId: viewer.creatorProfile.id,
      },
      include: {
        mediaAssets: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
      orderBy: [
        {
          updatedAt: "desc",
        },
      ],
    });

    return posts.map((post) => {
      const status = getPostStatus(post);
      const coverUrl =
        getSafeDisplayUrl(post.mediaAssets[0]?.thumbnailUrl) ??
        getSafeDisplayUrl(post.mediaAssets[0]?.url) ??
        getSafeDisplayUrl(viewer.profile?.avatarUrl) ??
        "";

      return {
        id: post.id,
        title:
          post.title ??
          (post.visibility === PostVisibility.PUBLIC ? "Public teaser" : "Subscriber post"),
        caption: post.caption ?? post.body ?? "Add copy to give this post a stronger hook.",
        visibility: post.visibility,
        status,
        publishedLabel: getPostPublishedLabel(post),
        coverUrl,
        engagementLabel: getPostEngagementLabel(status),
        earningsLabel: getPostEarningsLabel(status, post.visibility),
      } satisfies CreatorManagedPostView;
    });
  } catch (error) {
    if (!env.allowDemoDataFallback) {
      throw error;
    }

    return demoCreatorPosts;
  }
});

export const getCreatorSettingsView = cache(async (): Promise<CreatorSettingsView> => {
  try {
    const viewer = await requireRole("CREATOR");

    if (!viewer.creatorProfile || !viewer.profile) {
      throw new Error("The active creator account is missing profile data.");
    }

    return {
      displayName: viewer.profile.displayName,
      username: viewer.profile.username ?? viewer.creatorProfile.slug,
      headline: viewer.creatorProfile.headline ?? "",
      bio: viewer.creatorProfile.bio ?? viewer.profile.bio ?? "",
      location: creatorProfileFormDefaults.location,
      replyWindow:
        viewer.creatorProfile.subscriptionPriceCents >= 1400 ? "Replies in ~3h" : "Replies in ~4h",
      welcomeMessage: creatorProfileFormDefaults.welcomeMessage,
      rightsContactEmail: viewer.creatorProfile.dmcaContactEmail ?? "",
      adultDisclosure: viewer.creatorProfile.adultContentDisclosure ?? "",
      avatarUrl: getSafeDisplayUrl(viewer.profile.avatarUrl),
      handle: viewer.profile.username ? `@${viewer.profile.username}` : `@${viewer.creatorProfile.slug}`,
    };
  } catch (error) {
    if (!env.allowDemoDataFallback) {
      throw error;
    }

    return {
      displayName: creatorProfileFormDefaults.displayName,
      username: creatorProfileFormDefaults.username,
      headline: creatorProfileFormDefaults.headline,
      bio: creatorProfileFormDefaults.bio,
      location: creatorProfileFormDefaults.location,
      replyWindow: creatorProfileSummary.replyWindowLabel,
      welcomeMessage: creatorProfileFormDefaults.welcomeMessage,
      rightsContactEmail: creatorProfileFormDefaults.rightsContactEmail,
      adultDisclosure: creatorProfileFormDefaults.adultDisclosure,
      avatarUrl: creatorProfileSummary.avatarUrl,
      handle: creatorProfileSummary.handle,
    };
  }
});

export const getCreatorPricingView = cache(async (): Promise<CreatorPricingView> => {
  try {
    const viewer = await requireRole("CREATOR");

    if (!viewer.creatorProfile) {
      throw new Error("The active creator account is missing a creator profile.");
    }

    return {
      currency: viewer.creatorProfile.currency,
      monthlyPriceCents: viewer.creatorProfile.subscriptionPriceCents,
      minMonthlyPriceCents: creatorPricingSettings.minMonthlyPriceCents,
      maxMonthlyPriceCents: creatorPricingSettings.maxMonthlyPriceCents,
      suggestedMonthlyPriceCents: creatorPricingSettings.suggestedMonthlyPriceCents,
      paidMessageDefaultCents: creatorPricingSettings.paidMessageDefaultCents,
      bundleDefaultCents: creatorPricingSettings.bundleDefaultCents,
      trialEnabled: false,
    };
  } catch (error) {
    if (!env.allowDemoDataFallback) {
      throw error;
    }

    return {
      currency: "usd",
      monthlyPriceCents: creatorProfileSummary.monthlyPriceCents,
      minMonthlyPriceCents: creatorPricingSettings.minMonthlyPriceCents,
      maxMonthlyPriceCents: creatorPricingSettings.maxMonthlyPriceCents,
      suggestedMonthlyPriceCents: creatorPricingSettings.suggestedMonthlyPriceCents,
      paidMessageDefaultCents: creatorPricingSettings.paidMessageDefaultCents,
      bundleDefaultCents: creatorPricingSettings.bundleDefaultCents,
      trialEnabled: false,
    };
  }
});

export const getCreatorSubscribersView = cache(async (): Promise<CreatorSubscriberView[]> => {
  try {
    const viewer = await requireRole("CREATOR");

    if (!viewer.creatorProfile) {
      throw new Error("The active creator account is missing a creator profile.");
    }

    const subscriptions = await prisma.subscription.findMany({
      where: {
        creatorProfileId: viewer.creatorProfile.id,
      },
      include: {
        fan: {
          include: {
            profile: true,
          },
        },
        transactions: {
          where: {
            status: TransactionStatus.SUCCEEDED,
          },
          select: {
            amountCents: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    const conversations = await prisma.conversation.findMany({
      where: {
        creatorProfileId: viewer.creatorProfile.id,
        fanId: {
          in: subscriptions.map((subscription) => subscription.fanId),
        },
      },
      select: {
        id: true,
        fanId: true,
      },
    });

    const conversationIdByFanId = new Map(conversations.map((conversation) => [conversation.fanId, conversation.id]));

    return subscriptions
      .filter((subscription) => subscription.fan.profile)
      .map((subscription) => {
        const accessEndsAt = getSubscriptionAccessEndsAt(subscription);
        const activeSubscription = hasActiveSubscriptionAccess(subscription);
        const lifetimeSpendCents =
          subscription.transactions.reduce((total, transaction) => total + transaction.amountCents, 0) ||
          subscription.priceCents;
        const status = getSubscriberStatus({
          activeSubscription,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          lastPaymentFailureAt: subscription.lastPaymentFailureAt,
          lifetimeSpendCents,
          accessEndsAt,
        });

        return {
          id: subscription.id,
          conversationId: conversationIdByFanId.get(subscription.fanId) ?? null,
          currency: subscription.currency,
          fanName: subscription.fan.profile!.displayName,
          fanHandle: subscription.fan.profile!.username ? `@${subscription.fan.profile!.username}` : "@fan",
          fanAvatarUrl: getSafeDisplayUrl(subscription.fan.profile!.avatarUrl) ?? "",
          status,
          joinedLabel: `Joined ${formatShortDate(subscription.startedAt)}`,
          billingLabel: activeSubscription
            ? subscription.cancelAtPeriodEnd
              ? `Access ends ${formatShortDate(accessEndsAt)}`
              : `Renews ${formatShortDate(accessEndsAt)}`
            : `Access ended ${formatShortDate(accessEndsAt)}`,
          lifetimeSpendCents,
          note: getSubscriberNote(status, activeSubscription),
        } satisfies CreatorSubscriberView;
      });
  } catch (error) {
    if (!env.allowDemoDataFallback) {
      throw error;
    }

    const conversationIdMap = new Map(demoCreatorConversations.map((c) => [c.fanName, c.id]));
    return creatorSubscribers.map((subscriber) => ({
      ...subscriber,
      conversationId: conversationIdMap.get(subscriber.fanName) ?? null,
      currency: "usd",
    }));
  }
});
