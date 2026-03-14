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

function getAvatarStyle(imageUrl?: string) {
  if (imageUrl) {
    return { backgroundImage: `url(${imageUrl})` };
  }

  return {
    backgroundImage:
      "linear-gradient(180deg, rgba(130,92,255,0.24), rgba(15,15,20,0.92))",
  };
}

export default function CreatorSettingsPage() {
  return (
    <div className="grid gap-6">
      <CreatorPageHeader
        eyebrow="Settings"
        title="Public profile settings"
        description="Edit public profile fields, subscriber-facing copy, and disclosure details. Save and public-page preview stay disabled here."
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

            <div className="grid gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">1. Public creator identity</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  These fields are the main inputs for the public-facing creator page and profile summary cards.
                </p>
              </div>
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

              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" defaultValue={creatorProfileFormDefaults.location} />
              </div>
            </div>

            <div className="grid gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">2. Subscriber-facing expectations</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  These fields shape how a subscriber reads the relationship after joining, not just how the profile looks.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="reply-window">Reply promise</Label>
                  <Input id="reply-window" defaultValue={creatorProfileSummary.replyWindowLabel} />
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Related surface</p>
                  <p className="mt-2 text-sm text-foreground/85">
                    Pricing and messaging should reinforce the same expectations this field sets.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href="/creator/pricing">Open pricing</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href="/creator/messages">Open messages</Link>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="welcome-message">Welcome message</Label>
                <Textarea id="welcome-message" defaultValue={creatorProfileFormDefaults.welcomeMessage} />
              </div>
            </div>

            <div className="grid gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">3. Operational and compliance metadata</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Keep these visible, but separate from public-brand edits so the page still feels like a profile editor first.
                </p>
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
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Save state in this preview</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                You can review field grouping, public-page copy, and cross-links here. Saving and public-page preview remain disabled
                until the real editor flow is wired.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button type="button" disabled>
                  Save disabled in preview
                </Button>
                <Button type="button" variant="outline" disabled>
                  Public page preview disabled
                </Button>
              </div>
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
                style={getAvatarStyle(creatorProfileSummary.avatarUrl)}
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
