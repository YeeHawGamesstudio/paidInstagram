import "server-only";

import {
  CreatorApprovalStatus,
  CreatorState,
  ReportStatus,
  ReportTargetType,
  SubscriptionStatus,
  type Prisma,
} from "@/generated/prisma/client";
import { recordAdminAction } from "@/lib/admin/audit";
import {
  adminCreators as demoAdminCreators,
  adminReports as demoAdminReports,
  adminReviewQueue as demoAdminReviewQueue,
  adminUsers as demoAdminUsers,
  type AdminCreatorRecord,
  type AdminReportRecord,
  type AdminReviewItem,
  type AdminUserRecord,
} from "@/lib/admin/demo-data";
import { requireRole, requireViewer } from "@/lib/auth/viewer";
import { hasActiveSubscriptionAccess } from "@/lib/billing/state";
import { env } from "@/lib/config/env";
import { formatCurrency, formatDateTimeLabel, formatMonthlyPrice, formatTimeAgo } from "@/lib/formatting";
import { prisma } from "@/lib/prisma/client";
import { RateLimitExceededError, enforceRateLimit } from "@/lib/security/rate-limit";

type ReportSeverity = AdminReportRecord["severity"];
type ReviewRiskBand = AdminReviewItem["riskBand"];

type ParsedReportDetails = {
  reporterNotes?: string;
  subject?: string;
  sourceUrl?: string;
};

type RelatedAuditNote = {
  id: string;
  actor: string;
  action: string;
  notes: string;
  when: string;
};

export type ModerationReportRecord = AdminReportRecord & {
  subject?: string;
  sourceUrl?: string;
  targetUserId?: string;
  targetCreatorProfileId?: string;
  relatedNotes: RelatedAuditNote[];
  canTakeDownPost: boolean;
  canSuspendCreator: boolean;
  canSuspendUser: boolean;
};

export type ModerationReviewQueueItem = AdminReviewItem & {
  reportId: string;
  status: ReportStatus;
  resolutionHref?: string;
  targetUserId?: string;
  targetCreatorProfileId?: string;
  relatedNotes: RelatedAuditNote[];
};

export type ModerationCreatorRecord = AdminCreatorRecord & {
  userId: string;
  slug: string;
  relatedNotes: RelatedAuditNote[];
};

export type ModerationUserRecord = AdminUserRecord & {
  userId: string;
  isActive: boolean;
  relatedNotes: RelatedAuditNote[];
};

type ReportReasonDefinition = {
  value: string;
  label: string;
  description: string;
  severity: ReportSeverity;
};

const reportReasonDefinitions: readonly ReportReasonDefinition[] = [
  {
    value: "HARASSMENT_OR_COERCION",
    label: "Harassment or coercive sexual content",
    description: "Threats, coercion, blackmail, or abusive sexual pressure.",
    severity: "critical",
  },
  {
    value: "UNDERAGE_OR_AGE_CONCERN",
    label: "Possible underage or age-gating issue",
    description: "Age concern, minor safety issue, or missing age restriction.",
    severity: "critical",
  },
  {
    value: "NON_CONSENSUAL_OR_EXPLOITATIVE",
    label: "Non-consensual or exploitative content",
    description: "Content that appears exploitative or violates consent standards.",
    severity: "critical",
  },
  {
    value: "SPAM_OR_SCAM",
    label: "Spam, scam, or deceptive monetization",
    description: "Repeated spam, fraud, fake urgency, or deceptive upsell behavior.",
    severity: "high",
  },
  {
    value: "IMPERSONATION_OR_FRAUD",
    label: "Impersonation or account fraud",
    description: "Pretending to be another person, brand, or creator.",
    severity: "high",
  },
  {
    value: "POLICY_OR_ADULT_CONTENT_VIOLATION",
    label: "Policy or adult-content violation",
    description: "Content appears to violate platform policy or adult-content rules.",
    severity: "medium",
  },
  {
    value: "OTHER",
    label: "Other moderation concern",
    description: "Something feels unsafe or non-compliant but does not fit above.",
    severity: "low",
  },
] as const;

const reportTargetAliases: Record<string, ReportTargetType> = {
  user: ReportTargetType.USER,
  creator: ReportTargetType.CREATOR_PROFILE,
  creator_profile: ReportTargetType.CREATOR_PROFILE,
  post: ReportTargetType.POST,
  message: ReportTargetType.MESSAGE,
  USER: ReportTargetType.USER,
  CREATOR_PROFILE: ReportTargetType.CREATOR_PROFILE,
  POST: ReportTargetType.POST,
  MESSAGE: ReportTargetType.MESSAGE,
};

const targetTypeLabel: Record<ReportTargetType, string> = {
  [ReportTargetType.USER]: "User",
  [ReportTargetType.CREATOR_PROFILE]: "Creator profile",
  [ReportTargetType.POST]: "Content post",
  [ReportTargetType.MESSAGE]: "Message",
};

function getDisplayName(user: {
  email: string;
  profile?: {
    displayName: string;
    username: string | null;
  } | null;
}) {
  return user.profile?.displayName ?? user.profile?.username ?? user.email;
}

function getHandle(username: string | null | undefined) {
  return username ? `@${username}` : "@unknown";
}

function buildStructuredDetails(input: ParsedReportDetails) {
  const sections: string[] = [];

  if (input.reporterNotes) {
    sections.push(`[Reporter notes]\n${input.reporterNotes.trim()}`);
  }

  const contextLines: string[] = [];

  if (input.subject) {
    contextLines.push(`Subject: ${input.subject.trim()}`);
  }

  if (input.sourceUrl) {
    contextLines.push(`Source URL: ${input.sourceUrl.trim()}`);
  }

  if (contextLines.length > 0) {
    sections.push(`[Context]\n${contextLines.join("\n")}`);
  }

  return sections.join("\n\n") || null;
}

function parseStructuredDetails(details: string | null | undefined): ParsedReportDetails {
  if (!details) {
    return {};
  }

  const reporterNotesMatch = details.match(/\[Reporter notes\]\n([\s\S]*?)(?:\n\n\[Context\]|\s*$)/);
  const contextMatch = details.match(/\[Context\]\n([\s\S]*)$/);
  const parsed: ParsedReportDetails = {};

  if (reporterNotesMatch?.[1]?.trim()) {
    parsed.reporterNotes = reporterNotesMatch[1].trim();
  }

  if (contextMatch?.[1]) {
    for (const line of contextMatch[1].split("\n")) {
      const [rawKey, ...rawValue] = line.split(":");
      const key = rawKey?.trim().toLowerCase();
      const value = rawValue.join(":").trim();

      if (!value) {
        continue;
      }

      if (key === "subject") {
        parsed.subject = value;
      }

      if (key === "source url") {
        parsed.sourceUrl = value;
      }
    }
  }

  if (!parsed.reporterNotes && !parsed.subject && !parsed.sourceUrl) {
    parsed.reporterNotes = details.trim();
  }

  return parsed;
}

function resolveReportReason(value: string) {
  return (
    reportReasonDefinitions.find((entry) => entry.value === value) ??
    reportReasonDefinitions.find((entry) => entry.label === value) ??
    reportReasonDefinitions[reportReasonDefinitions.length - 1]
  );
}

function resolveReportSeverity(reason: string): ReportSeverity {
  return resolveReportReason(reason).severity;
}

function getAuditActorLabel(entry: {
  admin: {
    email: string;
    profile?: {
      displayName: string;
      username: string | null;
    } | null;
  };
}) {
  return getDisplayName(entry.admin);
}

function normalizeNotes(notes: FormDataEntryValue | string | null | undefined) {
  if (typeof notes !== "string") {
    return undefined;
  }

  const trimmed = notes.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeOptionalField(value: FormDataEntryValue | string | null | undefined) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export function getReportReasonOptions() {
  return [...reportReasonDefinitions];
}

export function normalizeReportTargetType(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return reportTargetAliases[value] ?? null;
}

export function getReportTargetTypeLabel(targetType: ReportTargetType) {
  return targetTypeLabel[targetType];
}

async function resolveTargetRelations(input: {
  targetType: ReportTargetType;
  targetUserId?: string;
  targetCreatorProfileId?: string;
  targetPostId?: string;
  targetMessageId?: string;
}) {
  if (input.targetType === ReportTargetType.USER && input.targetUserId) {
    const targetUser = await prisma.user.findUnique({
      where: {
        id: input.targetUserId,
      },
      include: {
        profile: true,
      },
    });

    return {
      targetUserId: targetUser?.id,
      targetCreatorProfileId: undefined,
      targetPostId: undefined,
      targetMessageId: undefined,
      subject: targetUser ? getDisplayName(targetUser) : undefined,
    };
  }

  if (input.targetType === ReportTargetType.CREATOR_PROFILE && input.targetCreatorProfileId) {
    const creator = await prisma.creatorProfile.findUnique({
      where: {
        id: input.targetCreatorProfileId,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    return {
      targetUserId: creator?.userId,
      targetCreatorProfileId: creator?.id,
      targetPostId: undefined,
      targetMessageId: undefined,
      subject: creator?.user.profile ? getDisplayName(creator.user) : undefined,
    };
  }

  if (input.targetType === ReportTargetType.POST && input.targetPostId) {
    const post = await prisma.post.findUnique({
      where: {
        id: input.targetPostId,
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
    });

    return {
      targetUserId: post?.creatorProfile.userId,
      targetCreatorProfileId: post?.creatorProfileId,
      targetPostId: post?.id,
      targetMessageId: undefined,
      subject: post?.title ?? post?.creatorProfile.user.profile?.displayName ?? undefined,
    };
  }

  if (input.targetType === ReportTargetType.MESSAGE && input.targetMessageId) {
    const message = await prisma.message.findUnique({
      where: {
        id: input.targetMessageId,
      },
      include: {
        sender: {
          include: {
            profile: true,
          },
        },
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
    });

    return {
      targetUserId: message?.senderId,
      targetCreatorProfileId: message?.conversation.creatorProfileId,
      targetPostId: undefined,
      targetMessageId: message?.id,
      subject:
        message?.conversation.creatorProfile.user.profile?.displayName
          ? `DM in ${message.conversation.creatorProfile.user.profile.displayName}`
          : undefined,
    };
  }

  return {
    targetUserId: undefined,
    targetCreatorProfileId: undefined,
    targetPostId: undefined,
    targetMessageId: undefined,
    subject: undefined,
  };
}

function buildReportTargetLabel(
  report: Prisma.ReportGetPayload<{
    include: {
      targetUser: { include: { profile: true } };
      targetCreatorProfile: { include: { user: { include: { profile: true } } } };
      targetPost: { include: { creatorProfile: { include: { user: { include: { profile: true } } } } } };
      targetMessage: {
        include: {
          sender: { include: { profile: true } };
          conversation: { include: { creatorProfile: { include: { user: { include: { profile: true } } } } } };
        };
      };
    };
  }>,
  parsedDetails: ParsedReportDetails,
) {
  if (report.targetUser) {
    return getDisplayName(report.targetUser);
  }

  if (report.targetCreatorProfile?.user.profile) {
    return `${report.targetCreatorProfile.user.profile.displayName} (${getHandle(report.targetCreatorProfile.user.profile.username)})`;
  }

  if (report.targetPost) {
    const creatorName = report.targetPost.creatorProfile.user.profile?.displayName ?? "creator";
    return `${report.targetPost.title ?? "Untitled post"} from ${creatorName}`;
  }

  if (report.targetMessage) {
    const creatorName = report.targetMessage.conversation.creatorProfile.user.profile?.displayName ?? "creator";
    return `Message in ${creatorName} conversation`;
  }

  return parsedDetails.subject ?? `${getReportTargetTypeLabel(report.targetType)} report`;
}

function buildReportActionState(
  report: Prisma.ReportGetPayload<{
    include: {
      reviewedBy: { include: { profile: true } };
    };
  }>,
  latestNote: RelatedAuditNote | undefined,
  severity: ReportSeverity,
) {
  if (report.status === ReportStatus.RESOLVED) {
    return latestNote?.action ? `${latestNote.action}. ${latestNote.notes}` : "Case resolved.";
  }

  if (report.status === ReportStatus.DISMISSED) {
    return latestNote?.notes ?? "Closed with no enforcement.";
  }

  if (report.status === ReportStatus.REVIEWED) {
    const reviewer = report.reviewedBy ? getDisplayName(report.reviewedBy) : "moderation";
    return latestNote?.notes ?? `Reviewed by ${reviewer}. Follow-up still pending.`;
  }

  if (severity === "critical") {
    return "Needs moderator review within same-day SLA.";
  }

  if (severity === "high") {
    return "Requires manual moderation review soon.";
  }

  return "Awaiting first moderator decision.";
}

function mapAuditNotes(
  actionLogs: Array<
    Prisma.AdminActionLogGetPayload<{
      include: {
        admin: {
          include: {
            profile: true;
          };
        };
      };
    }>
  >,
) {
  return actionLogs.map((entry) => ({
    id: entry.id,
    actor: getAuditActorLabel(entry),
    action: entry.action,
    notes: entry.notes ?? "No notes recorded.",
    when: formatTimeAgo(entry.createdAt),
  }));
}

export async function createModerationReport(input: {
  targetType: ReportTargetType;
  reason: string;
  reporterNotes?: string;
  subject?: string;
  sourceUrl?: string;
  targetUserId?: string;
  targetCreatorProfileId?: string;
  targetPostId?: string;
  targetMessageId?: string;
}) {
  const viewer = await requireViewer();

  const reporterNotes = normalizeOptionalField(input.reporterNotes);

  if (!reporterNotes || reporterNotes.length < 10) {
    throw new Error("Add a short description so moderators can understand the issue.");
  }

  enforceRateLimit({
    key: `moderation-report:${viewer.id}`,
    limit: 5,
    windowMs: 1000 * 60 * 60,
    message: "You have submitted several reports recently. Please wait before filing another.",
  });

  const reasonDefinition = resolveReportReason(input.reason);
  const resolvedTargets = await resolveTargetRelations(input);

  return prisma.report.create({
    data: {
      reporterId: viewer.id,
      targetType: input.targetType,
      reason: reasonDefinition.label,
      details: buildStructuredDetails({
        reporterNotes,
        subject: normalizeOptionalField(input.subject) ?? resolvedTargets.subject,
        sourceUrl: normalizeOptionalField(input.sourceUrl),
      }),
      targetUserId: resolvedTargets.targetUserId ?? normalizeOptionalField(input.targetUserId),
      targetCreatorProfileId:
        resolvedTargets.targetCreatorProfileId ?? normalizeOptionalField(input.targetCreatorProfileId),
      targetPostId: resolvedTargets.targetPostId ?? normalizeOptionalField(input.targetPostId),
      targetMessageId: resolvedTargets.targetMessageId ?? normalizeOptionalField(input.targetMessageId),
    },
  });
}

export async function listAdminModerationReports(): Promise<ModerationReportRecord[]> {
  try {
    await requireRole("ADMIN");

    const reports = await prisma.report.findMany({
      include: {
        reporter: {
          include: {
            profile: true,
          },
        },
        reviewedBy: {
          include: {
            profile: true,
          },
        },
        targetUser: {
          include: {
            profile: true,
          },
        },
        targetCreatorProfile: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
        targetPost: {
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
        targetMessage: {
          include: {
            sender: {
              include: {
                profile: true,
              },
            },
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
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });

    const reportIds = reports.map((report) => report.id);
    const actionLogs = reportIds.length
      ? await prisma.adminActionLog.findMany({
          where: {
            reportId: {
              in: reportIds,
            },
          },
          include: {
            admin: {
              include: {
                profile: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        })
      : [];

    const logsByReportId = new Map<string, ReturnType<typeof mapAuditNotes>>();

    for (const report of reports) {
      const matchingLogs = actionLogs.filter((entry) => entry.reportId === report.id);
      logsByReportId.set(report.id, mapAuditNotes(matchingLogs));
    }

    return reports.map((report) => {
      const parsedDetails = parseStructuredDetails(report.details);
      const severity = resolveReportSeverity(report.reason);
      const relatedNotes = logsByReportId.get(report.id) ?? [];

      return {
        id: report.id,
        severity,
        status: report.status,
        targetType: report.targetType,
        targetLabel: buildReportTargetLabel(report, parsedDetails),
        reason: report.reason,
        reporterLabel: getDisplayName(report.reporter),
        openedAt: formatTimeAgo(report.createdAt),
        assignee: report.reviewedBy ? getDisplayName(report.reviewedBy) : "Unassigned",
        actionState: buildReportActionState(report, relatedNotes[0], severity),
        subject: parsedDetails.subject,
        sourceUrl: parsedDetails.sourceUrl,
        targetUserId:
          report.targetUserId ??
          report.targetMessage?.senderId ??
          report.targetCreatorProfile?.userId ??
          report.targetPost?.creatorProfile.userId ??
          undefined,
        targetCreatorProfileId:
          report.targetCreatorProfileId ??
          report.targetPost?.creatorProfileId ??
          report.targetMessage?.conversation.creatorProfileId ??
          undefined,
        relatedNotes,
        canTakeDownPost: Boolean(report.targetPostId),
        canSuspendCreator: Boolean(
          report.targetCreatorProfileId ??
            report.targetPost?.creatorProfileId ??
            report.targetMessage?.conversation.creatorProfileId,
        ),
        canSuspendUser: Boolean(
          report.targetUserId ??
            report.targetMessage?.senderId ??
            report.targetCreatorProfile?.userId ??
            report.targetPost?.creatorProfile.userId,
        ),
      };
    });
  } catch (error) {
    if (!env.allowDemoDataFallback) {
      throw error;
    }

    return demoAdminReports.map((report) => ({
      ...report,
      relatedNotes: [],
      canTakeDownPost: report.targetType === ReportTargetType.POST,
      canSuspendCreator: report.targetType !== ReportTargetType.USER,
      canSuspendUser: true,
    }));
  }
}

export async function listAdminModerationReviewQueue(): Promise<ModerationReviewQueueItem[]> {
  try {
    const reports = await listAdminModerationReports();

    return reports
      .filter((report) => report.targetType !== ReportTargetType.USER)
      .map((report) => {
        const queue: AdminReviewItem["queue"] =
          report.targetType === ReportTargetType.MESSAGE
            ? "message"
            : report.targetType === ReportTargetType.POST
              ? "post"
              : "profile";
        const riskBand: ReviewRiskBand =
          report.severity === "critical" || report.severity === "high"
            ? "high"
            : report.severity === "medium"
              ? "medium"
              : "low";

        return {
          reportId: report.id,
          id: `review-${report.id}`,
          queue,
          creatorLabel: report.targetLabel,
          summary: report.reason,
          submittedAt: report.openedAt,
          flags: [
            `${report.severity} severity`,
            report.subject ? `subject: ${report.subject}` : `${getReportTargetTypeLabel(report.targetType)} target`,
          ],
          riskBand,
          actionState: report.actionState,
          status: report.status,
          resolutionHref: report.sourceUrl,
          targetUserId: report.targetUserId,
          targetCreatorProfileId: report.targetCreatorProfileId,
          relatedNotes: report.relatedNotes,
        };
      })
      .sort((left, right) => {
        const riskOrder: Record<ReviewRiskBand, number> = { high: 0, medium: 1, low: 2 };
        return riskOrder[left.riskBand] - riskOrder[right.riskBand];
      });
  } catch (error) {
    if (!env.allowDemoDataFallback) {
      throw error;
    }

    return demoAdminReviewQueue.map((item) => ({
      ...item,
      reportId: item.id,
      status: ReportStatus.OPEN,
      resolutionHref: undefined,
      targetUserId: undefined,
      targetCreatorProfileId: undefined,
      relatedNotes: [],
    }));
  }
}

export async function listAdminModerationCreators(): Promise<ModerationCreatorRecord[]> {
  try {
    await requireRole("ADMIN");

    const creators = await prisma.creatorProfile.findMany({
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        subscriptions: true,
        reports: {
          where: {
            status: ReportStatus.OPEN,
          },
        },
      },
      orderBy: [{ state: "asc" }, { updatedAt: "desc" }],
    });

    const actionLogs = creators.length
      ? await prisma.adminActionLog.findMany({
          where: {
            targetUserId: {
              in: creators.map((creator) => creator.userId),
            },
          },
          include: {
            admin: {
              include: {
                profile: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        })
      : [];

    return creators
      .filter((creator) => creator.user.profile)
      .map((creator) => {
        const relatedNotes = mapAuditNotes(actionLogs.filter((entry) => entry.targetUserId === creator.userId));
        const activeSubscribers = creator.subscriptions.filter(
          (subscription) =>
            subscription.status === SubscriptionStatus.ACTIVE && hasActiveSubscriptionAccess(subscription),
        ).length;

        return {
          id: creator.id,
          userId: creator.userId,
          slug: creator.slug,
          displayName: creator.user.profile!.displayName,
          handle: getHandle(creator.user.profile!.username),
          state: creator.state,
          approvalStatus: creator.approvalStatus,
          verificationStatus: creator.verificationStatus,
          category: creator.headline ?? "Premium creator",
          pricingLabel: formatMonthlyPrice(creator.subscriptionPriceCents, creator.currency),
          subscribers: activeSubscribers,
          reportsOpen: creator.reports.length,
          lastReview: creator.suspendedAt
            ? `Suspended ${formatTimeAgo(creator.suspendedAt)}`
            : creator.approvedAt
              ? `Approved ${formatTimeAgo(creator.approvedAt)}`
              : `Updated ${formatTimeAgo(creator.updatedAt)}`,
          moderationVisibility:
            creator.state === CreatorState.SUSPENDED
              ? "Discovery hidden and premium catalog should stay unavailable while the case is open."
              : creator.state === CreatorState.APPROVED
                ? "Visible in public discovery and eligible for subscriber conversion."
                : "Hidden from public discovery until moderation approval is complete.",
          actionState:
            relatedNotes[0]?.notes ??
            (creator.state === CreatorState.SUSPENDED
              ? "Suspension remains active until a moderator restores the creator."
              : creator.state === CreatorState.APPROVED
                ? "Creator is in a live state with moderation monitoring."
                : "Awaiting admin approval or policy fixes."),
          relatedNotes,
        } satisfies ModerationCreatorRecord;
      });
  } catch (error) {
    if (!env.allowDemoDataFallback) {
      throw error;
    }

    return demoAdminCreators.map((creator) => ({
      ...creator,
      userId: creator.id,
      slug: creator.id,
      relatedNotes: [],
    }));
  }
}

export async function listAdminModerationUsers(): Promise<ModerationUserRecord[]> {
  try {
    await requireRole("ADMIN");

    const users = await prisma.user.findMany({
      include: {
        profile: true,
        creatorProfile: true,
        reportsReceived: {
          where: {
            status: ReportStatus.OPEN,
          },
        },
        transactions: true,
      },
      orderBy: [{ isActive: "asc" }, { updatedAt: "desc" }],
    });

    const actionLogs = users.length
      ? await prisma.adminActionLog.findMany({
          where: {
            targetUserId: {
              in: users.map((user) => user.id),
            },
          },
          include: {
            admin: {
              include: {
                profile: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        })
      : [];

    return users.map((user) => {
      const relatedNotes = mapAuditNotes(actionLogs.filter((entry) => entry.targetUserId === user.id));
      const totalSpendCents = user.transactions.reduce((sum, transaction) => sum + transaction.amountCents, 0);
      const openReports = user.reportsReceived.length;
      const riskState = !user.isActive ? "restricted" : openReports > 0 || relatedNotes.length > 0 ? "watch" : "normal";

      return {
        id: user.id,
        userId: user.id,
        isActive: user.isActive,
        displayName: user.profile?.displayName ?? user.email,
        handle: getHandle(user.profile?.username),
        role: user.role,
        lifecycle: !user.isActive
          ? "Sign-in disabled pending moderation resolution"
          : user.role === "CREATOR" && user.creatorProfile
            ? `Creator account linked to ${user.creatorProfile.slug}`
            : "Account active on platform",
        adultAccessStatus: user.adultAccessStatus,
        spendLabel:
          user.role === "FAN"
            ? totalSpendCents > 0
              ? `${formatCurrency(totalSpendCents, "usd")} lifetime receipts tracked`
              : "No successful receipts recorded yet"
            : "Creator payouts and cash-out review are separate controls",
        riskState,
        lastSeen: formatTimeAgo(user.updatedAt),
        actionState:
          relatedNotes[0]?.notes ??
          (!user.isActive
            ? "Account access is disabled until a moderator restores it."
            : openReports > 0
              ? `${openReports} open report${openReports === 1 ? "" : "s"} need follow-up.`
              : "No active moderation controls."),
        relatedNotes,
      } satisfies ModerationUserRecord;
    });
  } catch (error) {
    if (!env.allowDemoDataFallback) {
      throw error;
    }

    return demoAdminUsers.map((user) => ({
      ...user,
      userId: user.id,
      isActive: user.riskState !== "restricted",
      relatedNotes: [],
    }));
  }
}

async function getAdminActor() {
  return requireRole("ADMIN");
}

export async function updateModerationReportStatus(input: {
  reportId: string;
  status: Extract<ReportStatus, "REVIEWED" | "RESOLVED" | "DISMISSED">;
  notes?: string;
}) {
  const admin = await getAdminActor();

  const report = await prisma.report.findUnique({
    where: {
      id: input.reportId,
    },
    include: {
      targetCreatorProfile: true,
      targetPost: {
        include: {
          creatorProfile: true,
        },
      },
      targetMessage: {
        include: {
          conversation: true,
        },
      },
    },
  });

  if (!report) {
    throw new Error("Report not found.");
  }

  await prisma.report.update({
    where: {
      id: report.id,
    },
    data: {
      status: input.status,
      reviewedById: admin.id,
      resolvedAt: input.status === ReportStatus.REVIEWED ? null : new Date(),
    },
  });

  await recordAdminAction({
    action:
      input.status === ReportStatus.REVIEWED
        ? "Marked report reviewed"
        : input.status === ReportStatus.RESOLVED
          ? "Resolved report"
          : "Dismissed report",
    notes: normalizeNotes(input.notes),
    reportId: report.id,
    targetUserId: report.targetUserId ?? report.targetCreatorProfile?.userId ?? report.targetPost?.creatorProfile.userId,
    metadata: {
      category: "report-triage",
      targetType: report.targetType,
      status: input.status,
    },
  });

  return {
    creatorSlug: report.targetCreatorProfile?.slug ?? report.targetPost?.creatorProfile.slug,
  };
}

export async function takeDownPostFromReport(input: {
  reportId: string;
  notes?: string;
}) {
  const admin = await getAdminActor();

  const report = await prisma.report.findUnique({
    where: {
      id: input.reportId,
    },
    include: {
      targetPost: {
        include: {
          creatorProfile: true,
        },
      },
    },
  });

  if (!report?.targetPost) {
    throw new Error("This report does not point to a post that can be taken down.");
  }

  await prisma.$transaction([
    prisma.post.update({
      where: {
        id: report.targetPost.id,
      },
      data: {
        isPublished: false,
      },
    }),
    prisma.report.update({
      where: {
        id: report.id,
      },
      data: {
        status: ReportStatus.RESOLVED,
        reviewedById: admin.id,
        resolvedAt: new Date(),
      },
    }),
  ]);

  await recordAdminAction({
    action: "Took down post",
    notes: normalizeNotes(input.notes) ?? "Content removed from public visibility.",
    reportId: report.id,
    targetUserId: report.targetPost.creatorProfile.userId,
    metadata: {
      category: "content-takedown",
      targetType: "POST",
      targetPostId: report.targetPost.id,
    },
  });

  return {
    creatorSlug: report.targetPost.creatorProfile.slug,
  };
}

export async function updateCreatorModerationState(input: {
  creatorProfileId: string;
  action: "APPROVE" | "SUSPEND" | "RESTORE";
  notes?: string;
  reportId?: string;
}) {
  const admin = await getAdminActor();

  const creator = await prisma.creatorProfile.findUnique({
    where: {
      id: input.creatorProfileId,
    },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
    },
  });

  if (!creator) {
    throw new Error("Creator not found.");
  }

  const data: Prisma.CreatorProfileUpdateInput =
    input.action === "APPROVE"
      ? {
          state: CreatorState.APPROVED,
          approvalStatus: CreatorApprovalStatus.APPROVED,
          approvedAt: creator.approvedAt ?? new Date(),
          suspendedAt: null,
        }
      : input.action === "SUSPEND"
        ? {
            state: CreatorState.SUSPENDED,
            approvalStatus: CreatorApprovalStatus.SUSPENDED,
            suspendedAt: new Date(),
          }
        : {
            state: CreatorState.APPROVED,
            approvalStatus: CreatorApprovalStatus.APPROVED,
            suspendedAt: null,
            approvedAt: creator.approvedAt ?? new Date(),
          };

  await prisma.creatorProfile.update({
    where: {
      id: creator.id,
    },
    data,
  });

  if (input.reportId) {
    await prisma.report.update({
      where: {
        id: input.reportId,
      },
      data: {
        status: ReportStatus.RESOLVED,
        reviewedById: admin.id,
        resolvedAt: new Date(),
      },
    });
  }

  await recordAdminAction({
    action:
      input.action === "APPROVE"
        ? "Approved creator"
        : input.action === "SUSPEND"
          ? "Suspended creator"
          : "Restored creator",
    notes: normalizeNotes(input.notes),
    reportId: input.reportId,
    targetUserId: creator.userId,
    metadata: {
      category: input.action === "APPROVE" ? "creator-approval" : "creator-enforcement",
      creatorProfileId: creator.id,
      creatorSlug: creator.slug,
    },
  });

  return {
    creatorSlug: creator.slug,
  };
}

export async function updateUserModerationState(input: {
  userId: string;
  action: "SUSPEND" | "RESTORE";
  notes?: string;
  reportId?: string;
}) {
  const admin = await getAdminActor();

  const user = await prisma.user.findUnique({
    where: {
      id: input.userId,
    },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      isActive: input.action !== "SUSPEND",
    },
  });

  if (input.reportId) {
    await prisma.report.update({
      where: {
        id: input.reportId,
      },
      data: {
        status: ReportStatus.RESOLVED,
        reviewedById: admin.id,
        resolvedAt: new Date(),
      },
    });
  }

  await recordAdminAction({
    action: input.action === "SUSPEND" ? "Suspended user" : "Restored user",
    notes: normalizeNotes(input.notes),
    reportId: input.reportId,
    targetUserId: user.id,
    metadata: {
      category: "user-enforcement",
      isActive: input.action !== "SUSPEND",
    },
  });
}

export function getModerationActionErrorMessage(error: unknown) {
  if (error instanceof RateLimitExceededError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to complete that moderation action right now.";
}

export function buildReportReturnUrl(input: {
  target?: string;
  subject?: string;
  url?: string;
  targetUserId?: string;
  targetCreatorProfileId?: string;
  targetPostId?: string;
  targetMessageId?: string;
  submitted?: string;
  error?: string;
}) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(input)) {
    if (value) {
      params.set(key, value);
    }
  }

  const query = params.toString();
  return query ? `/report?${query}` : "/report";
}

export function getReportStatusLabel(status: ReportStatus) {
  if (status === ReportStatus.REVIEWED) {
    return "Reviewed";
  }

  if (status === ReportStatus.RESOLVED) {
    return "Resolved";
  }

  if (status === ReportStatus.DISMISSED) {
    return "Dismissed";
  }

  return "Open";
}

export function getReviewQueueCountByRisk(items: ModerationReviewQueueItem[], riskBand: ReviewRiskBand) {
  return items.filter((item) => item.riskBand === riskBand).length;
}
