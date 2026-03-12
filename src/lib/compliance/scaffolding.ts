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

export const placeholderLegalNotice =
  "Placeholder only. This page is production-shaped scaffolding for future counsel-reviewed policy text. It does not represent finalized legal terms, regulatory clearance, or complete compliance coverage.";

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
      "This route is a placeholder for the platform's eventual Terms of Service. The page structure, disclosure areas, and navigation are ready now, but the legal text still needs formal review and final drafting.",
    sections: [
      {
        heading: "Eligibility and account use",
        body: "Final terms should define who may use the service, age restrictions, account security expectations, and role-specific obligations for fans, creators, and internal admins.",
      },
      {
        heading: "Paid products and billing boundaries",
        body: "Production terms should later cover renewals, refunds, taxes, chargebacks, payout boundaries, and the responsibilities of any payment or payout providers once live billing is enabled.",
      },
      {
        heading: "Platform enforcement",
        body: "A finalized version should explain when accounts, creators, content, or transactions may be limited, reviewed, removed, suspended, or escalated to legal and trust-and-safety workflows.",
      },
    ],
    relatedLinks: publicComplianceLinks,
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    description:
      "This page reserves a clear place for the platform's privacy disclosures without implying those disclosures are complete today. It is intentionally written as a placeholder until data flows and retention rules are finalized.",
    sections: [
      {
        heading: "Information categories",
        body: "Future copy should describe profile data, subscription activity, device and analytics events, moderation records, support communications, and any verification materials collected later.",
      },
      {
        heading: "Use and sharing",
        body: "Final disclosures should explain how data may support account operations, fraud prevention, moderation, legal process response, personalization, reporting tools, and service providers.",
      },
      {
        heading: "Retention and rights",
        body: "A counsel-reviewed policy should later explain retention windows, deletion requests, appeals, and region-specific privacy rights once those operational processes are defined.",
      },
    ],
    relatedLinks: publicComplianceLinks,
  },
  {
    slug: "content-policy",
    title: "Content Policy",
    description:
      "This placeholder describes where the platform's content standards will live. It should later define what creators, fans, and internal teams may publish, preview, message, monetize, report, or remove.",
    sections: [
      {
        heading: "Adult-content boundaries",
        body: "Future policy text should define what adult material is allowed, what must remain prohibited, which content requires manual review, and how previews, metadata, and discovery surfaces are constrained.",
      },
      {
        heading: "Restricted and prohibited material",
        body: "A finalized policy should cover non-consensual content, minors, exploitative material, illegal conduct, impersonation, coercion, abusive messaging, and deceptive monetization patterns.",
      },
      {
        heading: "Enforcement and appeals",
        body: "Later revisions should document how reports, moderator actions, creator holds, visibility restrictions, and appeals are logged, reviewed, and escalated.",
      },
    ],
    relatedLinks: publicComplianceLinks,
  },
  {
    slug: "acceptable-use",
    title: "Acceptable Use Policy",
    description:
      "This placeholder sets aside the operational home for user-behavior rules. It intentionally avoids promising a finished enforcement standard until abuse-prevention and moderation procedures are finalized.",
    sections: [
      {
        heading: "Fan and creator conduct",
        body: "Final policy text should later explain harassment, spam, fraudulent behavior, credential sharing, abusive chargebacks, evasion of enforcement, and misuse of messaging features.",
      },
      {
        heading: "Automation and scraping",
        body: "Production language should define restrictions around bots, scraping, reverse engineering, credential attacks, and unauthorized extraction of creator media or subscriber information.",
      },
      {
        heading: "Operational enforcement",
        body: "A complete version should cover warnings, temporary restrictions, permanent bans, account review holds, payment limits, legal escalation, and audit-log retention for enforcement actions.",
      },
    ],
    relatedLinks: publicComplianceLinks,
  },
  {
    slug: "adult-disclaimer",
    title: "18+ / Adult Content Disclaimer",
    description:
      "This page provides a clear adult-content disclaimer and explains that the current access gate is only a self-attestation scaffold. It is not an identity-verification or age-verification system.",
    sections: [
      {
        heading: "Adult audience requirement",
        body: "Access to adult-oriented discovery and creator surfaces should be limited to adults who are legally permitted to view such material in their jurisdiction.",
      },
      {
        heading: "Current gate limitations",
        body: "The present 18+ flow is a placeholder acknowledgment gate only. It does not validate identity, documents, age-of-majority records, or jurisdiction-specific eligibility.",
      },
      {
        heading: "Future compliance expansion",
        body: "Later product work may add stronger verification, recordkeeping, and moderation procedures, but those systems are not represented as complete or legally sufficient here today.",
      },
    ],
    relatedLinks: publicComplianceLinks,
  },
  {
    slug: "dmca",
    title: "DMCA / Takedown Placeholder",
    description:
      "This route is a placeholder intake surface for future copyright and takedown handling. It is designed so real notice-and-action procedures can be added later without restructuring the public app.",
    sections: [
      {
        heading: "Notice intake",
        body: "Final copy should explain where copyright owners or authorized agents can submit notices, what information is required, and how incomplete claims are handled.",
      },
      {
        heading: "Review and response workflow",
        body: "A production policy should later define acknowledgement timing, temporary content restrictions, creator notifications, counter-notice handling, and repeat-infringer rules if adopted.",
      },
      {
        heading: "Placeholder limitation",
        body: "This page does not itself establish a complete DMCA process. It only provides the scaffolding and entry-point structure needed for later legal implementation.",
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
