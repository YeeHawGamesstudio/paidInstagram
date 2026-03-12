import { demoCreators, formatPriceMonthly, type DemoCreator } from "@/lib/public/demo-data";
import type { FanConversation as FanConversationThread, FanConversationMessage, FeedMedia } from "@/lib/fan/types";

type FeedAccess = "INCLUDED" | "LOCKED";
type SubscriptionStatus = "ACTIVE" | "RENEWING_SOON" | "PAUSED";
type ConversationPreviewTone = "ONLINE" | "UNREAD" | "QUIET";

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

export type FanSubscription = {
  id: string;
  creatorSlug: string;
  creatorName: string;
  creatorHandle: string;
  creatorAvatarUrl: string;
  coverUrl: string;
  conversationId: string;
  status: SubscriptionStatus;
  renewalLabel: string;
  priceMonthlyCents: number;
  currency: string;
  perks: string[];
  summary: string;
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
  status: "PAID" | "PENDING";
};

function getCreator(slug: string): DemoCreator {
  const creator = demoCreators.find((entry) => entry.slug === slug);

  if (!creator) {
    throw new Error(`Missing seeded creator for slug: ${slug}`);
  }

  return creator;
}

const luna = getCreator("luna-byte");
const ivy = getCreator("ivy-orbit");
const vega = getCreator("vega-vale");

export const fanProfile = {
  displayName: "Ava Lane",
  handle: "@avalane",
  membershipCount: 2,
  unreadMessages: 4,
  monthlySpendCents: luna.priceMonthlyCents + vega.priceMonthlyCents,
  nextRenewalLabel: "Next renewal in 3 days",
} as const;

export const fanFeed: FanFeedItem[] = [
  {
    id: "feed-luna-afterglow",
    creatorSlug: luna.slug,
    creatorName: luna.displayName,
    creatorHandle: `@${luna.username}`,
    creatorAvatarUrl: luna.avatarUrl,
    destinationHref: "/fan/messages/luna-thread",
    publishedLabel: "12 min ago",
    headline: "After-hours voice note + neon gallery",
    caption: "Subscriber drop from Luna's private lounge. Your membership already includes this post.",
    access: "INCLUDED",
    contextLabel: "Subscriber-only post unlocked by membership",
    media: {
      label: "Subscriber gallery preview",
      imageUrl: luna.posts[1]?.imageUrl ?? luna.coverUrl,
      imageAlt: luna.posts[1]?.imageAlt ?? `${luna.displayName} premium drop`,
    },
  },
  {
    id: "feed-vega-lore",
    creatorSlug: vega.slug,
    creatorName: vega.displayName,
    creatorHandle: `@${vega.username}`,
    creatorAvatarUrl: vega.avatarUrl,
    destinationHref: "/fan/messages/vega-thread",
    publishedLabel: "47 min ago",
    headline: "Moonlit chamber chapter unlocked",
    caption: "Private gallery and lore note from Vega's current fantasy arc.",
    access: "INCLUDED",
    contextLabel: "Included with your active subscription",
    media: {
      label: "Premium gallery preview",
      imageUrl: vega.posts[1]?.imageUrl ?? vega.coverUrl,
      imageAlt: vega.posts[1]?.imageAlt ?? `${vega.displayName} premium gallery`,
    },
  },
  {
    id: "feed-ivy-preview",
    creatorSlug: ivy.slug,
    creatorName: ivy.displayName,
    creatorHandle: `@${ivy.username}`,
    creatorAvatarUrl: ivy.avatarUrl,
    destinationHref: "/fan/subscriptions",
    publishedLabel: "1 h ago",
    headline: "Private docking log preview",
    caption: "This creator is not in your memberships yet, so the subscriber drop stays locked.",
    access: "LOCKED",
    contextLabel: "Subscribers-only preview",
    media: {
      label: "Locked subscriber preview",
      imageUrl: ivy.posts[1]?.imageUrl ?? ivy.coverUrl,
      imageAlt: ivy.posts[1]?.imageAlt ?? `${ivy.displayName} subscriber preview`,
    },
  },
];

export const fanSubscriptions: FanSubscription[] = [
  {
    id: "sub-luna",
    creatorSlug: luna.slug,
    creatorName: luna.displayName,
    creatorHandle: `@${luna.username}`,
    creatorAvatarUrl: luna.avatarUrl,
    coverUrl: luna.coverUrl,
    conversationId: "luna-thread",
    status: "ACTIVE",
    renewalLabel: "Renews Mar 18",
    priceMonthlyCents: luna.priceMonthlyCents,
    currency: luna.currency,
    perks: ["Subscriber feed unlocked", "Priority reply window", "Private media drops"],
    summary: "Your main nightly chat and gallery subscription.",
  },
  {
    id: "sub-vega",
    creatorSlug: vega.slug,
    creatorName: vega.displayName,
    creatorHandle: `@${vega.username}`,
    creatorAvatarUrl: vega.avatarUrl,
    coverUrl: vega.coverUrl,
    conversationId: "vega-thread",
    status: "RENEWING_SOON",
    renewalLabel: "Renews in 3 days",
    priceMonthlyCents: vega.priceMonthlyCents,
    currency: vega.currency,
    perks: ["Lore-first drops", "Fantasy voice clips", "Subscriber vault access"],
    summary: "Active membership with a renewal reminder coming up.",
  },
  {
    id: "sub-ivy",
    creatorSlug: ivy.slug,
    creatorName: ivy.displayName,
    creatorHandle: `@${ivy.username}`,
    creatorAvatarUrl: ivy.avatarUrl,
    coverUrl: ivy.coverUrl,
    conversationId: "ivy-thread",
    status: "PAUSED",
    renewalLabel: "Paused after free preview week",
    priceMonthlyCents: ivy.priceMonthlyCents,
    currency: ivy.currency,
    perks: ["Orbital diary access", "Soft-space galleries", "Private journal threads"],
    summary: "Visible here so billing and membership state feels realistic.",
  },
];

export const fanConversations: FanConversationPreview[] = [
  {
    id: "luna-thread",
    creatorSlug: luna.slug,
    creatorName: luna.displayName,
    creatorHandle: `@${luna.username}`,
    creatorAvatarUrl: luna.avatarUrl,
    creatorHeadline: luna.headline,
    lastMessagePreview: "Dropped you a locked photo set from the rooftop lounge.",
    lastMessageAt: "2m ago",
    unreadCount: 2,
    tone: "UNREAD",
    hasLockedDrop: true,
  },
  {
    id: "vega-thread",
    creatorSlug: vega.slug,
    creatorName: vega.displayName,
    creatorHandle: `@${vega.username}`,
    creatorAvatarUrl: vega.avatarUrl,
    creatorHeadline: vega.headline,
    lastMessagePreview: "I saved the moonlit audio for subscribers first.",
    lastMessageAt: "1h ago",
    unreadCount: 1,
    tone: "ONLINE",
    hasLockedDrop: false,
  },
  {
    id: "ivy-thread",
    creatorSlug: ivy.slug,
    creatorName: ivy.displayName,
    creatorHandle: `@${ivy.username}`,
    creatorAvatarUrl: ivy.avatarUrl,
    creatorHeadline: ivy.headline,
    lastMessagePreview: "You can still see the preview, but full replies need an active membership.",
    lastMessageAt: "Yesterday",
    unreadCount: 0,
    tone: "QUIET",
    hasLockedDrop: true,
  },
];

export const fanConversationThreads: FanConversationThread[] = [
  {
    id: "luna-thread",
    creatorSlug: luna.slug,
    creatorName: luna.displayName,
    creatorHandle: `@${luna.username}`,
    creatorAvatarUrl: luna.avatarUrl,
    creatorHeadline: luna.headline,
    creatorReplyWindow: luna.stats.replyWindow,
    unlockedMessageIds: [],
    messages: [
      {
        id: "luna-msg-1",
        sender: "creator",
        kind: "text",
        sentAt: "9:12 PM",
        body: "You made it just in time. I kept tonight's neon set private for subscribers first.",
      },
      {
        id: "luna-msg-2",
        sender: "fan",
        kind: "text",
        sentAt: "9:14 PM",
        body: "I love the late-night lounge drops. Did you save the rooftop angle too?",
      },
      {
        id: "luna-msg-3",
        sender: "creator",
        kind: "media",
        sentAt: "9:16 PM",
        body: "Saved the first frame for you.",
        media: {
          label: "Private lounge preview",
          imageUrl: luna.posts[0]?.imageUrl ?? luna.coverUrl,
          imageAlt: luna.posts[0]?.imageAlt ?? `${luna.displayName} preview`,
        },
      },
      {
        id: "luna-msg-4",
        sender: "creator",
        kind: "locked",
        sentAt: "9:18 PM",
        locked: {
          title: "Rooftop afterglow set",
          teaser: "6 premium images + 1 short voice note",
          description: "One paid drop from tonight's chrome rooftop session.",
          priceCents: 1800,
          currency: "usd",
          unlockedText: "Unlocked note: this set is the full after-hours sequence with the skyline audio layered in.",
          media: {
            label: "Unlocked premium gallery cover",
            imageUrl: luna.posts[1]?.imageUrl ?? luna.coverUrl,
            imageAlt: luna.posts[1]?.imageAlt ?? `${luna.displayName} rooftop gallery`,
          },
        },
      },
      {
        id: "luna-msg-5",
        sender: "system",
        kind: "text",
        sentAt: "9:18 PM",
        body: "Paid unlocks are mock-only in this preview and do not trigger real billing.",
      },
      {
        id: "luna-msg-6",
        sender: "fan",
        kind: "text",
        sentAt: "9:19 PM",
        body: "Perfect. The preview already looks premium.",
      },
    ],
  },
  {
    id: "vega-thread",
    creatorSlug: vega.slug,
    creatorName: vega.displayName,
    creatorHandle: `@${vega.username}`,
    creatorAvatarUrl: vega.avatarUrl,
    creatorHeadline: vega.headline,
    creatorReplyWindow: vega.stats.replyWindow,
    unlockedMessageIds: [],
    messages: [
      {
        id: "vega-msg-1",
        sender: "creator",
        kind: "text",
        sentAt: "7:02 PM",
        body: "Tonight's lore post is live in your subscriber feed.",
      },
      {
        id: "vega-msg-2",
        sender: "creator",
        kind: "media",
        sentAt: "7:05 PM",
        body: "Here is the chamber key art before I post the audio.",
        media: {
          label: "Moonlit chamber key art",
          imageUrl: vega.posts[1]?.imageUrl ?? vega.coverUrl,
          imageAlt: vega.posts[1]?.imageAlt ?? `${vega.displayName} key art`,
        },
      },
      {
        id: "vega-msg-3",
        sender: "fan",
        kind: "text",
        sentAt: "7:11 PM",
        body: "The atmosphere on this one is incredible.",
      },
    ],
  },
  {
    id: "ivy-thread",
    creatorSlug: ivy.slug,
    creatorName: ivy.displayName,
    creatorHandle: `@${ivy.username}`,
    creatorAvatarUrl: ivy.avatarUrl,
    creatorHeadline: ivy.headline,
    creatorReplyWindow: ivy.stats.replyWindow,
    unlockedMessageIds: [],
    messages: [
      {
        id: "ivy-msg-1",
        sender: "creator",
        kind: "text",
        sentAt: "Yesterday",
        body: "You still have preview access to the thread, but premium replies are reserved for active subscribers.",
      },
      {
        id: "ivy-msg-2",
        sender: "creator",
        kind: "locked",
        sentAt: "Yesterday",
        locked: {
          title: "Orbital diary excerpt",
          teaser: "Short premium entry preview",
          description: "Unlock this single note or rejoin monthly access from subscriptions.",
          priceCents: 1200,
          currency: "usd",
          unlockedText: "Unlocked excerpt: the station lights dimmed until the whole dome felt like it was breathing with me.",
        },
      },
    ],
  },
];

export const fanBillingEntries: FanBillingEntry[] = [
  {
    id: "bill-1",
    label: "Luna Byte monthly membership",
    detail: "Processed Mar 4",
    amountCents: luna.priceMonthlyCents,
    currency: luna.currency,
    status: "PAID",
  },
  {
    id: "bill-2",
    label: "Vega Vale monthly membership",
    detail: "Renews Mar 18",
    amountCents: vega.priceMonthlyCents,
    currency: vega.currency,
    status: "PENDING",
  },
  {
    id: "bill-3",
    label: "Mock message unlock balance",
    detail: "Preview-only wallet placeholder",
    amountCents: 1800,
    currency: "usd",
    status: "PENDING",
  },
];

export function getFanConversationById(id: string) {
  return fanConversationThreads.find((conversation) => conversation.id === id);
}

export function getSubscriptionStatusLabel(status: SubscriptionStatus) {
  if (status === "ACTIVE") {
    return "Active";
  }

  if (status === "RENEWING_SOON") {
    return "Renewing soon";
  }

  return "Paused";
}

export function formatAmount(priceCents: number, currency: string) {
  return formatPriceMonthly(priceCents, currency);
}
