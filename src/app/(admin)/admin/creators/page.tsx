import Link from "next/link";
import { BadgeCheck, PauseCircle, ShieldCheck } from "lucide-react";

import { updateCreatorModerationStateAction } from "@/app/actions/moderation";
import { AdminEntityFacts } from "@/components/admin/admin-entity-facts";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  getAdminCreatorApprovalBadgeLabel,
  getAdminCreatorApprovalTone,
  getAdminCreatorVerificationBadgeLabel,
  getAdminCreatorVerificationTone,
} from "@/lib/admin/presentation";
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
        description="Review creator status, access, and notes."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Approved"
          value={approvedCount}
          detail="Live creator accounts."
          icon={ShieldCheck}
          labelClassName="text-emerald-300"
        />

        <MetricCard
          label="Pending"
          value={pendingCount}
          detail="Waiting on review."
          icon={BadgeCheck}
          labelClassName="text-amber-300"
        />

        <MetricCard
          label="Suspended"
          value={suspendedCount}
          detail="Removed from discovery."
          icon={PauseCircle}
          labelClassName="text-rose-300"
        />
      </section>

      <Card className="border-white/10 bg-[linear-gradient(180deg,_rgba(18,18,22,0.98),_rgba(11,11,14,0.96))] p-4 sm:p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-admin)]">Creator queue</p>
            <h2 className="mt-2 font-display text-3xl">Creator records</h2>
          </div>
          <StatusBadge>Logged actions</StatusBadge>
        </div>

        <div className="mt-5 grid gap-3">
          {adminCreators.length ? (
            adminCreators.map((creator) => (
              <div key={creator.id} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-3.5 sm:p-4">
                <div className="grid gap-3.5 sm:gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-foreground">{creator.displayName}</p>
                      <StatusBadge tone={getAdminCreatorApprovalTone(creator.approvalStatus)}>
                        {getAdminCreatorApprovalBadgeLabel(creator.approvalStatus)}
                      </StatusBadge>
                      {creator.verificationStatus !== "VERIFIED" ? (
                        <StatusBadge tone={getAdminCreatorVerificationTone(creator.verificationStatus)}>
                          {getAdminCreatorVerificationBadgeLabel(creator.verificationStatus)}
                        </StatusBadge>
                      ) : null}
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {creator.handle} · {creator.category}
                    </p>

                    <AdminEntityFacts
                      className="mt-4"
                      items={[
                        { label: "Pricing", value: creator.pricingLabel },
                        { label: "Subscribers", value: creator.subscribers },
                        { label: "Open reports", value: creator.reportsOpen },
                        { label: "Last review", value: creator.lastReview },
                      ]}
                    />

                    <div className="mt-4 grid gap-3 lg:grid-cols-2">
                      <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Visibility</p>
                        <p className="mt-2 text-sm text-foreground/80">{creator.moderationVisibility}</p>
                      </div>

                      <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Next step</p>
                        <p className="mt-2 text-sm text-foreground/80">{creator.actionState}</p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Latest note</p>
                        <Link href="/admin/audit" className="text-xs text-muted-foreground transition hover:text-foreground">
                          Full audit trail
                        </Link>
                      </div>
                      {creator.relatedNotes[0] ? (
                        <div className="mt-3 rounded-2xl border border-white/10 bg-black/25 px-3 py-3">
                          <p className="text-sm font-medium text-foreground">
                            {creator.relatedNotes[0].actor} · {creator.relatedNotes[0].action}
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">{creator.relatedNotes[0].notes}</p>
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-muted-foreground">No moderation notes recorded yet.</p>
                      )}
                    </div>
                  </div>

                  <form action={updateCreatorModerationStateAction} className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-3.5 sm:p-4">
                    <input type="hidden" name="creatorProfileId" value={creator.id} />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Moderator note</p>
                      <Textarea
                        required
                        name="notes"
                        className="mt-2 min-h-24"
                        placeholder="Add the reason for the action."
                      />
                      <p className="mt-2 text-xs text-muted-foreground">Required for audit history.</p>
                    </div>
                    <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Action</p>
                      <div className="mt-3 grid gap-2">
                        {creator.canApprove ? (
                          <Button className="w-full" size="sm" name="action" value="APPROVE">
                            Approve creator
                          </Button>
                        ) : null}
                        {creator.canSuspend ? (
                          <Button className="w-full" size="sm" variant="outline" name="action" value="SUSPEND">
                            Suspend creator
                          </Button>
                        ) : null}
                        {creator.canRestore ? (
                          <Button className="w-full" size="sm" variant="secondary" name="action" value="RESTORE">
                            Restore creator
                          </Button>
                        ) : null}
                      </div>
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
