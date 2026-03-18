import Link from "next/link";
import { Sparkles } from "lucide-react";

import { CreatorPageHeader } from "@/components/creator/creator-page-header";
import { CreatorSettingsForm } from "@/components/creator/creator-settings-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  creatorComplianceSummary,
} from "@/lib/creator/demo-data";
import { StatusBadge } from "@/components/shared/status-badge";
import { getCreatorApprovalTone, getCreatorVerificationTone } from "@/lib/creator/presentation";
import {
  getCreatorApprovalStatusLabel,
  getCreatorVerificationStatusLabel,
} from "@/lib/compliance/scaffolding";
import { getCreatorSettingsView } from "@/lib/creator/server-data";

function getAvatarStyle(imageUrl?: string) {
  if (imageUrl) {
    return { backgroundImage: `url(${imageUrl})` };
  }

  return {
    backgroundImage:
      "linear-gradient(180deg, rgba(130,92,255,0.24), rgba(15,15,20,0.92))",
  };
}

export default async function CreatorSettingsPage() {
  const settings = await getCreatorSettingsView();

  return (
    <div className="grid gap-6">
      <CreatorPageHeader
        eyebrow="Settings"
        title="Public profile settings"
        description="Edit your public profile fields, subscriber-facing copy, and compliance disclosures."
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="border-white/10 bg-[linear-gradient(180deg,_rgba(20,20,24,0.98),_rgba(11,11,14,0.96))] p-5 sm:p-6">
          <div className="grid gap-6">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Public page</p>
                <p className="mt-2 text-sm text-foreground/85">Display name, username, headline, bio, and location shape the public creator identity.</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Subscriber experience</p>
                <p className="mt-2 text-sm text-foreground/85">Reply promise and welcome message affect what paying fans expect after subscribing.</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Compliance metadata</p>
                <p className="mt-2 text-sm text-foreground/85">Rights contact and adult disclosure support the compliance workflow more than the public profile layout.</p>
              </div>
            </div>

            <CreatorSettingsForm settings={settings} />
          </div>
        </Card>

        <aside className="grid gap-4 self-start xl:sticky xl:top-24">
          <Card className="border-white/10 bg-[linear-gradient(180deg,_rgba(45,24,75,0.32),_rgba(11,11,15,0.98))] p-5">
            <div className="flex items-center gap-2 text-[var(--color-creator)]">
              <Sparkles className="size-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.24em]">Profile preview</p>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <div
                className="size-14 rounded-[1.4rem] border border-white/10 bg-cover bg-center"
                style={getAvatarStyle(settings.avatarUrl)}
              />
              <div>
                <p className="font-semibold">{settings.displayName}</p>
                <p className="text-sm text-muted-foreground">{settings.handle}</p>
              </div>
            </div>
            <p className="mt-4 text-lg text-foreground">{settings.headline || "Add a headline for your public profile."}</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{settings.bio || "Add a bio so fans know what to expect."}</p>
          </Card>

          <Card className="border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">What shapes the public page</p>
            <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3">
                Display name, username, headline, bio, and location are the clearest public identity fields here.
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3">
                Reply promise and welcome message affect subscriber expectations after signup more than public profile layout.
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3">
                Pricing and compliance live on separate surfaces, but they should still match the identity set here.
              </div>
            </div>
          </Card>

          <Card className="border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Compliance status</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <StatusBadge tone={getCreatorApprovalTone(creatorComplianceSummary.approvalStatus)}>
                {getCreatorApprovalStatusLabel(creatorComplianceSummary.approvalStatus)}
              </StatusBadge>
              <StatusBadge tone={getCreatorVerificationTone(creatorComplianceSummary.verificationStatus)}>
                {getCreatorVerificationStatusLabel(creatorComplianceSummary.verificationStatus)}
              </StatusBadge>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Save the public-facing disclosure fields here, then use the dedicated compliance page for verification and
              policy follow-up.
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/creator/compliance">Open compliance review</Link>
            </Button>
          </Card>
        </aside>
      </section>
    </div>
  );
}
