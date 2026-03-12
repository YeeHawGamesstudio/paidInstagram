import type {
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
