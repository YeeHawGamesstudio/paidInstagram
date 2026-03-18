import { demoCreators, formatPriceMonthly } from "@/lib/public/demo-data";
import type {
  CreatorApprovalStatus,
  CreatorVerificationStatus,
} from "@/lib/compliance/scaffolding";

export type CreatorPostVisibility = "PUBLIC" | "SUBSCRIBER_ONLY";
export type CreatorPostStatus = "PUBLISHED" | "SCHEDULED" | "DRAFT";
export type CreatorConversationTone = "UNREAD" | "VIP" | "QUIET";
export type CreatorSubscriberStatus = "ACTIVE" | "VIP" | "AT_RISK";

export type CreatorComplianceTaskStatus = "done" | "pending" | "action_required";

export type CreatorManagedPost = {
  id: string;
  title: string;
  caption: string;
  visibility: CreatorPostVisibility;
  status: CreatorPostStatus;
  publishedLabel: string;
  coverUrl: string;
  engagementLabel: string;
  earningsLabel: string;
};

export type CreatorConversationPreview = {
  id: string;
  fanName: string;
  fanHandle: string;
  fanAvatarUrl: string;
  tone: CreatorConversationTone;
  lastMessagePreview: string;
  lastMessageAt: string;
  unreadCount: number;
  activeSubscription: boolean;
  suggestedOfferCents: number;
};

export type CreatorSubscriber = {
  id: string;
  fanName: string;
  fanHandle: string;
  fanAvatarUrl: string;
  status: CreatorSubscriberStatus;
  joinedLabel: string;
  billingLabel: string;
  lifetimeSpendCents: number;
  note: string;
};

const creator = demoCreators[0];

if (!creator) {
  throw new Error("Missing seeded creator demo data.");
}

export const creatorProfileSummary = {
  id: creator.slug,
  displayName: creator.displayName,
  handle: `@${creator.username}`,
  headline: creator.headline,
  bio: creator.bio,
  category: creator.category,
  avatarUrl: creator.avatarUrl,
  coverUrl: creator.coverUrl,
  currency: creator.currency,
  monthlyPriceCents: creator.priceMonthlyCents,
  monthlyPriceLabel: formatPriceMonthly(creator.priceMonthlyCents, creator.currency),
  activeSubscribers: 482,
  unreadConversations: 19,
  queuedPosts: 3,
  monthlyRecurringRevenueCents: creator.priceMonthlyCents * 482,
  retentionLabel: "92% retention",
  replyWindowLabel: creator.stats.replyWindow,
  conversionLabel: "7.4% public-to-paid",
  profileCompleteness: "Profile 96% complete",
  highlights: [
    "Profile",
    "Publishing",
    "Paid messages",
  ],
} as const;

export const creatorComplianceSummary = {
  approvalStatus: "APPROVED" as CreatorApprovalStatus,
  verificationStatus: "ACTION_REQUIRED" as CreatorVerificationStatus,
  adultAccessStatus: "SELF_ATTESTED" as const,
  contentPolicyAcceptance: "Accepted 3 days ago",
  dmcaContactEmail: "rights@onlyclaw.example",
  lastReviewLabel: "Admin compliance check updated today",
  readinessNote: "Verification and rights workflows pending.",
} as const;

export const creatorComplianceChecklist: Array<{
  id: string;
  label: string;
  status: CreatorComplianceTaskStatus;
  detail: string;
}> = [
  {
    id: "adult-disclosure",
    label: "Adult-content disclosure acknowledged",
    status: "done",
    detail: "Profile and discovery surfaces can point to the 18+ disclaimer and gate.",
  },
  {
    id: "verification",
    label: "Creator verification package requires follow-up",
    status: "action_required",
    detail: "The UI hook exists for document review, but the real workflow is not finalized.",
  },
  {
    id: "policy-acceptance",
    label: "Policy acceptance checkpoint captured",
    status: "done",
    detail: "Terms, content policy, and acceptable-use routes exist for future signed acceptance.",
  },
  {
    id: "rights-contact",
    label: "Rights / DMCA contact remains placeholder",
    status: "pending",
    detail: "A production inbox and legal process still need to be wired.",
  },
];

export const creatorVerificationMilestones = [
  {
    label: "Identity / age record",
    state: "Pending",
    detail: "Awaiting document review.",
  },
  {
    label: "Payout readiness",
    state: "Not started",
    detail: "Tax and payout screening required.",
  },
  {
    label: "Policy attestations",
    state: "Ready",
    detail: "Terms and content policy acceptance available.",
  },
];

export const creatorPosts: CreatorManagedPost[] = [
  {
    id: "creator-post-afterglow",
    title: "Afterglow rooftop set",
    caption: "Subscriber-only gallery with the skyline voice note layered in.",
    visibility: "SUBSCRIBER_ONLY",
    status: "PUBLISHED",
    publishedLabel: "Published 2h ago",
    coverUrl: creator.posts[1]?.imageUrl ?? creator.coverUrl,
    engagementLabel: "318 opens · 54 comments",
    earningsLabel: "Drives 21 membership renewals",
  },
  {
    id: "creator-post-teaser",
    title: "Neon hallway teaser",
    caption: "Public preview card built to funnel fans into the paid archive.",
    visibility: "PUBLIC",
    status: "PUBLISHED",
    publishedLabel: "Published yesterday",
    coverUrl: creator.posts[0]?.imageUrl ?? creator.coverUrl,
    engagementLabel: "18.4k impressions · 8.2% CTR",
    earningsLabel: "Top membership conversion source",
  },
  {
    id: "creator-post-audio",
    title: "Late-night audio confession",
    caption: "Scheduled subscriber drop with one image and a short private voice note.",
    visibility: "SUBSCRIBER_ONLY",
    status: "SCHEDULED",
    publishedLabel: "Scheduled for tonight · 11:30 PM",
    coverUrl: creator.coverUrl,
    engagementLabel: "Pre-save interest from 63 fans",
    earningsLabel: "Expected high retention content",
  },
  {
    id: "creator-post-draft",
    title: "Studio mirror draft",
    caption: "Drafted public hook post that tees up next week's paid bundle.",
    visibility: "PUBLIC",
    status: "DRAFT",
    publishedLabel: "Draft saved 40 min ago",
    coverUrl: creator.coverUrl,
    engagementLabel: "No audience data yet",
    earningsLabel: "Prepared as a conversion teaser",
  },
];

export const creatorConversations: CreatorConversationPreview[] = [
  {
    id: "conv-ava",
    fanName: "Ava Lane",
    fanHandle: "@avalane",
    fanAvatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    tone: "UNREAD",
    lastMessagePreview: "If you send the full rooftop set, I'll unlock it tonight.",
    lastMessageAt: "2m ago",
    unreadCount: 3,
    activeSubscription: true,
    suggestedOfferCents: 1800,
  },
  {
    id: "conv-mira",
    fanName: "Mira Sol",
    fanHandle: "@mirasol",
    fanAvatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
    tone: "VIP",
    lastMessagePreview: "The private voice notes are why I stay subscribed every month.",
    lastMessageAt: "18m ago",
    unreadCount: 0,
    activeSubscription: true,
    suggestedOfferCents: 2400,
  },
  {
    id: "conv-jules",
    fanName: "Jules Hart",
    fanHandle: "@juleshart",
    fanAvatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    tone: "QUIET",
    lastMessagePreview: "Paused my membership for now, but I still want occasional paid drops.",
    lastMessageAt: "Yesterday",
    unreadCount: 0,
    activeSubscription: false,
    suggestedOfferCents: 1200,
  },
  {
    id: "conv-rio",
    fanName: "Rio Vale",
    fanHandle: "@riovale",
    fanAvatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    tone: "UNREAD",
    lastMessagePreview: "Can you send a locked bundle with both images and audio?",
    lastMessageAt: "5h ago",
    unreadCount: 1,
    activeSubscription: true,
    suggestedOfferCents: 2200,
  },
];

export const creatorSubscribers: CreatorSubscriber[] = [
  {
    id: "sub-ava",
    fanName: "Ava Lane",
    fanHandle: "@avalane",
    fanAvatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    status: "VIP",
    joinedLabel: "Joined 7 months ago",
    billingLabel: "Renews in 3 days",
    lifetimeSpendCents: 19200,
    note: "Consistently unlocks paid media bundles and replies quickly.",
  },
  {
    id: "sub-mira",
    fanName: "Mira Sol",
    fanHandle: "@mirasol",
    fanAvatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
    status: "ACTIVE",
    joinedLabel: "Joined 4 months ago",
    billingLabel: "Renews tomorrow",
    lifetimeSpendCents: 10800,
    note: "High message engagement and strong retention.",
  },
  {
    id: "sub-rio",
    fanName: "Rio Vale",
    fanHandle: "@riovale",
    fanAvatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    status: "ACTIVE",
    joinedLabel: "Joined 1 month ago",
    billingLabel: "Renews in 18 days",
    lifetimeSpendCents: 3900,
    note: "Recently converted from a public teaser funnel.",
  },
  {
    id: "sub-jules",
    fanName: "Jules Hart",
    fanHandle: "@juleshart",
    fanAvatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    status: "AT_RISK",
    joinedLabel: "Joined 2 months ago",
    billingLabel: "Card retry pending",
    lifetimeSpendCents: 2598,
    note: "Paused membership but still responds to locked one-off offers.",
  },
];

export const creatorAudienceSnapshot = [
  { label: "Active subscribers", value: "3" },
  { label: "VIP subscribers", value: "1" },
  { label: "Churn watch", value: "0" },
];

export const creatorProfileFormDefaults = {
  displayName: creator.displayName,
  username: creator.username,
  headline: creator.headline,
  bio: creator.bio,
  welcomeMessage:
    "You're in. New drops land here. --Luna",
  location: "Neon City",
  rightsContactEmail: "rights@onlyclaw.example",
  adultDisclosure:
    "Adult-oriented creator profile. Final legal disclaimers and verification controls are still being formalized.",
};

export const creatorPricingSettings = {
  minMonthlyPriceCents: 500,
  maxMonthlyPriceCents: 3000,
  suggestedMonthlyPriceCents: 1499,
  paidMessageDefaultCents: 1800,
  bundleDefaultCents: 2400,
};

export function formatCreatorCurrency(amountCents: number) {
  return formatPriceMonthly(amountCents, creator.currency);
}

export function getCreatorPostVisibilityLabel(visibility: CreatorPostVisibility) {
  return visibility === "PUBLIC" ? "Public teaser" : "Subscriber-only";
}

export function getCreatorPostStatusLabel(status: CreatorPostStatus) {
  if (status === "PUBLISHED") {
    return "Published";
  }

  if (status === "SCHEDULED") {
    return "Scheduled";
  }

  return "Draft";
}

export function getCreatorSubscriberStatusLabel(status: CreatorSubscriberStatus) {
  if (status === "VIP") {
    return "VIP";
  }

  if (status === "ACTIVE") {
    return "Active";
  }

  return "At risk";
}
