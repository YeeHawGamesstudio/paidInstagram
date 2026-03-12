import { LegalPage } from "@/components/public/legal-page";
import { getLegalDocument } from "@/lib/compliance/scaffolding";

export default function AcceptableUsePage() {
  const document = getLegalDocument("acceptable-use");

  if (!document) {
    return null;
  }

  return (
    <LegalPage
      eyebrow="Policy placeholder"
      title={document.title}
      description={document.description}
      sections={document.sections}
      relatedLinks={document.relatedLinks}
    />
  );
}
