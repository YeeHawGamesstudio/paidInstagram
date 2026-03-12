import type { CreatorConversationTone, CreatorSubscriberStatus } from "@/lib/creator/demo-data";
import type { CreatorComplianceTaskStatus } from "@/lib/creator/demo-data";
import type { BadgeTone } from "@/lib/ui/badge";
import type {
  CreatorApprovalStatus,
  CreatorVerificationStatus,
  UserAdultAccessStatus,
} from "@/lib/compliance/scaffolding";

export function getCreatorConversationTone(tone: CreatorConversationTone): BadgeTone {
  if (tone === "VIP") {
    return "primary";
  }

  if (tone === "UNREAD") {
    return "success";
  }

  return "neutral";
}

export function getCreatorConversationToneLabel(tone: CreatorConversationTone) {
  if (tone === "VIP") {
    return "VIP";
  }

  if (tone === "UNREAD") {
    return "Unread";
  }

  return "Quiet";
}

export function getCreatorSubscriberTone(status: CreatorSubscriberStatus): BadgeTone {
  if (status === "VIP") {
    return "primary";
  }

  if (status === "ACTIVE") {
    return "success";
  }

  return "danger";
}

export function getCreatorApprovalTone(status: CreatorApprovalStatus): BadgeTone {
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

export function getCreatorVerificationTone(status: CreatorVerificationStatus): BadgeTone {
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

export function getCreatorAdultAccessTone(status: UserAdultAccessStatus): BadgeTone {
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

export function getCreatorComplianceTaskTone(status: CreatorComplianceTaskStatus): BadgeTone {
  if (status === "done") {
    return "success";
  }

  if (status === "action_required") {
    return "warning";
  }

  return "neutral";
}
