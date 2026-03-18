import { LegalPage } from "@/components/public/legal-page";
import { getLegalDocument } from "@/lib/compliance/scaffolding";

export default function AdultDisclaimerPage() {
  const document = getLegalDocument("adult-disclaimer");

  if (!document) {
    return null;
  }

  return (
    <LegalPage
      eyebrow="Adult-content notice"
      title={document.title}
      description={document.description}
      sections={document.sections}
      relatedLinks={document.relatedLinks}
    />
  );
}
