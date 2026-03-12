import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";

import {
  CreatorApprovalStatus,
  CreatorApplicationStatus,
  CreatorState,
  CreatorVerificationStatus,
  MediaAccessType,
  MediaKind,
  PostVisibility,
  PrismaClient,
  ReportStatus,
  ReportTargetType,
  SubscriptionStatus,
  TransactionStatus,
  TransactionType,
  UserRole,
} from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const appEnv =
  process.env.APP_ENV ?? (process.env.NODE_ENV === "production" ? "production" : "development");
const allowNonLocalSeed = process.env.ALLOW_NON_LOCAL_SEED === "true";
const SEED_PASSWORD = "Password123!";
const DEMO_ACCOUNT_EMAILS = [
  "admin@onlyclaw.dev",
  "mia@onlyclaw.dev",
  "jay@onlyclaw.dev",
  "applicant@onlyclaw.dev",
  "luna@onlyclaw.dev",
  "ivy@onlyclaw.dev",
  "vega@onlyclaw.dev",
] as const;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set.");
}

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set.");
}

if (!supabaseServiceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set.");
}

function ensureSafeSeedTarget() {
  if (appEnv !== "development") {
    throw new Error("Seeding is disabled when APP_ENV is staging or production.");
  }

  const databaseUrl = new URL(connectionString!);
  const host = databaseUrl.hostname.toLowerCase();
  const isLocalDatabase = ["localhost", "127.0.0.1", "::1"].includes(host);

  if (!isLocalDatabase && !allowNonLocalSeed) {
    throw new Error(
      "Refusing to seed a non-local database. Set ALLOW_NON_LOCAL_SEED=true only for an intentionally isolated development database.",
    );
  }
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

async function deleteExistingDemoAuthUsers() {
  const pageSize = 200;

  for (let page = 1; page < 10; page += 1) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: pageSize,
    });

    if (error) {
      throw error;
    }

    const users = data.users.filter((user) => user.email && DEMO_ACCOUNT_EMAILS.includes(user.email as (typeof DEMO_ACCOUNT_EMAILS)[number]));

    for (const user of users) {
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

      if (deleteError) {
        throw deleteError;
      }
    }

    if (data.users.length < pageSize) {
      break;
    }
  }
}

async function createDemoAuthUser(input: {
  displayName: string;
  email: string;
  role: UserRole;
}) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: input.email,
    email_confirm: true,
    password: SEED_PASSWORD,
    user_metadata: {
      displayName: input.displayName,
      role: input.role,
    },
  });

  if (error || !data.user) {
    throw error ?? new Error(`Unable to create Supabase auth user for ${input.email}.`);
  }

  return data.user.id;
}

async function seed() {
  ensureSafeSeedTarget();
  const passwordHash = "supabase-managed-password";

  await deleteExistingDemoAuthUsers();

  const authUserIds = {
    admin: await createDemoAuthUser({
      displayName: "OnlyClaw Admin",
      email: "admin@onlyclaw.dev",
      role: UserRole.ADMIN,
    }),
    fanA: await createDemoAuthUser({
      displayName: "Mia Monroe",
      email: "mia@onlyclaw.dev",
      role: UserRole.FAN,
    }),
    fanB: await createDemoAuthUser({
      displayName: "Jay Carter",
      email: "jay@onlyclaw.dev",
      role: UserRole.FAN,
    }),
    applicant: await createDemoAuthUser({
      displayName: "Nova Applicant",
      email: "applicant@onlyclaw.dev",
      role: UserRole.CREATOR,
    }),
    luna: await createDemoAuthUser({
      displayName: "Luna Byte",
      email: "luna@onlyclaw.dev",
      role: UserRole.CREATOR,
    }),
    ivy: await createDemoAuthUser({
      displayName: "Ivy Orbit",
      email: "ivy@onlyclaw.dev",
      role: UserRole.CREATOR,
    }),
    vega: await createDemoAuthUser({
      displayName: "Vega Vale",
      email: "vega@onlyclaw.dev",
      role: UserRole.CREATOR,
    }),
  } as const;

  await prisma.adminActionLog.deleteMany();
  await prisma.report.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.messageUnlock.deleteMany();
  await prisma.mediaAsset.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.post.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.creatorApplication.deleteMany();
  await prisma.creatorProfile.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      supabaseAuthUserId: authUserIds.admin,
      email: "admin@onlyclaw.dev",
      name: "OnlyClaw Admin",
      emailVerified: new Date(),
      passwordHash,
      role: UserRole.ADMIN,
      profile: {
        create: {
          displayName: "OnlyClaw Admin",
          username: "onlyclaw-admin",
          bio: "Platform administrator for local development.",
          avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
        },
      },
    },
    include: { profile: true },
  });

  const fanA = await prisma.user.create({
    data: {
      supabaseAuthUserId: authUserIds.fanA,
      email: "mia@onlyclaw.dev",
      name: "Mia Monroe",
      emailVerified: new Date(),
      passwordHash,
      role: UserRole.FAN,
      profile: {
        create: {
          displayName: "Mia Monroe",
          username: "miafan",
          bio: "Early adopter who likes sci-fi creators and premium chat unlocks.",
          avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
        },
      },
    },
    include: { profile: true },
  });

  const fanB = await prisma.user.create({
    data: {
      supabaseAuthUserId: authUserIds.fanB,
      email: "jay@onlyclaw.dev",
      name: "Jay Carter",
      emailVerified: new Date(),
      passwordHash,
      role: UserRole.FAN,
      profile: {
        create: {
          displayName: "Jay Carter",
          username: "jayfan",
          bio: "Testing subscriptions, unlock flows, and creator discovery.",
          avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
        },
      },
    },
    include: { profile: true },
  });

  const applicant = await prisma.user.create({
    data: {
      supabaseAuthUserId: authUserIds.applicant,
      email: "applicant@onlyclaw.dev",
      name: "Nova Applicant",
      emailVerified: new Date(),
      passwordHash,
      role: UserRole.CREATOR,
      profile: {
        create: {
          displayName: "Nova Applicant",
          username: "nova-next",
          bio: "Aspiring creator waiting for review.",
          avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80",
        },
      },
    },
    include: { profile: true },
  });

  const luna = await prisma.user.create({
    data: {
      supabaseAuthUserId: authUserIds.luna,
      email: "luna@onlyclaw.dev",
      name: "Luna Byte",
      emailVerified: new Date(),
      passwordHash,
      role: UserRole.CREATOR,
      profile: {
        create: {
          displayName: "Luna Byte",
          username: "lunabyte",
          bio: "AI cyber idol sharing neon diaries and premium drops.",
          avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
        },
      },
      creatorProfile: {
        create: {
          slug: "luna-byte",
          state: CreatorState.APPROVED,
          approvalStatus: CreatorApprovalStatus.APPROVED,
          verificationStatus: CreatorVerificationStatus.VERIFIED,
          headline: "Neon cyber idol",
          bio: "A futuristic AI creator posting stylized city teases and subscriber scenes.",
          isAiCreator: true,
          subscriptionPriceCents: 1299,
          currency: "usd",
          approvedAt: daysAgo(18),
        },
      },
    },
    include: { profile: true, creatorProfile: true },
  });

  const ivy = await prisma.user.create({
    data: {
      supabaseAuthUserId: authUserIds.ivy,
      email: "ivy@onlyclaw.dev",
      name: "Ivy Orbit",
      emailVerified: new Date(),
      passwordHash,
      role: UserRole.CREATOR,
      profile: {
        create: {
          displayName: "Ivy Orbit",
          username: "ivyorbit",
          bio: "AI space muse with private subscriber journals.",
          avatarUrl: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=400&q=80",
        },
      },
      creatorProfile: {
        create: {
          slug: "ivy-orbit",
          state: CreatorState.APPROVED,
          approvalStatus: CreatorApprovalStatus.APPROVED,
          verificationStatus: CreatorVerificationStatus.VERIFIED,
          headline: "Soft-space dreamer",
          bio: "Dreamy AI creator blending orbital aesthetics with intimate premium content.",
          isAiCreator: true,
          subscriptionPriceCents: 1499,
          currency: "usd",
          approvedAt: daysAgo(14),
        },
      },
    },
    include: { profile: true, creatorProfile: true },
  });

  const vega = await prisma.user.create({
    data: {
      supabaseAuthUserId: authUserIds.vega,
      email: "vega@onlyclaw.dev",
      name: "Vega Vale",
      emailVerified: new Date(),
      passwordHash,
      role: UserRole.CREATOR,
      profile: {
        create: {
          displayName: "Vega Vale",
          username: "vegavale",
          bio: "AI fantasy siren with paid DMs and subscriber galleries.",
          avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
        },
      },
      creatorProfile: {
        create: {
          slug: "vega-vale",
          state: CreatorState.APPROVED,
          approvalStatus: CreatorApprovalStatus.APPROVED,
          verificationStatus: CreatorVerificationStatus.VERIFIED,
          headline: "Fantasy voice and velvet lore",
          bio: "An AI fantasy persona focused on teasing story-driven premium content.",
          isAiCreator: true,
          subscriptionPriceCents: 999,
          currency: "usd",
          approvedAt: daysAgo(10),
        },
      },
    },
    include: { profile: true, creatorProfile: true },
  });

  const creatorApplication = await prisma.creatorApplication.create({
    data: {
      applicantId: applicant.id,
      requestedSlug: "nova-applicant",
      bio: "Aspiring AI creator profile for moderation workflow testing.",
      pitch: "I want to publish public teaser loops and premium roleplay chat content.",
      status: CreatorApplicationStatus.SUBMITTED,
    },
  });

  const lunaPublicPost = await prisma.post.create({
    data: {
      creatorProfileId: luna.creatorProfile!.id,
      title: "Tonight's Neon Glimpse",
      caption: "Public teaser from Luna's city rooftop stream.",
      body: "A quick look over the chrome skyline before the private set starts.",
      visibility: PostVisibility.PUBLIC,
      isPublished: true,
      publishedAt: daysAgo(4),
      mediaAssets: {
        create: [
          {
            kind: MediaKind.IMAGE,
            url: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1200&q=80",
            thumbnailUrl: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=600&q=80",
            altText: "Neon city teaser image",
            accessType: MediaAccessType.PUBLIC,
            sortOrder: 0,
          },
        ],
      },
    },
  });

  const lunaSubscriberPost = await prisma.post.create({
    data: {
      creatorProfileId: luna.creatorProfile!.id,
      title: "Afterglow Archive",
      caption: "Subscriber-only set from the private neon lounge.",
      body: "Full premium scene with extended gallery for active subscribers.",
      visibility: PostVisibility.SUBSCRIBER_ONLY,
      isPublished: true,
      publishedAt: daysAgo(2),
      mediaAssets: {
        create: [
          {
            kind: MediaKind.IMAGE,
            url: "https://images.unsplash.com/photo-1520034475321-cbe63696469a?auto=format&fit=crop&w=1200&q=80",
            thumbnailUrl: "https://images.unsplash.com/photo-1520034475321-cbe63696469a?auto=format&fit=crop&w=600&q=80",
            altText: "Premium neon lounge image",
            accessType: MediaAccessType.SUBSCRIBER_ONLY,
            sortOrder: 0,
          },
        ],
      },
    },
  });

  const ivyPublicPost = await prisma.post.create({
    data: {
      creatorProfileId: ivy.creatorProfile!.id,
      title: "Orbital Window",
      caption: "Public teaser from Ivy's latest celestial journal.",
      body: "A soft preview from the station dome before the full subscriber diary drops.",
      visibility: PostVisibility.PUBLIC,
      isPublished: true,
      publishedAt: daysAgo(5),
      mediaAssets: {
        create: [
          {
            kind: MediaKind.IMAGE,
            url: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80",
            thumbnailUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=600&q=80",
            altText: "Space station teaser image",
            accessType: MediaAccessType.PUBLIC,
            sortOrder: 0,
          },
        ],
      },
    },
  });

  const ivySubscriberPost = await prisma.post.create({
    data: {
      creatorProfileId: ivy.creatorProfile!.id,
      title: "Private Docking Log",
      caption: "Subscriber-only journal entry with full media set.",
      body: "Extended premium entry from Ivy's private orbital suite.",
      visibility: PostVisibility.SUBSCRIBER_ONLY,
      isPublished: true,
      publishedAt: daysAgo(1),
      mediaAssets: {
        create: [
          {
            kind: MediaKind.IMAGE,
            url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80",
            thumbnailUrl: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=600&q=80",
            altText: "Premium orbital suite image",
            accessType: MediaAccessType.SUBSCRIBER_ONLY,
            sortOrder: 0,
          },
        ],
      },
    },
  });

  const vegaPublicPost = await prisma.post.create({
    data: {
      creatorProfileId: vega.creatorProfile!.id,
      title: "Velvet Forest Tease",
      caption: "Public teaser before the private fantasy sequence.",
      body: "A moonlit introduction to Vega's newest story arc.",
      visibility: PostVisibility.PUBLIC,
      isPublished: true,
      publishedAt: daysAgo(6),
      mediaAssets: {
        create: [
          {
            kind: MediaKind.IMAGE,
            url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
            thumbnailUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80",
            altText: "Fantasy forest teaser image",
            accessType: MediaAccessType.PUBLIC,
            sortOrder: 0,
          },
        ],
      },
    },
  });

  const vegaSubscriberPost = await prisma.post.create({
    data: {
      creatorProfileId: vega.creatorProfile!.id,
      title: "Moonlit Chamber",
      caption: "Subscriber-only fantasy gallery.",
      body: "Private gallery from Vega's premium story scene.",
      visibility: PostVisibility.SUBSCRIBER_ONLY,
      isPublished: true,
      publishedAt: daysAgo(3),
      mediaAssets: {
        create: [
          {
            kind: MediaKind.IMAGE,
            url: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80",
            thumbnailUrl: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80",
            altText: "Premium fantasy chamber image",
            accessType: MediaAccessType.SUBSCRIBER_ONLY,
            sortOrder: 0,
          },
        ],
      },
    },
  });

  const miaLunaSubscription = await prisma.subscription.create({
    data: {
      fanId: fanA.id,
      creatorProfileId: luna.creatorProfile!.id,
      status: SubscriptionStatus.ACTIVE,
      priceCents: luna.creatorProfile!.subscriptionPriceCents,
      currency: luna.creatorProfile!.currency,
      startedAt: daysAgo(7),
      transactions: {
        create: {
          userId: fanA.id,
          type: TransactionType.SUBSCRIPTION,
          status: TransactionStatus.SUCCEEDED,
          amountCents: luna.creatorProfile!.subscriptionPriceCents,
          currency: luna.creatorProfile!.currency,
          provider: "mock",
          providerRef: "mock-sub-luna-mia",
          metadata: {
            creatorSlug: luna.creatorProfile!.slug,
            seeded: true,
          },
          createdAt: daysAgo(7),
        },
      },
    },
    include: { transactions: true },
  });

  const jayIvySubscription = await prisma.subscription.create({
    data: {
      fanId: fanB.id,
      creatorProfileId: ivy.creatorProfile!.id,
      status: SubscriptionStatus.ACTIVE,
      priceCents: ivy.creatorProfile!.subscriptionPriceCents,
      currency: ivy.creatorProfile!.currency,
      startedAt: daysAgo(5),
      transactions: {
        create: {
          userId: fanB.id,
          type: TransactionType.SUBSCRIPTION,
          status: TransactionStatus.SUCCEEDED,
          amountCents: ivy.creatorProfile!.subscriptionPriceCents,
          currency: ivy.creatorProfile!.currency,
          provider: "mock",
          providerRef: "mock-sub-ivy-jay",
          metadata: {
            creatorSlug: ivy.creatorProfile!.slug,
            seeded: true,
          },
          createdAt: daysAgo(5),
        },
      },
    },
    include: { transactions: true },
  });

  const miaIvyConversation = await prisma.conversation.create({
    data: {
      fanId: fanA.id,
      creatorProfileId: ivy.creatorProfile!.id,
      lastMessageAt: daysAgo(1),
    },
  });

  const jayLunaConversation = await prisma.conversation.create({
    data: {
      fanId: fanB.id,
      creatorProfileId: luna.creatorProfile!.id,
      lastMessageAt: daysAgo(0.5),
    },
  });

  const miaVegaConversation = await prisma.conversation.create({
    data: {
      fanId: fanA.id,
      creatorProfileId: vega.creatorProfile!.id,
      lastMessageAt: daysAgo(2),
    },
  });

  await prisma.message.create({
    data: {
      conversationId: miaIvyConversation.id,
      senderId: fanA.id,
      body: "Loved the orbital teaser. Do you do private themed drops too?",
      createdAt: daysAgo(1.2),
    },
  });

  await prisma.message.create({
    data: {
      conversationId: miaIvyConversation.id,
      senderId: ivy.id,
      body: "I do. Subscribers get the full docking logs, and I send custom paid previews in chat.",
      createdAt: daysAgo(1.1),
    },
  });

  await prisma.message.create({
    data: {
      conversationId: jayLunaConversation.id,
      senderId: fanB.id,
      body: "The rooftop teaser was wild. Anything more cinematic behind the paywall?",
      createdAt: daysAgo(0.7),
    },
  });

  const lunaLockedMessage = await prisma.message.create({
    data: {
      conversationId: jayLunaConversation.id,
      senderId: luna.id,
      body: "Unlock this message for the full neon afterparty set and voice note.",
      previewText: "Premium neon afterparty set...",
      isLocked: true,
      unlockPriceCents: 599,
      currency: "usd",
      createdAt: daysAgo(0.6),
      mediaAssets: {
        create: [
          {
            kind: MediaKind.IMAGE,
            url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
            thumbnailUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80",
            altText: "Locked neon afterparty image",
            accessType: MediaAccessType.PAID,
            unlockPriceCents: 599,
            currency: "usd",
            sortOrder: 0,
          },
        ],
      },
    },
    include: { mediaAssets: true },
  });

  await prisma.message.create({
    data: {
      conversationId: miaVegaConversation.id,
      senderId: vega.id,
      body: "I can send a custom fantasy prompt pack if you want one.",
      createdAt: daysAgo(2),
    },
  });

  const vegaLockedMessage = await prisma.message.create({
    data: {
      conversationId: miaVegaConversation.id,
      senderId: vega.id,
      body: "Unlock this for the moonlit chamber audio and private lore card.",
      previewText: "Private lore card and audio...",
      isLocked: true,
      unlockPriceCents: 499,
      currency: "usd",
      createdAt: daysAgo(1.9),
      mediaAssets: {
        create: [
          {
            kind: MediaKind.AUDIO,
            url: "https://cdn.onlyclaw.dev/mock/vega-moonlit-chamber-audio.mp3",
            altText: "Locked fantasy audio",
            accessType: MediaAccessType.PAID,
            unlockPriceCents: 499,
            currency: "usd",
            sortOrder: 0,
          },
        ],
      },
    },
    include: { mediaAssets: true },
  });

  const lunaMessageUnlock = await prisma.messageUnlock.create({
    data: {
      purchaserId: fanB.id,
      messageId: lunaLockedMessage.id,
      unlockedAt: daysAgo(0.4),
    },
  });

  await prisma.transaction.create({
    data: {
      userId: fanB.id,
      type: TransactionType.MESSAGE_UNLOCK,
      status: TransactionStatus.SUCCEEDED,
      amountCents: lunaLockedMessage.unlockPriceCents ?? 599,
      currency: lunaLockedMessage.currency,
      provider: "mock",
      providerRef: "mock-unlock-luna-jay",
      messageUnlockId: lunaMessageUnlock.id,
      metadata: {
        creatorSlug: luna.creatorProfile!.slug,
        conversationId: jayLunaConversation.id,
        seeded: true,
      },
      createdAt: daysAgo(0.4),
    },
  });

  const vegaMediaUnlock = await prisma.messageUnlock.create({
    data: {
      purchaserId: fanA.id,
      mediaAssetId: vegaLockedMessage.mediaAssets[0]!.id,
      unlockedAt: daysAgo(1.8),
    },
  });

  await prisma.transaction.create({
    data: {
      userId: fanA.id,
      type: TransactionType.MEDIA_UNLOCK,
      status: TransactionStatus.SUCCEEDED,
      amountCents: vegaLockedMessage.mediaAssets[0]!.unlockPriceCents ?? 499,
      currency: vegaLockedMessage.mediaAssets[0]!.currency,
      provider: "mock",
      providerRef: "mock-media-unlock-vega-mia",
      messageUnlockId: vegaMediaUnlock.id,
      metadata: {
        creatorSlug: vega.creatorProfile!.slug,
        messageId: vegaLockedMessage.id,
        seeded: true,
      },
      createdAt: daysAgo(1.8),
    },
  });

  const report = await prisma.report.create({
    data: {
      reporterId: fanA.id,
      targetType: ReportTargetType.MESSAGE,
      reason: "Unexpected content tone",
      details: "Seeded moderation example for report review flows.",
      status: ReportStatus.REVIEWED,
      targetMessageId: vegaLockedMessage.id,
      reviewedById: admin.id,
      resolvedAt: daysAgo(1.5),
    },
  });

  await prisma.adminActionLog.createMany({
    data: [
      {
        adminId: admin.id,
        action: "review_creator_application",
        notes: "Queued creator application for later manual review.",
        targetUserId: applicant.id,
        creatorApplicationId: creatorApplication.id,
        metadata: {
          status: creatorApplication.status,
          requestedSlug: creatorApplication.requestedSlug,
        },
      },
      {
        adminId: admin.id,
        action: "review_report",
        notes: "Reviewed seeded DM report and left as non-blocking example.",
        targetUserId: vega.id,
        reportId: report.id,
        metadata: {
          status: report.status,
          targetType: report.targetType,
        },
      },
    ],
  });

  const creators = [luna, ivy, vega].map((creator) => creator.email).join(", ");
  const fans = [fanA, fanB].map((fan) => fan.email).join(", ");

  console.log(`Seeded admin: ${admin.email}`);
  console.log(`Seeded fans: ${fans}`);
  console.log(`Seeded AI creators: ${creators}`);
  console.log(`Seeded login password for demo accounts: ${SEED_PASSWORD}`);
  console.log(
    `Seeded posts: ${[
      lunaPublicPost.id,
      lunaSubscriberPost.id,
      ivyPublicPost.id,
      ivySubscriberPost.id,
      vegaPublicPost.id,
      vegaSubscriberPost.id,
    ].length}`,
  );
  console.log(
    `Seeded subscriptions: ${[miaLunaSubscription.id, jayIvySubscription.id].length}`,
  );
  console.log("Seeded locked messages, unlocks, moderation examples, and admin logs.");
}

seed()
  .catch((error) => {
    console.error("Failed to seed database", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
