import { LegalPage } from "@/components/public/legal-page";
import { getLegalDocument } from "@/lib/compliance/scaffolding";

export default function TermsPage() {
  const document = getLegalDocument("terms");

  if (!document) {
    return null;
  }

  return (
    <LegalPage
      eyebrow="Legal placeholder"
      title={document.title}
      description={document.description}
      sections={document.sections}
      relatedLinks={document.relatedLinks}
    />
  );
}
