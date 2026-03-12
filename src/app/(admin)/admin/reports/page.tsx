import Link from "next/link";
import { AlertTriangle, ShieldAlert, Siren } from "lucide-react";

import {
  takeDownReportedPostAction,
  updateCreatorModerationStateAction,
  updateModerationReportStatusAction,
  updateUserModerationStateAction,
} from "@/app/actions/moderation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getAdminReportSeverityTone, getAdminReportStatusTone } from "@/lib/admin/presentation";
import { Textarea } from "@/components/ui/textarea";
import { getReportStatusLabel, listAdminModerationReports } from "@/lib/moderation/service";

export default async function AdminReportsPage() {
  const adminReports = await listAdminModerationReports();
  const openCount = adminReports.filter((report) => report.status === "OPEN").length;
  const reviewedCount = adminReports.filter((report) => report.status === "REVIEWED").length;
  const highPriorityCount = adminReports.filter(
    (report) => report.severity === "high" || report.severity === "critical",
  ).length;

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Reports and moderation"
        title="Moderation intake"
        description="Review live user reports, apply moderation decisions, and keep enforcement history attached to each case."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Open"
          value={openCount}
          detail="Reports still waiting on an explicit moderator outcome."
          icon={Siren}
          labelClassName="text-rose-300"
        />

        <MetricCard
          label="High priority"
          value={highPriorityCount}
          detail="Items that should appear near the top of an admin work queue."
          icon={AlertTriangle}
          labelClassName="text-orange-300"
        />

        <MetricCard
          label="Reviewed"
          value={reviewedCount}
          detail="Reports already touched but still carrying follow-up work."
          icon={ShieldAlert}
          labelClassName="text-[var(--color-admin)]"
        />
      </section>

      <Card className="border-white/10 bg-[linear-gradient(180deg,_rgba(18,18,22,0.98),_rgba(11,11,14,0.96))] p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-admin)]">Report queue</p>
            <h2 className="mt-2 font-display text-3xl">Cases requiring moderation</h2>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Logged actions
          </span>
        </div>

        <div className="mt-5 grid gap-3">
          {adminReports.length ? (
            adminReports.map((report) => (
              <div key={report.id} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge tone={getAdminReportSeverityTone(report.severity)}>
                        {report.severity}
                      </StatusBadge>
                      <StatusBadge tone={getAdminReportStatusTone(report.status)}>
                        {getReportStatusLabel(report.status)}
                      </StatusBadge>
                      <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{report.targetType}</span>
                    </div>

                    <p className="mt-3 text-lg font-semibold text-foreground">{report.targetLabel}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{report.reason}</p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Reporter</p>
                        <p className="mt-1 text-sm font-medium">{report.reporterLabel}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Opened</p>
                        <p className="mt-1 text-sm font-medium">{report.openedAt}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Assignee</p>
                        <p className="mt-1 text-sm font-medium">{report.assignee}</p>
                      </div>
                    </div>

                    {report.subject || report.sourceUrl ? (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {report.subject ? (
                          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Subject</p>
                            <p className="mt-1 text-sm font-medium">{report.subject}</p>
                          </div>
                        ) : null}
                        {report.sourceUrl ? (
                          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Source</p>
                            <p className="mt-1 break-all text-sm font-medium">
                              <Link href={report.sourceUrl} className="text-foreground/85 underline-offset-4 hover:underline">
                                {report.sourceUrl}
                              </Link>
                            </p>
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Action state</p>
                      <p className="mt-2 text-sm leading-6 text-foreground/80">{report.actionState}</p>
                    </div>

                    <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Notes and audit history</p>
                        <Link href="/admin/audit" className="text-xs text-muted-foreground transition hover:text-foreground">
                          Full audit trail
                        </Link>
                      </div>
                      <div className="mt-3 grid gap-3">
                        {report.relatedNotes.length ? (
                          report.relatedNotes.slice(0, 3).map((note) => (
                            <div key={note.id} className="rounded-2xl border border-white/10 bg-black/25 px-3 py-3">
                              <p className="text-sm font-medium text-foreground">
                                {note.actor} · {note.action}
                              </p>
                              <p className="mt-2 text-sm leading-6 text-muted-foreground">{note.notes}</p>
                              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">{note.when}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No moderator notes recorded yet.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <form action={updateModerationReportStatusAction} className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                      <input type="hidden" name="reportId" value={report.id} />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Moderator note</p>
                        <Textarea
                          name="notes"
                          className="mt-2 min-h-24"
                          placeholder="Record what you reviewed, what action was taken, and any follow-up needed."
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" name="status" value="REVIEWED">
                          Mark reviewed
                        </Button>
                        <Button size="sm" variant="outline" name="status" value="RESOLVED">
                          Resolve case
                        </Button>
                        <Button size="sm" variant="ghost" name="status" value="DISMISSED">
                          Dismiss report
                        </Button>
                      </div>
                    </form>

                    {report.canTakeDownPost ? (
                      <form action={takeDownReportedPostAction} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                        <input type="hidden" name="reportId" value={report.id} />
                        <input type="hidden" name="notes" value="Post removed from visibility from the moderation report queue." />
                        <Button size="sm" variant="outline" className="w-full">
                          Takedown content
                        </Button>
                      </form>
                    ) : null}

                    {report.canSuspendCreator && report.targetCreatorProfileId ? (
                      <form action={updateCreatorModerationStateAction} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                        <input type="hidden" name="creatorProfileId" value={report.targetCreatorProfileId} />
                        <input type="hidden" name="reportId" value={report.id} />
                        <input type="hidden" name="notes" value="Creator suspended from the report queue pending policy review." />
                        <Button size="sm" variant="outline" className="w-full" name="action" value="SUSPEND">
                          Suspend creator
                        </Button>
                      </form>
                    ) : null}

                    {report.canSuspendUser && report.targetUserId ? (
                      <form action={updateUserModerationStateAction} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                        <input type="hidden" name="userId" value={report.targetUserId} />
                        <input type="hidden" name="reportId" value={report.id} />
                        <input type="hidden" name="notes" value="User sign-in suspended from the moderation queue pending review." />
                        <Button size="sm" variant="outline" className="w-full" name="action" value="SUSPEND">
                          Suspend user
                        </Button>
                      </form>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-black/20 px-4 py-10 text-center text-sm text-muted-foreground">
              No reports are waiting in the moderation queue.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
