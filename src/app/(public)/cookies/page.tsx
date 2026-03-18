import { LegalPage } from "@/components/public/legal-page";
import { publicComplianceLinks } from "@/lib/compliance/scaffolding";

export default function CookiesPage() {
  return (
    <LegalPage
      eyebrow="Cookie notice"
      title="Cookie Notice"
      description="This notice explains how OnlyClaw uses cookies and sessions, including the essential cookies needed for login, security, and site operation."
      sections={[
        {
          heading: "Operational cookies",
          body: "OnlyClaw uses basic cookies and similar browser storage for login state, session continuity, security checks, and the adult-access acknowledgment flow.",
        },
        {
          heading: "Analytics and performance",
          body: "OnlyClaw may also use operational monitoring and performance tooling to keep the platform stable and investigate failures. We do not use marketing or advertising cookies.",
        },
        {
          heading: "Managing preferences",
          body: "You can manage cookie behavior through your browser settings. Disabling certain cookies may affect login and session functionality.",
        },
      ]}
      relatedLinks={publicComplianceLinks}
    />
  );
}
