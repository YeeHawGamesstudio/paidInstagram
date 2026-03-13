import type { CreatorState, ReportStatus, ReportTargetType } from "@/generated/prisma/enums";
import type { UserRole } from "@/lib/auth/roles";
import type {
  CreatorApprovalStatus,
  CreatorVerificationStatus,
  UserAdultAccessStatus,
} from "@/lib/compliance/scaffolding";

export type AdminMetric = {
  label: string;
  value: string;
  detail: string;
};

export type AdminCreatorRecord = {
  id: string;
  displayName: string;
  handle: string;
  state: CreatorState;
  approvalStatus: CreatorApprovalStatus;
  verificationStatus: CreatorVerificationStatus;
  category: string;
  pricingLabel: string;
  subscribers: number;
  reportsOpen: number;
  lastReview: string;
  moderationVisibility: string;
  actionState: string;
};

export type AdminUserRecord = {
  id: string;
  displayName: string;
  handle: string;
  role: UserRole;
  lifecycle: string;
  adultAccessStatus: UserAdultAccessStatus;
  spendLabel: string;
  riskState: "normal" | "watch" | "restricted";
  lastSeen: string;
  actionState: string;
};

export type AdminReportRecord = {
  id: string;
  severity: "low" | "medium" | "high" | "critical";
  status: ReportStatus;
  targetType: ReportTargetType;
  targetLabel: string;
  reason: string;
  reporterLabel: string;
  openedAt: string;
  assignee: string;
  actionState: string;
};

export type AdminReviewItem = {
  id: string;
  queue: "profile" | "post" | "message";
  creatorLabel: string;
  summary: string;
  submittedAt: string;
  flags: string[];
  riskBand: "low" | "medium" | "high";
  actionState: string;
};

export type AdminActionLogEntry = {
  id: string;
  actor: string;
  category: string;
  action: string;
  target: string;
  notes: string;
  when: string;
  hasNotes?: boolean;
  isLowSignal?: boolean;
  groupedCount?: number;
};

export const adminPlatformMetrics: AdminMetric[] = [
  {
    label: "Open reports",
    value: "18",
    detail: "5 need a same-day decision",
  },
  {
    label: "Creator approvals",
    value: "4",
    detail: "2 are blocked on approval or verification follow-up",
  },
  {
    label: "Suspended creators",
    value: "2",
    detail: "Both remain under manual review",
  },
  {
    label: "Audit events",
    value: "26",
    detail: "Recent moderation and compliance actions visible",
  },
];

export const adminCreators: AdminCreatorRecord[] = [
  {
    id: "creator-aurora",
    displayName: "Aurora Vex",
    handle: "@auroravault",
    state: "APPROVED",
    approvalStatus: "APPROVED",
    verificationStatus: "IN_REVIEW",
    category: "AI fantasy roleplay",
    pricingLabel: "$14.99/mo",
    subscribers: 612,
    reportsOpen: 1,
    lastReview: "Approved 2 days ago",
    moderationVisibility: "Public discovery enabled",
    actionState: "Stable account with one low-priority report",
  },
  {
    id: "creator-mina",
    displayName: "Mina Circuit",
    handle: "@minacircuit",
    state: "PENDING",
    approvalStatus: "IN_REVIEW",
    verificationStatus: "SUBMITTED",
    category: "Cyberpunk companion",
    pricingLabel: "$11.99/mo",
    subscribers: 0,
    reportsOpen: 0,
    lastReview: "Submitted 6 hours ago",
    moderationVisibility: "Hidden until final admin approval",
    actionState: "Awaiting final identity and prompt policy signoff",
  },
  {
    id: "creator-ivy",
    displayName: "Ivy Heat",
    handle: "@ivyafterdark",
    state: "SUSPENDED",
    approvalStatus: "SUSPENDED",
    verificationStatus: "ACTION_REQUIRED",
    category: "Premium chat persona",
    pricingLabel: "$19.99/mo",
    subscribers: 228,
    reportsOpen: 4,
    lastReview: "Suspended this morning",
    moderationVisibility: "Discovery blocked and subscriber access under review",
    actionState: "DM upsell complaints escalated to moderation",
  },
  {
    id: "creator-sable",
    displayName: "Sable Echo",
    handle: "@sableecho",
    state: "PENDING",
    approvalStatus: "ACTION_REQUIRED",
    verificationStatus: "NOT_STARTED",
    category: "Luxury girlfriend AI",
    pricingLabel: "$24.99/mo",
    subscribers: 0,
    reportsOpen: 0,
    lastReview: "Submitted yesterday",
    moderationVisibility: "Not listed until policy and pricing edits are complete",
    actionState: "Needs pricing and teaser copy review before approval",
  },
  {
    id: "creator-noir",
    displayName: "Noir Signal",
    handle: "@noirsignal",
    state: "APPROVED",
    approvalStatus: "APPROVED",
    verificationStatus: "VERIFIED",
    category: "Mystery voice AI",
    pricingLabel: "$9.99/mo",
    subscribers: 381,
    reportsOpen: 2,
    lastReview: "Health check 3 days ago",
    moderationVisibility: "Public discovery enabled",
    actionState: "Monitor report cluster for repeat refund claims",
  },
];

export const adminUsers: AdminUserRecord[] = [
  {
    id: "user-lane",
    displayName: "Lane Mercer",
    handle: "@lane",
    role: "FAN",
    lifecycle: "Active subscriber to 3 creators",
    adultAccessStatus: "SELF_ATTESTED",
    spendLabel: "$41.97 / month",
    riskState: "normal",
    lastSeen: "8 minutes ago",
    actionState: "No active restrictions",
  },
  {
    id: "user-piper",
    displayName: "Piper S",
    handle: "@pipers",
    role: "FAN",
    lifecycle: "Chargeback dispute on latest unlock",
    adultAccessStatus: "SELF_ATTESTED",
    spendLabel: "$9.00 disputed",
    riskState: "watch",
    lastSeen: "1 hour ago",
    actionState: "Billing watch applied pending review",
  },
  {
    id: "user-roman",
    displayName: "Roman Vale",
    handle: "@romanvale",
    role: "CREATOR",
    lifecycle: "Creator account linked to active catalog",
    adultAccessStatus: "VERIFIED",
    spendLabel: "Platform payout enabled",
    riskState: "watch",
    lastSeen: "22 minutes ago",
    actionState: "Messaging volume spike under observation",
  },
  {
    id: "user-admin",
    displayName: "Dana Ops",
    handle: "@danaops",
    role: "ADMIN",
    lifecycle: "Internal operations access",
    adultAccessStatus: "VERIFIED",
    spendLabel: "N/A",
    riskState: "normal",
    lastSeen: "Online now",
    actionState: "Last action: resolved creator escalation",
  },
  {
    id: "user-kai",
    displayName: "Kai Rowan",
    handle: "@kairowan",
    role: "FAN",
    lifecycle: "Account restricted after abusive reports",
    adultAccessStatus: "BLOCKED",
    spendLabel: "$0 active spend",
    riskState: "restricted",
    lastSeen: "Yesterday",
    actionState: "Messaging disabled while appeal remains open",
  },
];

export const adminReports: AdminReportRecord[] = [
  {
    id: "report-2081",
    severity: "critical",
    status: "OPEN",
    targetType: "MESSAGE",
    targetLabel: "Paid DM from @ivyafterdark",
    reason: "Non-consensual coercive upsell language reported",
    reporterLabel: "Lane Mercer",
    openedAt: "14 minutes ago",
    assignee: "Unassigned",
    actionState: "Needs moderator review within SLA",
  },
  {
    id: "report-2079",
    severity: "high",
    status: "REVIEWED",
    targetType: "CREATOR_PROFILE",
    targetLabel: "Profile bio for @noirsignal",
    reason: "Age-gating language is too ambiguous",
    reporterLabel: "Trust queue",
    openedAt: "2 hours ago",
    assignee: "Dana Ops",
    actionState: "Bio edit requested from creator",
  },
  {
    id: "report-2076",
    severity: "medium",
    status: "OPEN",
    targetType: "USER",
    targetLabel: "User @kairowan",
    reason: "Repeated spam and harassment in creator inboxes",
    reporterLabel: "Aurora Vex",
    openedAt: "Today",
    assignee: "Risk team",
    actionState: "Temporary DM restriction already applied",
  },
  {
    id: "report-2068",
    severity: "low",
    status: "DISMISSED",
    targetType: "POST",
    targetLabel: "Teaser post from @auroravault",
    reason: "Report did not match policy violation criteria",
    reporterLabel: "Anonymous fan",
    openedAt: "Yesterday",
    assignee: "Dana Ops",
    actionState: "Closed with no enforcement",
  },
];

export const adminReviewQueue: AdminReviewItem[] = [
  {
    id: "review-501",
    queue: "profile",
    creatorLabel: "Mina Circuit",
    summary: "New creator application, cover copy, and pricing setup",
    submittedAt: "6 hours ago",
    flags: ["Identity check pending", "Pricing above starter median"],
    riskBand: "medium",
    actionState: "Ready for final approval after compliance signoff",
  },
  {
    id: "review-498",
    queue: "post",
    creatorLabel: "Sable Echo",
    summary: "Subscriber-only launch post with preview image and welcome CTA",
    submittedAt: "Yesterday",
    flags: ["Teaser copy okay", "Image metadata clean"],
    riskBand: "low",
    actionState: "Can be approved once creator account is approved",
  },
  {
    id: "review-494",
    queue: "message",
    creatorLabel: "Ivy Heat",
    summary: "Locked DM upsell template sent to new subscribers",
    submittedAt: "This morning",
    flags: ["Complaint linked", "Manual language review required"],
    riskBand: "high",
    actionState: "Hold before reuse in automation",
  },
  {
    id: "review-492",
    queue: "post",
    creatorLabel: "Noir Signal",
    summary: "Public teaser post with conversion-heavy copy",
    submittedAt: "2 days ago",
    flags: ["Needs softer CTA", "Safe media preview"],
    riskBand: "medium",
    actionState: "Return to creator with copy edits",
  },
];

export const adminActionLog: AdminActionLogEntry[] = [
  {
    id: "action-1",
    actor: "Dana Ops",
    category: "creator-enforcement",
    action: "Suspended creator",
    target: "@ivyafterdark",
    notes: "Discovery hidden, approval state frozen, and review queue escalated.",
    when: "10 minutes ago",
  },
  {
    id: "action-2",
    actor: "Dana Ops",
    category: "report-triage",
    action: "Marked report reviewed",
    target: "report-2079",
    notes: "Requested clearer age-gating language from the creator profile owner.",
    when: "48 minutes ago",
  },
  {
    id: "action-3",
    actor: "Trust queue",
    category: "risk-controls",
    action: "Applied billing watch",
    target: "@pipers",
    notes: "Chargeback pattern flagged for manual follow-up.",
    when: "2 hours ago",
  },
  {
    id: "action-4",
    actor: "Dana Ops",
    category: "creator-approval",
    action: "Approved creator",
    target: "@auroravault",
    notes: "Profile opened for discovery while verification remains in placeholder review.",
    when: "2 days ago",
  },
];

export function getCreatorStateLabel(state: CreatorState) {
  if (state === "APPROVED") {
    return "Approved";
  }

  if (state === "SUSPENDED") {
    return "Suspended";
  }

  return "Pending";
}

export function getRoleLabel(role: UserRole) {
  if (role === "ADMIN") {
    return "Admin";
  }

  if (role === "CREATOR") {
    return "Creator";
  }

  return "Fan";
}

export function getReportStatusLabel(status: ReportStatus) {
  if (status === "REVIEWED") {
    return "Reviewed";
  }

  if (status === "RESOLVED") {
    return "Resolved";
  }

  if (status === "DISMISSED") {
    return "Dismissed";
  }

  return "Open";
}
