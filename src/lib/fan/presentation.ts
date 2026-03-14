import type { BadgeTone } from "@/lib/ui/badge";

export function getFanConversationTone(tone: "ONLINE" | "UNREAD" | "QUIET"): BadgeTone {
  if (tone === "ONLINE") {
    return "success";
  }

  if (tone === "UNREAD") {
    return "primary";
  }

  return "neutral";
}

export function getFanConversationToneLabel(tone: "ONLINE" | "UNREAD" | "QUIET") {
  if (tone === "ONLINE") {
    return "Recent";
  }

  if (tone === "UNREAD") {
    return "Paid drop";
  }

  return "Quiet";
}

export function getFanFeedAccessTone(access: "INCLUDED" | "LOCKED"): BadgeTone {
  return access === "INCLUDED" ? "success" : "primary";
}

export function getFanFeedAccessLabel(access: "INCLUDED" | "LOCKED") {
  return access === "INCLUDED" ? "Unlocked by membership" : "Subscribers only";
}

export function getFanSubscriptionTone(
  status: "ACTIVE" | "RENEWING_SOON" | "CANCELS_AT_PERIOD_END" | "PAUSED",
): BadgeTone {
  if (status === "CANCELS_AT_PERIOD_END") {
    return "warning";
  }

  if (status === "PAUSED") {
    return "neutral";
  }

  return "success";
}

export function getFanBillingStatusTone(
  status: "PAID" | "PENDING" | "FAILED" | "REFUNDED" | "DISPUTED",
): BadgeTone {
  if (status === "PAID") {
    return "success";
  }

  if (status === "FAILED" || status === "DISPUTED") {
    return "danger";
  }

  if (status === "REFUNDED") {
    return "warning";
  }

  return "primary";
}
