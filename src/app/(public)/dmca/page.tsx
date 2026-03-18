import { LegalPage } from "@/components/public/legal-page";
import { getLegalDocument } from "@/lib/compliance/scaffolding";

export default function DmcaPage() {
  const document = getLegalDocument("dmca");

  if (!document) {
    return null;
  }

  return (
    <LegalPage
      eyebrow="Copyright and takedown"
      title={document.title}
      description={document.description}
      sections={document.sections}
      relatedLinks={document.relatedLinks}
    />
  );
}
