import { LegalPage } from "@/components/public/legal-page";
import { publicComplianceLinks } from "@/lib/compliance/scaffolding";

export default function CookiesPage() {
  return (
    <LegalPage
      eyebrow="Legal placeholder"
      title="Cookie Notice"
      description="This premium-styled placeholder page is ready for a future cookie notice covering analytics, functional cookies, personalization, and consent handling."
      sections={[
        {
          heading: "Operational cookies",
          body: "Future copy can describe the cookies needed for login state, security features, and basic site functionality once those systems are enabled.",
        },
        {
          heading: "Analytics and performance",
          body: "This section is reserved for any future analytics, experimentation, and performance monitoring disclosures tied to public browsing and subscriber conversion.",
        },
        {
          heading: "Managing preferences",
          body: "Later revisions can explain regional consent handling, cookie preference tools, and browser-level controls in a concise user-friendly format.",
        },
      ]}
      relatedLinks={publicComplianceLinks}
    />
  );
}
