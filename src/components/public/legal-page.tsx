import Link from "next/link";

import { Card } from "@/components/ui/card";

import { placeholderLegalNotice, type LegalDocumentLink } from "@/lib/compliance/scaffolding";

type LegalSection = {
  heading: string;
  body: string;
};

type LegalPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  sections: LegalSection[];
  relatedLinks?: LegalDocumentLink[];
};

export function LegalPage({ eyebrow, title, description, sections, relatedLinks = [] }: LegalPageProps) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">{eyebrow}</p>
        <h1 className="font-display text-5xl leading-none sm:text-6xl">{title}</h1>
        <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">{description}</p>
      </section>

      <Card className="border-amber-400/20 bg-amber-400/8 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">Placeholder notice</p>
        <p className="mt-3 text-sm leading-7 text-foreground/82">{placeholderLegalNotice}</p>
      </Card>

      <section className="grid gap-4">
        {sections.map((section) => (
          <Card key={section.heading} className="border-white/10 bg-white/[0.03] p-6">
            <h2 className="font-display text-3xl">{section.heading}</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{section.body}</p>
          </Card>
        ))}
      </section>

      {relatedLinks.length ? (
        <Card className="border-white/10 bg-white/[0.03] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Related compliance routes</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {relatedLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-muted-foreground transition hover:border-primary/35 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </Card>
      ) : null}
    </main>
  );
}
