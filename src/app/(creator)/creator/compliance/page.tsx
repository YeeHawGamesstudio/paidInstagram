import Link from "next/link";
import { FileCheck, Flag, ShieldCheck } from "lucide-react";

import { CreatorPageHeader } from "@/components/creator/creator-page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  creatorComplianceChecklist,
  creatorComplianceSummary,
  creatorVerificationMilestones,
} from "@/lib/creator/demo-data";
import {
  getCreatorAdultAccessTone,
  getCreatorApprovalTone,
  getCreatorComplianceTaskTone,
  getCreatorVerificationTone,
} from "@/lib/creator/presentation";
import {
  getCreatorApprovalStatusLabel,
  getCreatorVerificationStatusLabel,
  getUserAdultAccessStatusLabel,
} from "@/lib/compliance/scaffolding";

export default function CreatorCompliancePage() {
  return (
    <div className="grid gap-6">
      <CreatorPageHeader
        eyebrow="Compliance"
        title="Compliance and verification scaffolding"
        description="Track the placeholder systems that should eventually back creator approval, adult-content disclosures, verification review, and rights-management workflows."
        actions={
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/adult-disclaimer">Review 18+ disclaimer</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dmca">View DMCA placeholder</Link>
            </Button>
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Approval state</p>
          <div className="mt-4">
            <StatusBadge tone={getCreatorApprovalTone(creatorComplianceSummary.approvalStatus)}>
              {getCreatorApprovalStatusLabel(creatorComplianceSummary.approvalStatus)}
            </StatusBadge>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">{creatorComplianceSummary.lastReviewLabel}</p>
        </Card>

        <Card className="border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Verification state</p>
          <div className="mt-4">
            <StatusBadge tone={getCreatorVerificationTone(creatorComplianceSummary.verificationStatus)}>
              {getCreatorVerificationStatusLabel(creatorComplianceSummary.verificationStatus)}
            </StatusBadge>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            The account has UI hooks for verification review, but the real submission and adjudication system is not final.
          </p>
        </Card>

        <Card className="border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Adult-content access</p>
          <div className="mt-4">
            <StatusBadge tone={getCreatorAdultAccessTone(creatorComplianceSummary.adultAccessStatus)}>
              {getUserAdultAccessStatusLabel(creatorComplianceSummary.adultAccessStatus)}
            </StatusBadge>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            {creatorComplianceSummary.contentPolicyAcceptance}. The gate currently relies on self-attestation only.
          </p>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
        <Card className="border-white/10 bg-[linear-gradient(180deg,_rgba(20,20,24,0.98),_rgba(11,11,14,0.96))] p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Checklist</p>
              <h2 className="mt-2 font-display text-3xl">Operational readiness hooks</h2>
            </div>
            <ShieldCheck className="size-5 text-primary" />
          </div>

          <div className="mt-5 grid gap-3">
            {creatorComplianceChecklist.map((item) => (
              <div key={item.id} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge tone={getCreatorComplianceTaskTone(item.status)}>
                    {item.status.replace("_", " ")}
                  </StatusBadge>
                </div>
                <p className="mt-3 font-semibold text-foreground">{item.label}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-4 self-start">
          <Card className="border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2 text-primary">
              <FileCheck className="size-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.24em]">Verification lane</p>
            </div>
            <div className="mt-4 grid gap-3">
              {creatorVerificationMilestones.map((item) => (
                <div key={item.label} className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3">
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-primary/80">{item.state}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2 text-primary">
              <Flag className="size-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.24em]">Rights and reporting</p>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              DMCA and abuse reporting entry points now exist publicly, but inbox routing, evidence retention, and legal
              response timing still need implementation.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <Button asChild variant="outline">
                <Link href="/report?target=creator&subject=Creator%20studio">Open report placeholder</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/content-policy">Read content policy placeholder</Link>
              </Button>
            </div>
            <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-black/20 p-4 text-sm leading-6 text-muted-foreground">
              {creatorComplianceSummary.readinessNote}
              <div className="mt-3">Rights contact placeholder: {creatorComplianceSummary.dmcaContactEmail}</div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
