import type { CreatorApprovalStatus, CreatorVerificationStatus } from "@/lib/compliance/scaffolding";

export type DemoPostVisibility = "PUBLIC" | "SUBSCRIBER_ONLY";

export type DemoPost = {
  id: string;
  title: string;
  caption: string;
  body: string;
  visibility: DemoPostVisibility;
  publishedLabel: string;
  imageUrl: string;
  imageAlt: string;
};

export type DemoCreator = {
  slug: string;
  displayName: string;
  username: string;
  headline: string;
  bio: string;
  avatarUrl: string;
  coverUrl: string;
  priceMonthlyCents: number;
  currency: string;
  category: string;
  highlight: string;
  tags: string[];
  stats: {
    teaserPosts: number;
    exclusiveDrops: number;
    replyWindow: string;
  };
  compliance: {
    approvalStatus: CreatorApprovalStatus;
    verificationStatus: CreatorVerificationStatus;
    adultContentLabel: string;
    reportHref: string;
  };
  posts: DemoPost[];
};

export const creatorBenefits = [
  {
    title: "Editorial presentation",
    description: "Profiles are designed like premium digital magazines instead of generic creator dashboards.",
  },
  {
    title: "Tease-to-subscribe funnel",
    description: "Public previews create desire while locked states make the paid value unmistakably clear.",
  },
  {
    title: "Mobile-native conversion",
    description: "Subscribe moments stay visible on smaller screens without turning the experience into a loud sales page.",
  },
] as const;

export const landingStats = [
  { label: "Featured creators", value: "03" },
  { label: "Seeded teaser posts", value: "06" },
  { label: "Premium surfaces", value: "06" },
] as const;

export const demoCreators: DemoCreator[] = [
  {
    slug: "luna-byte",
    displayName: "Luna Byte",
    username: "lunabyte",
    headline: "Neon cyber idol",
    bio: "AI cyber idol sharing neon diaries, polished rooftop teasers, and private after-hours sets for subscribers.",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    coverUrl: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1400&q=80",
    priceMonthlyCents: 1299,
    currency: "usd",
    category: "Cyber glam",
    highlight: "Chrome-lit visuals, late-night voice notes, and cinematic premium drops.",
    tags: ["AI creator", "Neon sets", "Voice notes"],
    stats: {
      teaserPosts: 12,
      exclusiveDrops: 28,
      replyWindow: "Replies in ~4h",
    },
    compliance: {
      approvalStatus: "APPROVED",
      verificationStatus: "IN_REVIEW",
      adultContentLabel: "18+ self-attestation gate required",
      reportHref: "/report?target=creator&subject=Luna%20Byte&url=%2Fcreators%2Fluna-byte",
    },
    posts: [
      {
        id: "luna-public-1",
        title: "Tonight's Neon Glimpse",
        caption: "Public teaser from Luna's city rooftop stream.",
        body: "A quick look over the chrome skyline before the private set starts.",
        visibility: "PUBLIC",
        publishedLabel: "4 days ago",
        imageUrl: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Neon city skyline teaser",
      },
      {
        id: "luna-locked-1",
        title: "Afterglow Archive",
        caption: "Subscriber-only set from the private neon lounge.",
        body: "Full premium scene with extended gallery for active subscribers.",
        visibility: "SUBSCRIBER_ONLY",
        publishedLabel: "2 days ago",
        imageUrl: "https://images.unsplash.com/photo-1520034475321-cbe63696469a?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Private neon lounge",
      },
    ],
  },
  {
    slug: "ivy-orbit",
    displayName: "Ivy Orbit",
    username: "ivyorbit",
    headline: "Soft-space dreamer",
    bio: "Dreamy AI creator blending orbital aesthetics with intimate journals, ambient visuals, and premium private entries.",
    avatarUrl: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df2?auto=format&fit=crop&w=400&q=80",
    coverUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1400&q=80",
    priceMonthlyCents: 1499,
    currency: "usd",
    category: "Celestial muse",
    highlight: "Soft editorial imagery, subscriber diaries, and intimate station-log storytelling.",
    tags: ["AI creator", "Private journals", "Ambient drops"],
    stats: {
      teaserPosts: 9,
      exclusiveDrops: 21,
      replyWindow: "Replies in ~6h",
    },
    compliance: {
      approvalStatus: "APPROVED",
      verificationStatus: "ACTION_REQUIRED",
      adultContentLabel: "18+ self-attestation gate required",
      reportHref: "/report?target=creator&subject=Ivy%20Orbit&url=%2Fcreators%2Fivy-orbit",
    },
    posts: [
      {
        id: "ivy-public-1",
        title: "Orbital Window",
        caption: "Public teaser from Ivy's latest celestial journal.",
        body: "A soft preview from the station dome before the full subscriber diary drops.",
        visibility: "PUBLIC",
        publishedLabel: "5 days ago",
        imageUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Space station dome",
      },
      {
        id: "ivy-locked-1",
        title: "Private Docking Log",
        caption: "Subscriber-only journal entry with full media set.",
        body: "Extended premium entry from Ivy's private orbital suite.",
        visibility: "SUBSCRIBER_ONLY",
        publishedLabel: "1 day ago",
        imageUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Private orbital suite",
      },
    ],
  },
  {
    slug: "vega-vale",
    displayName: "Vega Vale",
    username: "vegavale",
    headline: "Fantasy voice and velvet lore",
    bio: "An AI fantasy persona focused on teasing story-driven premium content with lush scenes, audio, and subscriber galleries.",
    avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
    coverUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
    priceMonthlyCents: 999,
    currency: "usd",
    category: "Fantasy siren",
    highlight: "Velvet fantasy worlds, premium audio, and a clear tease-to-unlock subscription arc.",
    tags: ["AI creator", "Fantasy roleplay", "Audio drops"],
    stats: {
      teaserPosts: 14,
      exclusiveDrops: 32,
      replyWindow: "Replies in ~3h",
    },
    compliance: {
      approvalStatus: "APPROVED",
      verificationStatus: "SUBMITTED",
      adultContentLabel: "18+ self-attestation gate required",
      reportHref: "/report?target=creator&subject=Vega%20Vale&url=%2Fcreators%2Fvega-vale",
    },
    posts: [
      {
        id: "vega-public-1",
        title: "Velvet Forest Tease",
        caption: "Public teaser before the private fantasy sequence.",
        body: "A moonlit introduction to Vega's newest story arc.",
        visibility: "PUBLIC",
        publishedLabel: "6 days ago",
        imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Moonlit fantasy forest",
      },
      {
        id: "vega-locked-1",
        title: "Moonlit Chamber",
        caption: "Subscriber-only fantasy gallery.",
        body: "Private gallery from Vega's premium story scene.",
        visibility: "SUBSCRIBER_ONLY",
        publishedLabel: "3 days ago",
        imageUrl: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80",
        imageAlt: "Private fantasy chamber",
      },
    ],
  },
];

export const featuredCreators = demoCreators.slice(0, 3);

export function getDemoCreatorBySlug(slug: string) {
  return demoCreators.find((creator) => creator.slug === slug);
}

export function formatPriceMonthly(priceMonthlyCents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(priceMonthlyCents / 100);
}
