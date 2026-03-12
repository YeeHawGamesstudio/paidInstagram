import { LegalPage } from "@/components/public/legal-page";
import { getLegalDocument } from "@/lib/compliance/scaffolding";

export default function ContentPolicyPage() {
  const document = getLegalDocument("content-policy");

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
