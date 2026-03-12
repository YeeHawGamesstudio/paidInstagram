import Link from "next/link";
import { ClipboardCheck, Eye, ShieldCheck } from "lucide-react";

import {
  takeDownReportedPostAction,
  updateCreatorModerationStateAction,
  updateModerationReportStatusAction,
} from "@/app/actions/moderation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getAdminReviewRiskTone } from "@/lib/admin/presentation";
import { getReviewQueueCountByRisk, listAdminModerationReviewQueue } from "@/lib/moderation/service";

export default async function AdminReviewPage() {
  const adminReviewQueue = await listAdminModerationReviewQueue();

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Content review"
        title="Review queue"
        description="A live queue for content-targeted moderation reports, with production-shaped review states and enforcement actions."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Items queued"
          value={adminReviewQueue.length}
          detail="Representative queue of creator content awaiting approval or edits."
          icon={ClipboardCheck}
          labelClassName="text-[var(--color-admin)]"
        />

        <MetricCard
          label="Needs human review"
          value={adminReviewQueue.filter((item) => item.riskBand !== "low").length}
          detail="Items that should not be auto-cleared in a production workflow."
          icon={Eye}
          labelClassName="text-amber-300"
        />

        <MetricCard
          label="Low risk"
          value={getReviewQueueCountByRisk(adminReviewQueue, "low")}
          detail="Items likely to move quickly once the creator state is cleared."
          icon={ShieldCheck}
          labelClassName="text-emerald-300"
        />
      </section>

      <Card className="border-white/10 bg-[linear-gradient(180deg,_rgba(18,18,22,0.98),_rgba(11,11,14,0.96))] p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-admin)]">Moderation queue</p>
            <h2 className="mt-2 font-display text-3xl">Content waiting on admin review</h2>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Live moderation data
          </span>
        </div>

        <div className="mt-5 grid gap-3">
          {adminReviewQueue.length ? (
            adminReviewQueue.map((item) => (
              <div key={item.id} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {item.queue}
                      </span>
                      <StatusBadge tone={getAdminReviewRiskTone(item.riskBand)}>
                        {item.riskBand} risk
                      </StatusBadge>
                      <StatusBadge tone={item.status === "OPEN" ? "danger" : item.status === "REVIEWED" ? "info" : "success"}>
                        {item.status.toLowerCase()}
                      </StatusBadge>
                    </div>

                    <p className="mt-3 text-lg font-semibold text-foreground">{item.creatorLabel}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.summary}</p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {item.flags.map((flag) => (
                        <span
                          key={flag}
                          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-foreground/80"
                        >
                          {flag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Submitted</p>
                        <p className="mt-1 text-sm font-medium">{item.submittedAt}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Action state</p>
                        <p className="mt-1 text-sm font-medium">{item.actionState}</p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Recent notes</p>
                        {item.resolutionHref ? (
                          <Link href={item.resolutionHref} className="text-xs text-muted-foreground transition hover:text-foreground">
                            View source
                          </Link>
                        ) : null}
                      </div>
                      <div className="mt-3 grid gap-3">
                        {item.relatedNotes.length ? (
                          item.relatedNotes.slice(0, 2).map((note) => (
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

                  <div className="grid gap-3">
                    <form action={updateModerationReportStatusAction} className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                      <input type="hidden" name="reportId" value={item.reportId} />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Review note</p>
                        <Textarea
                          name="notes"
                          className="mt-2 min-h-24"
                          placeholder="Capture moderation reasoning and what should happen next."
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" name="status" value="REVIEWED">
                          Mark reviewed
                        </Button>
                        <Button size="sm" variant="outline" name="status" value="RESOLVED">
                          Clear queue
                        </Button>
                      </div>
                    </form>

                    {item.queue === "post" ? (
                      <form action={takeDownReportedPostAction} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                        <input type="hidden" name="reportId" value={item.reportId} />
                        <input type="hidden" name="notes" value="Post removed from the content review queue after moderation review." />
                        <Button size="sm" variant="outline" className="w-full">
                          Restrict visibility
                        </Button>
                      </form>
                    ) : null}

                    {item.targetCreatorProfileId ? (
                      <form action={updateCreatorModerationStateAction} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                        <input type="hidden" name="creatorProfileId" value={item.targetCreatorProfileId} />
                        <input type="hidden" name="reportId" value={item.reportId} />
                        <input type="hidden" name="notes" value="Creator suspended from the content review queue pending trust-and-safety follow-up." />
                        <Button size="sm" variant="ghost" className="w-full" name="action" value="SUSPEND">
                          Suspend creator
                        </Button>
                      </form>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-black/20 px-4 py-10 text-center text-sm text-muted-foreground">
              No content items are currently waiting on moderation review.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
