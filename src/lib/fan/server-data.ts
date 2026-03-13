import "server-only";

import { cache } from "react";

import { CreatorState, MediaKind, SubscriptionStatus, TransactionStatus } from "@/generated/prisma/client";
import { requireRole } from "@/lib/auth/viewer";
import { getSubscriptionAccessEndsAt, hasActiveSubscriptionAccess } from "@/lib/billing/state";
import { env } from "@/lib/config/env";
import {
  formatCurrency,
  formatDateTimeLabel,
  formatShortDate,
  formatTimeAgo,
} from "@/lib/formatting";
import {
  fanBillingEntries as demoFanBillingEntries,
  fanConversationThreads as demoFanConversationThreads,
  fanConversations as demoFanConversations,
  fanFeed as demoFanFeed,
  fanProfile as demoFanProfile,
  fanSubscriptions as demoFanSubscriptions,
} from "@/lib/fan/demo-data";
import type { FanConversation, FanConversationMessage, FeedMedia, LockedContent } from "@/lib/fan/types";
import { buildProtectedMediaUrl } from "@/lib/media/protection";
import { prisma } from "@/lib/prisma/client";
import { demoCreators } from "@/lib/public/demo-data";
import { getSafeDisplayUrl } from "@/lib/security/url";

type FeedAccess = "INCLUDED" | "LOCKED";
type SubscriptionUiStatus = "ACTIVE" | "RENEWING_SOON" | "CANCELS_AT_PERIOD_END" | "PAUSED";
type ConversationPreviewTone = "ONLINE" | "UNREAD" | "QUIET";

export type FanShellProfile = {
  displayName: string;
  handle: string;
  membershipCount: number;
  unreadMessages: number;
  monthlySpendCents: number;
  nextRenewalLabel: string;
};

export type FanFeedItem = {
  id: string;
  creatorSlug: string;
  creatorName: string;
  creatorHandle: string;
  creatorAvatarUrl: string;
  destinationHref: string;
  publishedLabel: string;
  headline: string;
  caption: string;
  access: FeedAccess;
  contextLabel: string;
  media: FeedMedia;
};

export type FanSubscriptionCard = {
  id: string;
  creatorSlug: string;
  creatorName: string;
  creatorHandle: string;
  creatorAvatarUrl: string;
  coverUrl?: string;
  destinationHref: string;
  destinationLabel: string;
  status: SubscriptionUiStatus;
  canCancel: boolean;
  cancelAtPeriodEnd: boolean;
  renewalLabel: string;
  priceMonthlyCents: number;
  currency: string;
  perks: string[];
  summary: string;
};

export type AvailableCreatorCard = {
  creatorSlug: string;
  creatorName: string;
  creatorHandle: string;
  creatorAvatarUrl: string;
  coverUrl?: string;
  headline: string;
  priceMonthlyCents: number;
  currency: string;
};

export type FanSubscriptionsPageData = {
  activeCount: number;
  monthlyTotal: number;
  renewalSoonCount: number;
  subscriptions: FanSubscriptionCard[];
  availableCreators: AvailableCreatorCard[];
};

export type FanConversationPreview = {
  id: string;
  creatorSlug: string;
  creatorName: string;
  creatorHandle: string;
  creatorAvatarUrl: string;
  creatorHeadline: string;
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadCount: number;
  tone: ConversationPreviewTone;
  hasLockedDrop: boolean;
};

export type FanBillingEntry = {
  id: string;
  label: string;
  detail: string;
  amountCents: number;
  currency: string;
  status: "PAID" | "PENDING" | "FAILED" | "REFUNDED" | "DISPUTED";
};

function getHandle(username: string | null | undefined) {
  return username ? `@${username}` : "@fan";
}

function isActiveSubscription(subscription: {
  status: SubscriptionStatus;
  startedAt: Date;
  endsAt: Date | null;
  currentPeriodEnd?: Date | null;
}) {
  return hasActiveSubscriptionAccess(subscription);
}

function getSubscriptionUiStatus(subscription: {
  status: SubscriptionStatus;
  startedAt: Date;
  endsAt: Date | null;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
}) {
  if (!isActiveSubscription(subscription)) {
    return "PAUSED" as const;
  }

  if (subscription.cancelAtPeriodEnd) {
    return "CANCELS_AT_PERIOD_END" as const;
  }

  const msUntilRenewal = getSubscriptionAccessEndsAt(subscription).getTime() - Date.now();
  const daysUntilRenewal = msUntilRenewal / (1000 * 60 * 60 * 24);

  if (daysUntilRenewal <= 7) {
    return "RENEWING_SOON" as const;
  }

  return "ACTIVE" as const;
}

function getMediaLabel(kind: MediaKind) {
  if (kind === MediaKind.VIDEO) {
    return "Premium video";
  }

  if (kind === MediaKind.AUDIO) {
    return "Premium audio";
  }

  return "Premium image";
}

function getMediaVariant(mediaAsset: { thumbnailUrl: string | null }) {
  return mediaAsset.thumbnailUrl ? "thumbnail" : "original";
}

function getSignedMediaUrl(
  mediaAsset:
    | {
        id: string;
        thumbnailUrl: string | null;
      }
    | undefined,
  variant?: "thumbnail" | "original",
) {
  if (!mediaAsset) {
    return undefined;
  }

  return buildProtectedMediaUrl({
    assetId: mediaAsset.id,
    variant: variant ?? getMediaVariant(mediaAsset),
    signed: true,
  });
}

function getSafeLockedPreviewMedia(
  mediaAsset:
    | {
        id: string;
        kind: MediaKind;
        thumbnailUrl: string | null;
        altText: string | null;
      }
    | undefined,
): FeedMedia | undefined {
  if (!mediaAsset?.thumbnailUrl) {
    return undefined;
  }

  return {
    imageUrl: getSignedMediaUrl(mediaAsset, "thumbnail"),
    imageAlt: mediaAsset.altText ?? getMediaLabel(mediaAsset.kind),
    label: "Subscriber-only preview",
  };
}

function getUnlockedConversationMedia(
  mediaAsset:
    | {
        id: string;
        kind: MediaKind;
        url: string;
        thumbnailUrl: string | null;
        altText: string | null;
      }
    | undefined,
): FeedMedia | undefined {
  if (!mediaAsset) {
    return undefined;
  }

  return {
    imageUrl: getSignedMediaUrl(mediaAsset),
    imageAlt: mediaAsset.altText ?? getMediaLabel(mediaAsset.kind),
    label: getMediaLabel(mediaAsset.kind),
  };
}

function getSubscriptionPerks(headline: string | null) {
  return [
    "Subscriber-only creator posts",
    "Billing records tracked across renewals and unlocks",
    headline ? `${headline} updates in your inbox` : "Private creator messages",
  ];
}

function getReplyWindowLabel(priceMonthlyCents: number) {
  if (priceMonthlyCents >= 1400) {
    return "Replies in ~3h";
  }

  if (priceMonthlyCents >= 1000) {
    return "Replies in ~4h";
  }

  return "Replies in ~6h";
}

function getDemoFanShellProfile(): FanShellProfile {
  return {
    displayName: demoFanProfile.displayName,
    handle: demoFanProfile.handle,
    membershipCount: demoFanProfile.membershipCount,
    unreadMessages: demoFanProfile.unreadMessages,
    monthlySpendCents: demoFanProfile.monthlySpendCents,
    nextRenewalLabel: demoFanProfile.nextRenewalLabel,
  };
}

function getDemoFanFeedItems(): FanFeedItem[] {
  return demoFanFeed.map((item) => ({
    id: item.id,
    creatorSlug: item.creatorSlug,
    creatorName: item.creatorName,
    creatorHandle: item.creatorHandle,
    creatorAvatarUrl: item.creatorAvatarUrl,
    destinationHref: item.destinationHref,
    publishedLabel: item.publishedLabel,
    headline: item.headline,
    caption: item.caption,
    access: item.access,
    contextLabel: item.contextLabel,
    media: item.media,
  }));
}

function getDemoFanSubscriptionsPageData(): FanSubscriptionsPageData {
  const activeSubscriptions = demoFanSubscriptions.filter((subscription) => subscription.status !== "PAUSED");
  const activeSlugs = new Set(activeSubscriptions.map((subscription) => subscription.creatorSlug));

  return {
    activeCount: activeSubscriptions.length,
    monthlyTotal: activeSubscriptions.reduce((total, subscription) => total + subscription.priceMonthlyCents, 0),
    renewalSoonCount: activeSubscriptions.filter((subscription) => subscription.status === "RENEWING_SOON").length,
    subscriptions: demoFanSubscriptions.map((subscription) => ({
      id: subscription.id,
      creatorSlug: subscription.creatorSlug,
      creatorName: subscription.creatorName,
      creatorHandle: subscription.creatorHandle,
      creatorAvatarUrl: subscription.creatorAvatarUrl,
      coverUrl: subscription.coverUrl,
      destinationHref: `/fan/messages/${subscription.conversationId}`,
      destinationLabel: "Open conversation",
      status: subscription.status,
      canCancel: subscription.status !== "PAUSED",
      cancelAtPeriodEnd: false,
      renewalLabel: subscription.renewalLabel,
      priceMonthlyCents: subscription.priceMonthlyCents,
      currency: subscription.currency,
      perks: [...subscription.perks],
      summary: subscription.summary,
    })),
    availableCreators: demoCreators
      .filter((creator) => !activeSlugs.has(creator.slug))
      .map((creator) => ({
        creatorSlug: creator.slug,
        creatorName: creator.displayName,
        creatorHandle: `@${creator.username}`,
        creatorAvatarUrl: creator.avatarUrl,
        coverUrl: creator.coverUrl,
        headline: creator.headline,
        priceMonthlyCents: creator.priceMonthlyCents,
        currency: creator.currency,
      })),
  };
}

function getDemoFanBillingEntriesData(): FanBillingEntry[] {
  return demoFanBillingEntries.map((entry) => ({
    id: entry.id,
    label: entry.label,
    detail: entry.detail,
    amountCents: entry.amountCents,
    currency: entry.currency,
    status: entry.status,
  }));
}

function getDemoFanConversationPreviews(): FanConversationPreview[] {
  return demoFanConversations.map((conversation) => ({
    id: conversation.id,
    creatorSlug: conversation.creatorSlug,
    creatorName: conversation.creatorName,
    creatorHandle: conversation.creatorHandle,
    creatorAvatarUrl: conversation.creatorAvatarUrl,
    creatorHeadline: conversation.creatorHeadline,
    lastMessagePreview: conversation.lastMessagePreview,
    lastMessageAt: conversation.lastMessageAt,
    unreadCount: conversation.unreadCount,
    tone: conversation.tone,
    hasLockedDrop: conversation.hasLockedDrop,
  }));
}

function getDemoFanConversationById(id: string): FanConversation | null {
  const conversation = demoFanConversationThreads.find((entry) => entry.id === id);

  if (!conversation) {
    return null;
  }

  return {
    id: conversation.id,
    creatorSlug: conversation.creatorSlug,
    creatorName: conversation.creatorName,
    creatorHandle: conversation.creatorHandle,
    creatorAvatarUrl: conversation.creatorAvatarUrl,
    creatorHeadline: conversation.creatorHeadline,
    creatorReplyWindow: conversation.creatorReplyWindow,
    unlockedMessageIds: [...conversation.unlockedMessageIds],
    messages: conversation.messages.map((message) => ({ ...message })),
  };
}

export const getFanShellProfile = cache(async (): Promise<FanShellProfile> => {
  try {
    const viewer = await requireRole("FAN");

    if (!viewer.profile) {
      throw new Error("The active fan account is missing a profile.");
    }

    const [subscriptions, conversations] = await Promise.all([
      prisma.subscription.findMany({
        where: {
          fanId: viewer.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.conversation.findMany({
        where: {
          fanId: viewer.id,
        },
        orderBy: {
          lastMessageAt: "desc",
        },
      }),
    ]);

    const activeSubscriptions = subscriptions.filter(isActiveSubscription);
    const nextRenewal = activeSubscriptions
      .map((subscription) => getSubscriptionAccessEndsAt(subscription))
      .sort((left, right) => left.getTime() - right.getTime())[0];

    return {
      displayName: viewer.profile.displayName,
      handle: getHandle(viewer.profile.username),
      membershipCount: activeSubscriptions.length,
      unreadMessages: conversations.filter((conversation) => Boolean(conversation.lastMessageAt)).length,
      monthlySpendCents: activeSubscriptions.reduce((total, subscription) => total + subscription.priceCents, 0),
      nextRenewalLabel: nextRenewal ? `Next renewal ${formatShortDate(nextRenewal)}` : "No active renewals",
    };
  } catch (error) {
    if (!env.allowDemoDataFallback) {
      throw error;
    }

    return getDemoFanShellProfile();
  }
});

export const getFanFeed = cache(async (): Promise<FanFeedItem[]> => {
  try {
    const viewer = await requireRole("FAN");

    const [subscriptions, creators] = await Promise.all([
      prisma.subscription.findMany({
        where: {
          fanId: viewer.id,
        },
      }),
      prisma.creatorProfile.findMany({
        where: {
          state: CreatorState.APPROVED,
        },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
          conversations: {
            where: {
              fanId: viewer.id,
            },
            take: 1,
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
        orderBy: {
          createdAt: "asc",
        },
      }),
    ]);

    const activeSubscriptionIds = new Set(
      subscriptions
        .filter(isActiveSubscription)
        .map((subscription) => subscription.creatorProfileId),
    );

    return creators
      .filter((creator) => creator.user.profile)
      .map((creator) => {
        const subscriberPost =
          creator.posts.find((post) => post.visibility === "SUBSCRIBER_ONLY") ?? creator.posts[0];
        const media = subscriberPost?.mediaAssets[0];
        const hasAccess = activeSubscriptionIds.has(creator.id);

        return {
          id: subscriberPost?.id ?? creator.id,
          creatorSlug: creator.slug,
          creatorName: creator.user.profile!.displayName,
          creatorHandle: getHandle(creator.user.profile!.username),
          creatorAvatarUrl: getSafeDisplayUrl(creator.user.profile!.avatarUrl) ?? "",
          destinationHref: hasAccess
            ? creator.conversations[0]
              ? `/fan/messages/${creator.conversations[0].id}`
              : `/creators/${creator.slug}`
            : "/fan/subscriptions",
          publishedLabel: subscriberPost?.publishedAt ? formatTimeAgo(subscriberPost.publishedAt) : "New",
          headline: subscriberPost?.title ?? `${creator.user.profile!.displayName} premium post`,
          caption:
            hasAccess
              ? subscriberPost?.caption ??
                "Subscriber-only content is available once this creator is part of your active memberships."
              : "Subscribe to unlock this creator's premium feed.",
          access: hasAccess ? "INCLUDED" : "LOCKED",
          contextLabel: hasAccess
            ? "Unlocked by your active subscription"
            : "Purchase a subscription to reveal this creator's premium feed",
          media: {
            imageUrl: hasAccess
              ? getSignedMediaUrl(media)
              : getSignedMediaUrl(media, media?.thumbnailUrl ? "thumbnail" : undefined),
            imageAlt: hasAccess
              ? media?.altText ?? subscriberPost?.title ?? `${creator.user.profile!.displayName} premium post`
              : "Subscriber-only preview",
            label: hasAccess ? "Premium post unlocked" : "Subscriber-only preview",
          },
        };
      });
  } catch (error) {
    if (!env.allowDemoDataFallback) {
      throw error;
    }

    return getDemoFanFeedItems();
  }
});

export const getFanSubscriptionsPageData = cache(async (): Promise<FanSubscriptionsPageData> => {
  try {
    const viewer = await requireRole("FAN");

    const [subscriptions, creators, conversations] = await Promise.all([
      prisma.subscription.findMany({
        where: {
          fanId: viewer.id,
        },
        include: {
          creatorProfile: {
            include: {
              user: {
                include: {
                  profile: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.creatorProfile.findMany({
        where: {
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
            take: 1,
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      }),
      prisma.conversation.findMany({
        where: {
          fanId: viewer.id,
        },
      }),
    ]);

    const conversationByCreator = new Map(
      conversations.map((conversation) => [conversation.creatorProfileId, conversation.id]),
    );
    const subscriptionByCreator = new Map(
      subscriptions.map((subscription) => [subscription.creatorProfileId, subscription]),
    );

    const subscriptionCards = subscriptions
      .filter((subscription) => subscription.creatorProfile.user.profile)
      .map((subscription) => {
        const creator = subscription.creatorProfile;
        const profile = creator.user.profile!;
        const coverPost = creators.find((entry) => entry.id === creator.id)?.posts[0];
        const coverMedia = coverPost?.mediaAssets[0];
        const conversationId = conversationByCreator.get(creator.id);
        const status = getSubscriptionUiStatus(subscription);
        const accessEndsAt = getSubscriptionAccessEndsAt(subscription);

        return {
          id: subscription.id,
          creatorSlug: creator.slug,
          creatorName: profile.displayName,
          creatorHandle: getHandle(profile.username),
          creatorAvatarUrl: getSafeDisplayUrl(profile.avatarUrl) ?? "",
          coverUrl: getSignedMediaUrl(coverMedia),
          destinationHref: conversationId ? `/fan/messages/${conversationId}` : `/creators/${creator.slug}`,
          destinationLabel: conversationId ? "Open conversation" : "Open creator page",
          status,
          canCancel: isActiveSubscription(subscription) && !subscription.cancelAtPeriodEnd,
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          renewalLabel:
            status === "PAUSED"
              ? "Access inactive"
              : status === "CANCELS_AT_PERIOD_END"
                ? `Access until ${formatShortDate(accessEndsAt)}`
                : `Renews ${formatShortDate(accessEndsAt)}`,
          priceMonthlyCents: subscription.priceCents,
          currency: subscription.currency,
          perks: getSubscriptionPerks(creator.headline),
          summary:
            status === "PAUSED"
              ? "This membership is visible for state handling, but premium content is currently gated."
              : status === "CANCELS_AT_PERIOD_END"
                ? "Cancellation is scheduled. Premium posts and message access stay available through the end of the current billing period."
              : "Premium posts, message access, and billing history are active for this creator.",
        } satisfies FanSubscriptionCard;
      });

    const activeSubscriptions = subscriptionCards.filter((subscription) => subscription.status !== "PAUSED");

    const availableCreators = creators
      .filter((creator) => creator.user.profile)
      .filter((creator) => {
        const subscription = subscriptionByCreator.get(creator.id);
        return !subscription || !isActiveSubscription(subscription);
      })
      .map((creator) => {
        const coverPost = creator.posts[0];
        const coverMedia = coverPost?.mediaAssets[0];

        return {
          creatorSlug: creator.slug,
          creatorName: creator.user.profile!.displayName,
          creatorHandle: getHandle(creator.user.profile!.username),
          creatorAvatarUrl: getSafeDisplayUrl(creator.user.profile!.avatarUrl) ?? "",
          coverUrl: getSignedMediaUrl(coverMedia, coverMedia?.thumbnailUrl ? "thumbnail" : undefined),
          headline: creator.headline ?? "Premium creator",
          priceMonthlyCents: creator.subscriptionPriceCents,
          currency: creator.currency,
        } satisfies AvailableCreatorCard;
      });

    return {
      activeCount: activeSubscriptions.length,
      monthlyTotal: activeSubscriptions.reduce((total, subscription) => total + subscription.priceMonthlyCents, 0),
      renewalSoonCount: activeSubscriptions.filter((subscription) => subscription.status === "RENEWING_SOON").length,
      subscriptions: subscriptionCards,
      availableCreators,
    };
  } catch (error) {
    if (!env.allowDemoDataFallback) {
      throw error;
    }

    return getDemoFanSubscriptionsPageData();
  }
});

export const getFanBillingEntries = cache(async (): Promise<FanBillingEntry[]> => {
  try {
    const viewer = await requireRole("FAN");

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: viewer.id,
      },
      include: {
        subscription: {
          include: {
            creatorProfile: {
              include: {
                user: {
                  include: {
                    profile: true,
                  },
                },
              },
            },
          },
        },
        messageUnlock: {
          include: {
            message: {
              include: {
                conversation: {
                  include: {
                    creatorProfile: {
                      include: {
                        user: {
                          include: {
                            profile: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return transactions.map((transaction) => {
      const creatorName =
        transaction.subscription?.creatorProfile.user.profile?.displayName ??
        transaction.messageUnlock?.message?.conversation.creatorProfile.user.profile?.displayName;

      const label =
        transaction.type === "SUBSCRIPTION"
          ? `${creatorName ?? "Creator"} monthly membership`
          : `${creatorName ?? "Creator"} locked message unlock`;

      return {
        id: transaction.id,
        label,
        detail: `${transaction.provider.toUpperCase()} charge recorded ${formatDateTimeLabel(transaction.createdAt)}`,
        amountCents: transaction.amountCents,
        currency: transaction.currency,
        status:
          transaction.status === TransactionStatus.SUCCEEDED
            ? "PAID"
            : transaction.status === TransactionStatus.REFUNDED ||
                transaction.status === TransactionStatus.PARTIALLY_REFUNDED
              ? "REFUNDED"
              : transaction.status === TransactionStatus.DISPUTED
                ? "DISPUTED"
                : transaction.status === TransactionStatus.FAILED ||
                    transaction.status === TransactionStatus.CANCELED
                  ? "FAILED"
                  : "PENDING",
      };
    });
  } catch (error) {
    if (!env.allowDemoDataFallback) {
      throw error;
    }

    return getDemoFanBillingEntriesData();
  }
});

export const getFanConversationPreviews = cache(async (): Promise<FanConversationPreview[]> => {
  try {
    const viewer = await requireRole("FAN");

    const conversations = await prisma.conversation.findMany({
      where: {
        fanId: viewer.id,
      },
      include: {
        creatorProfile: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            unlocks: {
              where: {
                purchaserId: viewer.id,
              },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        lastMessageAt: "desc",
      },
    });

    return conversations
      .filter((conversation) => conversation.creatorProfile.user.profile)
      .map((conversation) => {
        const latestMessage = conversation.messages[0];
        const hasLockedDrop = conversation.messages.some(
          (message) => message.isLocked && message.unlocks.length === 0,
        );
        const unreadCount = conversation.messages.filter(
          (message) =>
            message.senderId !== viewer.id &&
            Date.now() - message.createdAt.getTime() < 1000 * 60 * 60 * 24,
        ).length;

        return {
          id: conversation.id,
          creatorSlug: conversation.creatorProfile.slug,
          creatorName: conversation.creatorProfile.user.profile!.displayName,
          creatorHandle: getHandle(conversation.creatorProfile.user.profile!.username),
          creatorAvatarUrl: getSafeDisplayUrl(conversation.creatorProfile.user.profile!.avatarUrl) ?? "",
          creatorHeadline: conversation.creatorProfile.headline ?? "Premium creator",
          lastMessagePreview: latestMessage
            ? latestMessage.isLocked && latestMessage.unlocks.length === 0
              ? `Locked drop: ${latestMessage.previewText ?? "Premium message preview"}`
              : latestMessage.previewText ?? latestMessage.body ?? "Conversation updated"
            : "No messages yet",
          lastMessageAt: latestMessage ? formatTimeAgo(latestMessage.createdAt) : "Just unlocked",
          unreadCount,
          tone: hasLockedDrop ? "UNREAD" : unreadCount > 0 ? "ONLINE" : "QUIET",
          hasLockedDrop,
        } satisfies FanConversationPreview;
      });
  } catch (error) {
    if (!env.allowDemoDataFallback) {
      throw error;
    }

    return getDemoFanConversationPreviews();
  }
});

export async function getFanConversationById(id: string): Promise<FanConversation | null> {
  try {
    const viewer = await requireRole("FAN");

    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        fanId: viewer.id,
      },
      include: {
        creatorProfile: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            mediaAssets: {
              orderBy: {
                sortOrder: "asc",
              },
            },
            unlocks: {
              where: {
                purchaserId: viewer.id,
              },
              take: 1,
            },
          },
        },
      },
    });

    if (!conversation?.creatorProfile.user.profile) {
      return null;
    }

    const creatorProfile = conversation.creatorProfile.user.profile;
    const unlockedMessageIds = conversation.messages
      .filter((message) => message.unlocks.length > 0)
      .map((message) => message.id);

    return {
      id: conversation.id,
      creatorSlug: conversation.creatorProfile.slug,
      creatorName: creatorProfile.displayName,
      creatorHandle: getHandle(creatorProfile.username),
      creatorAvatarUrl: getSafeDisplayUrl(creatorProfile.avatarUrl) ?? "",
      creatorHeadline: conversation.creatorProfile.headline ?? "Premium creator",
      creatorReplyWindow: getReplyWindowLabel(conversation.creatorProfile.subscriptionPriceCents),
      unlockedMessageIds,
      messages: conversation.messages.map((message) => {
        const mediaAsset = message.mediaAssets[0];
        const isUnlocked = message.unlocks.length > 0;
        const reportHref =
          message.senderId === viewer.id
            ? undefined
            : `/report?target=message&subject=${encodeURIComponent(`DM from ${creatorProfile.displayName}`)}&url=${encodeURIComponent(`/fan/messages/${conversation.id}`)}&targetMessageId=${encodeURIComponent(message.id)}`;

        if (message.isLocked) {
          const lockedPreview: LockedContent = {
            title: message.previewText ?? "Locked premium message",
            teaser: message.previewText ?? "Premium preview available",
            description: isUnlocked
              ? "Unlocked premium content"
              : "Purchase this unlock to reveal the creator's premium message and any attached media.",
            priceCents: message.unlockPriceCents ?? mediaAsset?.unlockPriceCents ?? 0,
            currency: message.currency,
            unlockedText: isUnlocked ? message.body ?? message.previewText ?? undefined : undefined,
            media: isUnlocked
              ? getUnlockedConversationMedia(mediaAsset)
              : getSafeLockedPreviewMedia(mediaAsset),
          };

          return {
            id: message.id,
            sender: message.senderId === viewer.id ? "fan" : "creator",
            kind: "locked",
            sentAt: formatDateTimeLabel(message.createdAt),
            reportHref,
            body: undefined,
            locked: lockedPreview,
          } satisfies FanConversationMessage;
        }

        if (mediaAsset) {
          return {
            id: message.id,
            sender: message.senderId === viewer.id ? "fan" : "creator",
            kind: "media",
            sentAt: formatDateTimeLabel(message.createdAt),
            reportHref,
            body: message.body ?? undefined,
            media: getUnlockedConversationMedia(mediaAsset)!,
          } satisfies FanConversationMessage;
        }

        return {
          id: message.id,
          sender: message.senderId === viewer.id ? "fan" : "creator",
          kind: "text",
          sentAt: formatDateTimeLabel(message.createdAt),
          reportHref,
          body: message.body ?? undefined,
        } satisfies FanConversationMessage;
      }),
    };
  } catch (error) {
    if (!env.allowDemoDataFallback) {
      throw error;
    }

    return getDemoFanConversationById(id);
  }
}

export function getSubscriptionStatusLabel(status: SubscriptionUiStatus) {
  if (status === "ACTIVE") {
    return "Active";
  }

  if (status === "CANCELS_AT_PERIOD_END") {
    return "Cancellation scheduled";
  }

  if (status === "RENEWING_SOON") {
    return "Renewing soon";
  }

  return "Paused";
}

export function formatAmount(priceCents: number, currency: string) {
  return formatCurrency(priceCents, currency);
}
