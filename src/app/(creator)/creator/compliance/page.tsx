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
        title="Compliance"
        actions={
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/adult-disclaimer">Review 18+ page</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dmca">View DMCA page</Link>
            </Button>
          </div>
        }
      />

      

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-emerald-500/20 bg-emerald-500/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Approval state</p>
          <div className="mt-4">
            <StatusBadge tone={getCreatorApprovalTone(creatorComplianceSummary.approvalStatus)}>
              {getCreatorApprovalStatusLabel(creatorComplianceSummary.approvalStatus)}
            </StatusBadge>
          </div>
          <p className="mt-3 text-xs text-emerald-100/70">{creatorComplianceSummary.lastReviewLabel}</p>
        </Card>

        <Card className="border-amber-500/20 bg-amber-500/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Verification state</p>
          <div className="mt-4">
            <StatusBadge tone={getCreatorVerificationTone(creatorComplianceSummary.verificationStatus)}>
              {getCreatorVerificationStatusLabel(creatorComplianceSummary.verificationStatus)}
            </StatusBadge>
          </div>
          
        </Card>

        <Card className="border-rose-500/20 bg-rose-500/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Adult-content access</p>
          <div className="mt-4">
            <StatusBadge tone={getCreatorAdultAccessTone(creatorComplianceSummary.adultAccessStatus)}>
              {getUserAdultAccessStatusLabel(creatorComplianceSummary.adultAccessStatus)}
            </StatusBadge>
          </div>
          <p className="mt-3 text-xs text-rose-100/70">{creatorComplianceSummary.contentPolicyAcceptance}</p>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
        <Card className="border-white/10 bg-[linear-gradient(180deg,_rgba(20,20,24,0.98),_rgba(11,11,14,0.96))] p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Action-required items</p>
              <h2 className="mt-2 font-display text-3xl">What still needs trust follow-up</h2>
            </div>
            <ShieldCheck className="size-5 text-primary" />
          </div>

          <div className="mt-5 grid gap-3">
            {creatorComplianceChecklist.map((item) => (
              <div key={item.id} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <StatusBadge tone={getCreatorComplianceTaskTone(item.status)}>
                    {item.status.replace("_", " ")}
                  </StatusBadge>
                  <span className="text-xs text-muted-foreground">
                    {item.status === "done"
                      ? "Working today"
                      : item.status === "action_required"
                        ? "Needs workflow follow-up"
                        : "Needs a fuller workflow"}
                  </span>
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
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Treat this as a verification review lane, not a fully live KYC or adjudication system yet.
            </p>
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
              DMCA and abuse reporting entry points exist, but they still depend on stronger inbox routing, evidence retention,
              and legal response handling.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <Button asChild variant="outline">
                <Link href="/report?target=creator&subject=Creator%20studio">Open report page</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/content-policy">Read content policy</Link>
              </Button>
            </div>
            <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-black/20 p-4 text-sm leading-6 text-muted-foreground">
              {creatorComplianceSummary.readinessNote}
              <div className="mt-3">Rights contact on file: {creatorComplianceSummary.dmcaContactEmail}</div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
