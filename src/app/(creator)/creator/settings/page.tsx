import Link from "next/link";
import { Sparkles } from "lucide-react";

import { CreatorPageHeader } from "@/components/creator/creator-page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  creatorComplianceSummary,
  creatorProfileFormDefaults,
  creatorProfileSummary,
} from "@/lib/creator/demo-data";
import { StatusBadge } from "@/components/shared/status-badge";
import { getCreatorApprovalTone, getCreatorVerificationTone } from "@/lib/creator/presentation";
import {
  getCreatorApprovalStatusLabel,
  getCreatorVerificationStatusLabel,
} from "@/lib/compliance/scaffolding";

export default function CreatorSettingsPage() {
  return (
    <div className="grid gap-6">
      <CreatorPageHeader
        eyebrow="Settings"
        title="Profile and creator settings"
        description="Manage the voice, visuals, and subscriber-facing profile details that shape how premium your page feels."
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="border-white/10 bg-[linear-gradient(180deg,_rgba(20,20,24,0.98),_rgba(11,11,14,0.96))] p-5 sm:p-6">
          <div className="grid gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="display-name">Display name</Label>
                <Input id="display-name" defaultValue={creatorProfileFormDefaults.displayName} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" defaultValue={creatorProfileFormDefaults.username} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="headline">Headline</Label>
              <Input id="headline" defaultValue={creatorProfileFormDefaults.headline} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" defaultValue={creatorProfileFormDefaults.bio} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" defaultValue={creatorProfileFormDefaults.location} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reply-window">Reply promise</Label>
                <Input id="reply-window" defaultValue={creatorProfileSummary.replyWindowLabel} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="welcome-message">Welcome message</Label>
              <Textarea id="welcome-message" defaultValue={creatorProfileFormDefaults.welcomeMessage} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="rights-contact">Rights / DMCA contact</Label>
                <Input id="rights-contact" type="email" defaultValue={creatorProfileFormDefaults.rightsContactEmail} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="adult-disclosure">Adult-content disclosure</Label>
                <Input id="adult-disclosure" defaultValue={creatorProfileFormDefaults.adultDisclosure} />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="button">Save profile</Button>
              <Button type="button" variant="outline">
                Preview public page
              </Button>
            </div>
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
                style={{ backgroundImage: `url(${creatorProfileSummary.avatarUrl})` }}
              />
              <div>
                <p className="font-semibold">{creatorProfileSummary.displayName}</p>
                <p className="text-sm text-muted-foreground">{creatorProfileSummary.handle}</p>
              </div>
            </div>
            <p className="mt-4 text-lg text-foreground">{creatorProfileSummary.headline}</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{creatorProfileSummary.bio}</p>
          </Card>

          <Card className="border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Premium checklist</p>
            <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3">
                Keep the headline emotional, not generic.
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3">
                Make the welcome message feel intimate and member-first.
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3">
                Match public teasers and subscriber drops to one clear visual identity.
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
              policy scaffolding.
            </p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/creator/compliance">Open compliance workspace</Link>
            </Button>
          </Card>
        </aside>
      </section>
    </div>
  );
}
