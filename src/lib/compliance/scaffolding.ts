export const ADULT_ACCESS_COOKIE_NAME = "onlyclaw_adult_access";
export const ADULT_ACCESS_COOKIE_VALUE = "acknowledged";

export type CreatorApprovalStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "IN_REVIEW"
  | "ACTION_REQUIRED"
  | "APPROVED"
  | "REJECTED"
  | "SUSPENDED";

export type CreatorVerificationStatus =
  | "NOT_STARTED"
  | "SUBMITTED"
  | "IN_REVIEW"
  | "ACTION_REQUIRED"
  | "VERIFIED"
  | "REJECTED"
  | "EXPIRED";

export type UserAdultAccessStatus = "UNKNOWN" | "SELF_ATTESTED" | "VERIFIED" | "BLOCKED";

export type LegalDocumentSection = {
  heading: string;
  body: string;
};

export type LegalDocumentLink = {
  label: string;
  href: string;
};

export type LegalDocumentDefinition = {
  slug: string;
  title: string;
  description: string;
  sections: LegalDocumentSection[];
  relatedLinks?: LegalDocumentLink[];
};

export const betaLegalNotice =
  "Current beta policy notice. This page describes the rules and operating expectations for the current OnlyClaw beta. It should still receive formal legal review before any broader public paid launch.";

export const adultAccessExemptPaths = [
  "/18-plus",
  "/terms",
  "/privacy",
  "/cookies",
  "/content-policy",
  "/acceptable-use",
  "/adult-disclaimer",
  "/dmca",
  "/report",
] as const;

export const publicComplianceLinks: LegalDocumentLink[] = [
  { label: "18+ gate", href: "/18-plus" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "Content policy", href: "/content-policy" },
  { label: "Acceptable use", href: "/acceptable-use" },
  { label: "18+ disclaimer", href: "/adult-disclaimer" },
  { label: "DMCA / takedown", href: "/dmca" },
  { label: "Report issue", href: "/report" },
  { label: "Cookies", href: "/cookies" },
] as const;

export const legalDocuments: LegalDocumentDefinition[] = [
  {
    slug: "terms",
    title: "Terms of Service",
    description:
      "These terms describe the current operating rules for the OnlyClaw beta, including account eligibility, platform boundaries, and how access may be limited while the product remains in controlled launch.",
    sections: [
      {
        heading: "Eligibility and account use",
        body: "OnlyClaw is for adults who are legally allowed to access adult-oriented creator content in their jurisdiction. Users are responsible for accurate account information, account security, and following role-specific rules for fan, creator, and admin access.",
      },
      {
        heading: "Beta product and billing scope",
        body: "This beta is not a live paid launch. Production billing remains out of scope here, and any simulated billing behavior used in staging is for testing only. Public beta access, creator approvals, and feature availability may change as the platform is hardened.",
      },
      {
        heading: "Platform enforcement",
        body: "OnlyClaw may review, restrict, suspend, or remove accounts, creators, content, or access when safety, policy, fraud, legal, or operational concerns require intervention. Moderation and admin actions are recorded and may be escalated through internal trust-and-safety or legal workflows.",
      },
    ],
    relatedLinks: publicComplianceLinks,
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    description:
      "This policy explains the main categories of data handled in the current OnlyClaw beta and how that information supports account access, moderation, support, and platform operations.",
    sections: [
      {
        heading: "Information categories",
        body: "OnlyClaw may process account details, profile information, session and device data, moderation reports, admin action history, support communications, and beta activity needed to operate the service safely.",
      },
      {
        heading: "Use and sharing",
        body: "That information may be used for account operations, product security, moderation, fraud prevention, legal compliance, support handling, and service-provider operations such as hosting, database access, logging, and authentication.",
      },
      {
        heading: "Retention and rights",
        body: "Operationally important records such as moderation data, audit history, and account state may be retained for safety, support, legal, and recovery reasons. More detailed regional rights and retention language should be reviewed before any broader public paid launch.",
      },
    ],
    relatedLinks: publicComplianceLinks,
  },
  {
    slug: "content-policy",
    title: "Content Policy",
    description:
      "This policy describes the current content standards for the OnlyClaw beta, including what may appear in creator pages, subscriber content, messages, previews, and moderation queues.",
    sections: [
      {
        heading: "Adult-content boundaries",
        body: "Adult-oriented creator content may only appear inside the platform's intended age-gated and moderated surfaces. Discovery copy, previews, metadata, and public-facing routes should remain reviewable and must not present prohibited or obviously unsafe material.",
      },
      {
        heading: "Restricted and prohibited material",
        body: "OnlyClaw prohibits content involving minors, non-consensual or exploitative material, coercion, illegal conduct, impersonation, abusive messaging, and deceptive monetization or reporting behavior.",
      },
      {
        heading: "Enforcement and appeals",
        body: "Reports, content restrictions, creator holds, user restrictions, and related admin actions may be reviewed and enforced by the moderation team. Public-beta appeal and legal review procedures should be expanded further before a later paid launch.",
      },
    ],
    relatedLinks: publicComplianceLinks,
  },
  {
    slug: "acceptable-use",
    title: "Acceptable Use Policy",
    description:
      "This policy defines the current behavior rules for fans, creators, and internal operators using the OnlyClaw beta.",
    sections: [
      {
        heading: "Fan and creator conduct",
        body: "Harassment, spam, fraudulent behavior, credential sharing, abusive chargebacks, evasion of enforcement, and misuse of creator messaging or paid-drop surfaces are not allowed.",
      },
      {
        heading: "Automation and scraping",
        body: "Bots, scraping, credential attacks, reverse engineering, and unauthorized extraction of creator media, subscriber data, or protected platform content are prohibited unless explicitly authorized in writing.",
      },
      {
        heading: "Operational enforcement",
        body: "OnlyClaw may issue warnings, temporary restrictions, suspensions, or permanent removal when platform abuse, fraud, safety, or legal risk requires it. High-impact actions should be recorded in admin audit history and may be escalated outside the product.",
      },
    ],
    relatedLinks: publicComplianceLinks,
  },
  {
    slug: "adult-disclaimer",
    title: "18+ / Adult Content Disclaimer",
    description:
      "This page explains the adult-content boundary for the current OnlyClaw beta and the limits of the product's present access-gating approach.",
    sections: [
      {
        heading: "Adult audience requirement",
        body: "OnlyClaw beta access is intended only for adults who are legally permitted to view adult-oriented content in their jurisdiction. People who are underage or otherwise prohibited from accessing that material must not use the service.",
      },
      {
        heading: "Current gate limitations",
        body: "The current 18+ flow is a self-attestation checkpoint. It does not independently verify identity, documents, age-of-majority records, or jurisdiction-specific eligibility.",
      },
      {
        heading: "Moderation and compliance follow-through",
        body: "OnlyClaw still expects moderation review, creator approval controls, audit logging, and stronger compliance work around adult-content operations. Additional verification and legal hardening should happen before a later broader launch.",
      },
    ],
    relatedLinks: publicComplianceLinks,
  },
  {
    slug: "dmca",
    title: "DMCA / Takedown Policy",
    description:
      "This page explains the current copyright and takedown intake path for the OnlyClaw beta and where rights holders should direct notice requests.",
    sections: [
      {
        heading: "Notice intake",
        body: "Copyright owners or authorized agents should use the DMCA and takedown path to report allegedly infringing material. Notices should identify the work, the reported material, contact details, and enough context for review.",
      },
      {
        heading: "Review and response workflow",
        body: "OnlyClaw may review the notice, restrict content while a claim is evaluated, and contact the affected creator or account if follow-up is needed. Additional counter-notice and repeat-infringer detail should be finalized before a later paid launch.",
      },
      {
        heading: "Current beta limitation",
        body: "This beta policy gives a real intake path, but it should still receive formal legal review before the platform is opened more broadly or used as a final public paid-launch policy.",
      },
    ],
    relatedLinks: publicComplianceLinks,
  },
] as const;

export function getLegalDocument(slug: string) {
  return legalDocuments.find((document) => document.slug === slug) ?? null;
}

export function isAdultAccessAcknowledged(value: string | undefined) {
  return value === ADULT_ACCESS_COOKIE_VALUE;
}

export function shouldRequireAdultAccess(pathname: string) {
  if (pathname.startsWith("/_next") || pathname.startsWith("/api")) {
    return false;
  }

  if (pathname.includes(".") && !pathname.endsWith(".well-known")) {
    return false;
  }

  if (adultAccessExemptPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return false;
  }

  return (
    pathname === "/" ||
    pathname === "/discover" ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/creators/")
  );
}

export function normalizeComplianceRedirectTarget(target: string | null | undefined) {
  if (!target || !target.startsWith("/")) {
    return "/discover";
  }

  if (target.startsWith("//")) {
    return "/discover";
  }

  return target;
}

export function getCreatorApprovalStatusLabel(status: CreatorApprovalStatus) {
  switch (status) {
    case "DRAFT":
      return "Draft";
    case "SUBMITTED":
      return "Submitted";
    case "IN_REVIEW":
      return "In review";
    case "ACTION_REQUIRED":
      return "Action required";
    case "APPROVED":
      return "Approved";
    case "REJECTED":
      return "Rejected";
    case "SUSPENDED":
      return "Suspended";
  }
}

export function getCreatorVerificationStatusLabel(status: CreatorVerificationStatus) {
  switch (status) {
    case "NOT_STARTED":
      return "Not started";
    case "SUBMITTED":
      return "Submitted";
    case "IN_REVIEW":
      return "In review";
    case "ACTION_REQUIRED":
      return "Action required";
    case "VERIFIED":
      return "Verified";
    case "REJECTED":
      return "Rejected";
    case "EXPIRED":
      return "Expired";
  }
}

export function getUserAdultAccessStatusLabel(status: UserAdultAccessStatus) {
  switch (status) {
    case "UNKNOWN":
      return "Unknown";
    case "SELF_ATTESTED":
      return "Self-attested";
    case "VERIFIED":
      return "Verified";
    case "BLOCKED":
      return "Blocked";
  }
}
