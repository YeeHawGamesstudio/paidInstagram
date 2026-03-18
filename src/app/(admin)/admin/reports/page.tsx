import Link from "next/link";
import { AlertTriangle, ShieldAlert, Siren } from "lucide-react";

import {
  takeDownReportedPostAction,
  updateCreatorModerationStateAction,
  updateModerationReportStatusAction,
  updateUserModerationStateAction,
} from "@/app/actions/moderation";
import { AdminEntityFacts } from "@/components/admin/admin-entity-facts";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getAdminReportSeverityLabel,
  getAdminReportSeverityTone,
  getAdminReportStatusTone,
  getAdminReportTargetLabel,
} from "@/lib/admin/presentation";
import { Textarea } from "@/components/ui/textarea";
import { getReportStatusLabel, listAdminModerationReports } from "@/lib/moderation/service";
import { cn } from "@/lib/utils";

type AdminReportsPageProps = {
  searchParams: Promise<{
    filter?: string;
  }>;
};

const reportFilters = ["active", "open", "reviewed", "resolved", "dismissed", "all"] as const;

type ReportFilter = (typeof reportFilters)[number];

function normalizeFilter(value: string | undefined): ReportFilter {
  return reportFilters.includes(value as ReportFilter) ? (value as ReportFilter) : "active";
}

function filterReportsByStatus<T extends { status: string }>(reports: T[], filter: ReportFilter) {
  if (filter === "active") {
    return reports.filter((report) => report.status === "OPEN" || report.status === "REVIEWED");
  }

  if (filter === "all") {
    return reports;
  }

  return reports.filter((report) => report.status.toLowerCase() === filter);
}

function buildReportsHref(filter: ReportFilter) {
  return filter === "active" ? "/admin/reports" : `/admin/reports?filter=${filter}`;
}

export default async function AdminReportsPage({ searchParams }: AdminReportsPageProps) {
  const [adminReports, params] = await Promise.all([listAdminModerationReports(), searchParams]);
  const activeFilter = normalizeFilter(params.filter);
  const visibleReports = filterReportsByStatus(adminReports, activeFilter);
  const openCount = adminReports.filter((report) => report.status === "OPEN").length;
  const reviewedCount = adminReports.filter((report) => report.status === "REVIEWED").length;
  const highPriorityCount = adminReports.filter(
    (report) => report.severity === "high" || report.severity === "critical",
  ).length;
  const visibleOpenCount = visibleReports.filter((report) => report.status === "OPEN").length;
  const visibleReviewedCount = visibleReports.filter((report) => report.status === "REVIEWED").length;
  const visibleHighPriorityCount = visibleReports.filter(
    (report) => report.severity === "high" || report.severity === "critical",
  ).length;
  const filterChips = [
    { label: `Active · ${filterReportsByStatus(adminReports, "active").length}`, value: "active" as const },
    { label: `Open · ${openCount}`, value: "open" as const },
    { label: `Reviewed · ${reviewedCount}`, value: "reviewed" as const },
    {
      label: `Resolved · ${adminReports.filter((report) => report.status === "RESOLVED").length}`,
      value: "resolved" as const,
    },
    {
      label: `Dismissed · ${adminReports.filter((report) => report.status === "DISMISSED").length}`,
      value: "dismissed" as const,
    },
    { label: `All · ${adminReports.length}`, value: "all" as const },
  ];
  const filterLabel =
    activeFilter === "active"
      ? "active queue"
      : activeFilter === "all"
        ? "all activity"
        : activeFilter;

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Reports and moderation"
        title="Moderation intake"
        description="Review reports, apply decisions, and log notes."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Open"
          value={visibleOpenCount}
          detail="Open items in this view."
          icon={Siren}
          labelClassName="text-rose-300"
        />

        <MetricCard
          label="High priority"
          value={visibleHighPriorityCount}
          detail="Urgent items in this view."
          icon={AlertTriangle}
          labelClassName="text-orange-300"
        />

        <MetricCard
          label="Reviewed"
          value={visibleReviewedCount}
          detail="Reviewed items in this view."
          icon={ShieldAlert}
          labelClassName="text-[var(--color-admin)]"
        />
      </section>

      <Card className="border-white/12 bg-[linear-gradient(180deg,_rgba(18,18,22,0.98),_rgba(11,11,14,0.96))] p-4 sm:p-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-admin)]">Report queue</p>
            <h2 className="mt-2 font-display text-3xl">
              {activeFilter === "all" ? "Report activity" : "Report cases"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{visibleReports.length} shown in {filterLabel}.</p>
          </div>
          <StatusBadge>
            {activeFilter === "active" ? "Live queue" : "History view"}
          </StatusBadge>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {filterChips.map((chip) => (
            <Link
              key={chip.value}
              href={buildReportsHref(chip.value)}
              className={cn(
                buttonVariants({ size: "sm", variant: activeFilter === chip.value ? "default" : "outline" }),
                activeFilter !== chip.value && "border-white/10 bg-white/[0.02]",
              )}
            >
              {chip.label}
            </Link>
          ))}
        </div>

        <div className="mt-5 grid gap-3">
          {visibleReports.length ? (
            visibleReports.map((report) => {
              const isActiveCase = report.status === "OPEN" || report.status === "REVIEWED";

              return (
                <div key={report.id} className="rounded-[1.5rem] border border-white/12 bg-black/25 p-3.5 sm:p-4">
                  <div className="grid gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge tone={getAdminReportSeverityTone(report.severity)}>
                          {getAdminReportSeverityLabel(report.severity)}
                        </StatusBadge>
                        <StatusBadge tone={getAdminReportStatusTone(report.status)}>
                          {getReportStatusLabel(report.status)}
                        </StatusBadge>
                        <StatusBadge>{getAdminReportTargetLabel(report.targetType)}</StatusBadge>
                      </div>

                      <p className="mt-3 text-lg font-semibold text-foreground">{report.targetLabel}</p>
                      <p className="mt-2 text-sm leading-6 text-foreground/72">{report.reason}</p>

                      <AdminEntityFacts
                        className="mt-4 xl:grid-cols-3"
                        items={[
                          { label: "Reporter", value: report.reporterLabel },
                          { label: "Opened", value: report.openedAt },
                          { label: "Assignee", value: report.assignee },
                        ]}
                      />

                      {report.subject || report.sourceUrl ? (
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          {report.subject ? (
                            <div className="rounded-2xl border border-white/12 bg-white/[0.045] px-4 py-3">
                              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Subject</p>
                              <p className="mt-1 text-sm font-medium">{report.subject}</p>
                            </div>
                          ) : null}
                          {report.sourceUrl ? (
                            <div className="rounded-2xl border border-white/12 bg-white/[0.045] px-4 py-3">
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

                      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.85fr)]">
                        <div className="rounded-[1.25rem] border border-white/12 bg-white/[0.045] px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Status</p>
                          <p className="mt-2 text-sm text-foreground/80">{report.actionState}</p>
                        </div>

                        <div className="rounded-[1.25rem] border border-white/12 bg-white/[0.045] px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Latest note</p>
                          {report.relatedNotes[0] ? (
                            <>
                              <p className="mt-2 text-sm font-medium text-foreground">
                                {report.relatedNotes[0].actor} · {report.relatedNotes[0].action}
                              </p>
                              <p className="mt-2 text-sm leading-6 text-foreground/72">{report.relatedNotes[0].notes}</p>
                            </>
                          ) : (
                            <p className="mt-2 text-sm text-muted-foreground">No moderator notes recorded yet.</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 rounded-[1.25rem] border border-white/12 bg-white/[0.045] px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">History</p>
                          <Link href="/admin/audit" className="text-xs text-muted-foreground transition hover:text-foreground">
                            Full audit trail
                          </Link>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-foreground/68">
                          {report.relatedNotes.length
                            ? `${report.relatedNotes.length} audit entr${report.relatedNotes.length === 1 ? "y" : "ies"} recorded for this case.`
                            : "No audit entries yet."}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      {isActiveCase ? (
                        <>
                          <form action={updateModerationReportStatusAction} className="grid gap-3 rounded-[1.5rem] border border-white/12 bg-white/[0.045] p-3.5 sm:p-4">
                            <input type="hidden" name="reportId" value={report.id} />
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Moderator note</p>
                              <Textarea
                                required
                                name="notes"
                                className="mt-2 min-h-24"
                                placeholder="Add what you reviewed and decided."
                              />
                              <p className="mt-2 text-xs text-muted-foreground">Required for audit history.</p>
                            </div>
                            <div className="rounded-[1.25rem] border border-white/12 bg-black/25 p-3">
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Primary decision</p>
                              <div className="mt-3 grid gap-2">
                                <Button className="w-full" size="sm" variant="outline" name="status" value="REVIEWED">
                                  Mark reviewed
                                </Button>
                                <Button className="w-full" size="sm" name="status" value="RESOLVED">
                                  Resolve and close case
                                </Button>
                                <Button className="w-full" size="sm" variant="ghost" name="status" value="DISMISSED">
                                  Dismiss report
                                </Button>
                              </div>
                            </div>
                          </form>

                          {report.canTakeDownPost ? (
                            <form action={takeDownReportedPostAction} className="grid gap-3 rounded-[1.5rem] border border-white/12 bg-white/[0.045] p-3.5 sm:p-4">
                              <input type="hidden" name="reportId" value={report.id} />
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Take down reported post</p>
                              <Textarea
                                required
                                name="notes"
                                className="min-h-20"
                                placeholder="Explain why the reported post is being removed."
                              />
                              <Button size="sm" variant="outline" className="mt-3 w-full">
                                Remove post from public visibility
                              </Button>
                            </form>
                          ) : null}

                          {report.canSuspendCreator && report.targetCreatorProfileId ? (
                            <form action={updateCreatorModerationStateAction} className="grid gap-3 rounded-[1.5rem] border border-white/12 bg-white/[0.045] p-3.5 sm:p-4">
                              <input type="hidden" name="creatorProfileId" value={report.targetCreatorProfileId} />
                              <input type="hidden" name="reportId" value={report.id} />
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Suspend creator account</p>
                              <Textarea
                                required
                                name="notes"
                                className="min-h-20"
                                placeholder="Explain why this creator account is being suspended."
                              />
                              <Button size="sm" variant="outline" className="mt-3 w-full" name="action" value="SUSPEND">
                                Suspend creator
                              </Button>
                            </form>
                          ) : null}

                          {report.canSuspendUser && report.targetUserId ? (
                            <form action={updateUserModerationStateAction} className="grid gap-3 rounded-[1.5rem] border border-white/12 bg-white/[0.045] p-3.5 sm:p-4">
                              <input type="hidden" name="userId" value={report.targetUserId} />
                              <input type="hidden" name="reportId" value={report.id} />
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Suspend user account</p>
                              <Textarea
                                required
                                name="notes"
                                className="min-h-20"
                                placeholder="Explain why this user account is being suspended."
                              />
                              <Button size="sm" variant="outline" className="mt-3 w-full" name="action" value="SUSPEND">
                                Suspend user
                              </Button>
                            </form>
                          ) : null}
                        </>
                      ) : (
                        <div className="rounded-[1.5rem] border border-white/12 bg-white/[0.045] p-3.5 sm:p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Closed case</p>
                          <p className="mt-3 text-sm text-muted-foreground">
                            This report is part of history and no longer appears in the active queue.
                          </p>
                          <Button asChild size="sm" variant="ghost" className="mt-4 w-full">
                            <Link href="/admin/audit">Open audit trail</Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-black/20 px-4 py-10 text-center text-sm text-muted-foreground">
              {activeFilter === "active"
                ? "No reports are waiting in the moderation queue."
                : "No reports match the selected status."}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
