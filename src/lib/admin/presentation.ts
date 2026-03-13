import type {
  AdminActionLogEntry,
  AdminCreatorRecord,
  AdminReportRecord,
  AdminReviewItem,
  AdminUserRecord,
} from "@/lib/admin/demo-data";
import type { BadgeTone } from "@/lib/ui/badge";

export function getAdminCreatorStateTone(state: AdminCreatorRecord["state"]): BadgeTone {
  if (state === "APPROVED") {
    return "success";
  }

  if (state === "SUSPENDED") {
    return "danger";
  }

  return "warning";
}

export function getAdminCreatorApprovalTone(status: AdminCreatorRecord["approvalStatus"]): BadgeTone {
  if (status === "APPROVED") {
    return "success";
  }

  if (status === "ACTION_REQUIRED") {
    return "warning";
  }

  if (status === "REJECTED" || status === "SUSPENDED") {
    return "danger";
  }

  return "info";
}

export function getAdminCreatorApprovalBadgeLabel(status: AdminCreatorRecord["approvalStatus"]) {
  if (status === "APPROVED") {
    return "Profile approved";
  }

  if (status === "ACTION_REQUIRED") {
    return "Profile needs changes";
  }

  if (status === "REJECTED") {
    return "Profile rejected";
  }

  if (status === "SUSPENDED") {
    return "Profile suspended";
  }

  if (status === "IN_REVIEW") {
    return "Profile in review";
  }

  if (status === "SUBMITTED") {
    return "Profile submitted";
  }

  return "Profile draft";
}

export function getAdminCreatorVerificationTone(status: AdminCreatorRecord["verificationStatus"]): BadgeTone {
  if (status === "VERIFIED") {
    return "success";
  }

  if (status === "ACTION_REQUIRED" || status === "EXPIRED") {
    return "warning";
  }

  if (status === "REJECTED") {
    return "danger";
  }

  return "info";
}

export function getAdminCreatorVerificationBadgeLabel(status: AdminCreatorRecord["verificationStatus"]) {
  if (status === "VERIFIED") {
    return "ID verified";
  }

  if (status === "ACTION_REQUIRED") {
    return "ID needs update";
  }

  if (status === "REJECTED") {
    return "ID rejected";
  }

  if (status === "EXPIRED") {
    return "ID expired";
  }

  if (status === "IN_REVIEW") {
    return "ID in review";
  }

  if (status === "SUBMITTED") {
    return "ID submitted";
  }

  return "ID not started";
}

export function getAdminReportStatusTone(status: AdminReportRecord["status"]): BadgeTone {
  if (status === "REVIEWED") {
    return "info";
  }

  if (status === "DISMISSED" || status === "RESOLVED") {
    return "success";
  }

  return "danger";
}

export function getAdminReportSeverityTone(severity: AdminReportRecord["severity"]): BadgeTone {
  if (severity === "critical") {
    return "danger";
  }

  if (severity === "high") {
    return "danger";
  }

  if (severity === "medium") {
    return "warning";
  }

  return "info";
}

export function getAdminReportSeverityLabel(severity: AdminReportRecord["severity"]) {
  if (severity === "critical") {
    return "Critical";
  }

  if (severity === "high") {
    return "High";
  }

  if (severity === "medium") {
    return "Medium";
  }

  return "Low";
}

export function getAdminReportTargetLabel(targetType: AdminReportRecord["targetType"]) {
  if (targetType === "MESSAGE") {
    return "Message";
  }

  if (targetType === "POST") {
    return "Post";
  }

  if (targetType === "CREATOR_PROFILE") {
    return "Profile";
  }

  return "User";
}

export function getAdminUserRiskTone(riskState: AdminUserRecord["riskState"]): BadgeTone {
  if (riskState === "restricted") {
    return "danger";
  }

  if (riskState === "watch") {
    return "warning";
  }

  return "success";
}

export function getAdminUserAdultAccessTone(status: AdminUserRecord["adultAccessStatus"]): BadgeTone {
  if (status === "VERIFIED") {
    return "success";
  }

  if (status === "BLOCKED") {
    return "danger";
  }

  if (status === "SELF_ATTESTED") {
    return "warning";
  }

  return "neutral";
}

export function getAdminUserAdultAccessBadgeLabel(status: AdminUserRecord["adultAccessStatus"]) {
  if (status === "VERIFIED") {
    return "18+ verified";
  }

  if (status === "BLOCKED") {
    return "18+ blocked";
  }

  if (status === "SELF_ATTESTED") {
    return "18+ self-attested";
  }

  return "18+ unknown";
}

export function getAdminUserRiskLabel(riskState: AdminUserRecord["riskState"]) {
  if (riskState === "restricted") {
    return "Restricted";
  }

  if (riskState === "watch") {
    return "Watch";
  }

  return "Normal";
}

export function getAdminReviewRiskTone(riskBand: AdminReviewItem["riskBand"]): BadgeTone {
  if (riskBand === "high") {
    return "danger";
  }

  if (riskBand === "medium") {
    return "warning";
  }

  return "success";
}

export function getAdminReviewQueueLabel(queue: AdminReviewItem["queue"]) {
  if (queue === "message") {
    return "Message";
  }

  if (queue === "post") {
    return "Post";
  }

  return "Profile";
}

export function getAdminAuditCategoryTone(category: AdminActionLogEntry["category"]): BadgeTone {
  if (category === "creator-enforcement") {
    return "danger";
  }

  if (category === "user-enforcement") {
    return "danger";
  }

  if (category === "content-takedown") {
    return "danger";
  }

  if (category === "report-triage") {
    return "warning";
  }

  if (category === "creator-approval") {
    return "info";
  }

  if (category === "risk-controls") {
    return "primary";
  }

  return "neutral";
}

export function getAdminAuditCategoryLabel(category: AdminActionLogEntry["category"]) {
  if (category === "creator-enforcement") {
    return "Creator enforcement";
  }

  if (category === "user-enforcement") {
    return "User enforcement";
  }

  if (category === "content-takedown") {
    return "Content takedown";
  }

  if (category === "report-triage") {
    return "Report review";
  }

  if (category === "creator-approval") {
    return "Creator approval";
  }

  if (category === "risk-controls") {
    return "Risk controls";
  }

  return "Admin action";
}
