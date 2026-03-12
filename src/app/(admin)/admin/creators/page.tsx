import { BadgeCheck, PauseCircle, ShieldCheck } from "lucide-react";

import { updateCreatorModerationStateAction } from "@/app/actions/moderation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  getAdminCreatorApprovalTone,
  getAdminCreatorStateTone,
  getAdminCreatorVerificationTone,
} from "@/lib/admin/presentation";
import {
  getCreatorApprovalStatusLabel,
  getCreatorVerificationStatusLabel,
} from "@/lib/compliance/scaffolding";
import { getCreatorStateLabel } from "@/lib/admin/demo-data";
import { listAdminModerationCreators } from "@/lib/moderation/service";

export default async function AdminCreatorsPage() {
  const adminCreators = await listAdminModerationCreators();
  const approvedCount = adminCreators.filter((creator) => creator.state === "APPROVED").length;
  const pendingCount = adminCreators.filter((creator) => creator.state === "PENDING").length;
  const suspendedCount = adminCreators.filter((creator) => creator.state === "SUSPENDED").length;

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Creator management"
        title="Creator approvals and enforcement"
        description="Review live creator records, suspend risky accounts, restore cleared creators, and keep audit-ready notes on each moderation state."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Approved"
          value={approvedCount}
          detail="Creators currently live and visible on the platform."
          icon={ShieldCheck}
          labelClassName="text-emerald-300"
        />

        <MetricCard
          label="Pending"
          value={pendingCount}
          detail="Applications waiting on compliance, copy, or pricing review."
          icon={BadgeCheck}
          labelClassName="text-amber-300"
        />

        <MetricCard
          label="Suspended"
          value={suspendedCount}
          detail="Accounts held back from discovery or subscriber conversion flows."
          icon={PauseCircle}
          labelClassName="text-rose-300"
        />
      </section>

      <Card className="border-white/10 bg-[linear-gradient(180deg,_rgba(18,18,22,0.98),_rgba(11,11,14,0.96))] p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-admin)]">Creator queue</p>
            <h2 className="mt-2 font-display text-3xl">Structured creator records</h2>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Logged actions
          </span>
        </div>

        <div className="mt-5 grid gap-3">
          {adminCreators.length ? (
            adminCreators.map((creator) => (
              <div key={creator.id} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-foreground">{creator.displayName}</p>
                      <StatusBadge tone={getAdminCreatorStateTone(creator.state)}>
                        {getCreatorStateLabel(creator.state)}
                      </StatusBadge>
                      <StatusBadge tone={getAdminCreatorApprovalTone(creator.approvalStatus)}>
                        {getCreatorApprovalStatusLabel(creator.approvalStatus)}
                      </StatusBadge>
                      <StatusBadge tone={getAdminCreatorVerificationTone(creator.verificationStatus)}>
                        {getCreatorVerificationStatusLabel(creator.verificationStatus)}
                      </StatusBadge>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {creator.handle} · {creator.category}
                    </p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-4">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Pricing</p>
                        <p className="mt-1 text-sm font-medium">{creator.pricingLabel}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Subscribers</p>
                        <p className="mt-1 text-sm font-medium">{creator.subscribers}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Open reports</p>
                        <p className="mt-1 text-sm font-medium">{creator.reportsOpen}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Last review</p>
                        <p className="mt-1 text-sm font-medium">{creator.lastReview}</p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Visibility</p>
                      <p className="mt-2 text-sm leading-6 text-foreground/80">{creator.moderationVisibility}</p>
                    </div>

                    <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Action state</p>
                      <p className="mt-2 text-sm leading-6 text-foreground/80">{creator.actionState}</p>
                    </div>

                    <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Recent moderation notes</p>
                      <div className="mt-3 grid gap-3">
                        {creator.relatedNotes.length ? (
                          creator.relatedNotes.slice(0, 3).map((note) => (
                            <div key={note.id} className="rounded-2xl border border-white/10 bg-black/25 px-3 py-3">
                              <p className="text-sm font-medium text-foreground">
                                {note.actor} · {note.action}
                              </p>
                              <p className="mt-2 text-sm leading-6 text-muted-foreground">{note.notes}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No moderation notes recorded yet.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <form action={updateCreatorModerationStateAction} className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                    <input type="hidden" name="creatorProfileId" value={creator.id} />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Moderator note</p>
                      <Textarea
                        name="notes"
                        className="mt-2 min-h-24"
                        placeholder="Capture approval rationale, suspension reason, or restore conditions."
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" name="action" value="APPROVE">
                        Approve creator
                      </Button>
                      <Button size="sm" variant="outline" name="action" value="SUSPEND">
                        Suspend creator
                      </Button>
                      <Button size="sm" variant="ghost" name="action" value="RESTORE">
                        Restore creator
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-black/20 px-4 py-10 text-center text-sm text-muted-foreground">
              No creator records are available for moderation review.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
