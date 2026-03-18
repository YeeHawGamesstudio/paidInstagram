import Link from "next/link";
import { ClipboardCheck, Eye, ShieldCheck } from "lucide-react";

import {
  takeDownReportedPostAction,
  updateCreatorModerationStateAction,
  updateModerationReportStatusAction,
} from "@/app/actions/moderation";
import { AdminEntityFacts } from "@/components/admin/admin-entity-facts";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getAdminReviewQueueLabel, getAdminReviewRiskTone } from "@/lib/admin/presentation";
import { getReportStatusLabel, getReviewQueueCountByRisk, listAdminModerationReviewQueue } from "@/lib/moderation/service";
import { cn } from "@/lib/utils";

type AdminReviewPageProps = {
  searchParams: Promise<{
    filter?: string;
  }>;
};

const reviewFilters = ["active", "open", "reviewed", "resolved", "dismissed", "all"] as const;

type ReviewFilter = (typeof reviewFilters)[number];

function normalizeFilter(value: string | undefined): ReviewFilter {
  return reviewFilters.includes(value as ReviewFilter) ? (value as ReviewFilter) : "active";
}

function filterReviewItemsByStatus<T extends { status: string }>(items: T[], filter: ReviewFilter) {
  if (filter === "active") {
    return items.filter((item) => item.status === "OPEN" || item.status === "REVIEWED");
  }

  if (filter === "all") {
    return items;
  }

  return items.filter((item) => item.status.toLowerCase() === filter);
}

function buildReviewHref(filter: ReviewFilter) {
  return filter === "active" ? "/admin/review" : `/admin/review?filter=${filter}`;
}

export default async function AdminReviewPage({ searchParams }: AdminReviewPageProps) {
  const [adminReviewQueue, params] = await Promise.all([listAdminModerationReviewQueue(), searchParams]);
  const activeFilter = normalizeFilter(params.filter);
  const visibleItems = filterReviewItemsByStatus(adminReviewQueue, activeFilter);
  const visibleNeedsReviewCount = visibleItems.filter((item) => item.riskBand !== "low").length;
  const visibleLowRiskCount = getReviewQueueCountByRisk(visibleItems, "low");
  const openCount = adminReviewQueue.filter((item) => item.status === "OPEN").length;
  const reviewedCount = adminReviewQueue.filter((item) => item.status === "REVIEWED").length;
  const filterChips = [
    { label: `Active · ${filterReviewItemsByStatus(adminReviewQueue, "active").length}`, value: "active" as const },
    { label: `Open · ${openCount}`, value: "open" as const },
    { label: `Reviewed · ${reviewedCount}`, value: "reviewed" as const },
    {
      label: `Resolved · ${adminReviewQueue.filter((item) => item.status === "RESOLVED").length}`,
      value: "resolved" as const,
    },
    {
      label: `Dismissed · ${adminReviewQueue.filter((item) => item.status === "DISMISSED").length}`,
      value: "dismissed" as const,
    },
    { label: `All · ${adminReviewQueue.length}`, value: "all" as const },
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
        eyebrow="Content review"
        title="Review queue"
        description="Review queued content and leave a clear decision."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Items shown"
          value={visibleItems.length}
          detail="Items in this view."
          icon={ClipboardCheck}
          labelClassName="text-[var(--color-admin)]"
        />

        <MetricCard
          label="Needs human review"
          value={visibleNeedsReviewCount}
          detail="Requires manual review in this view."
          icon={Eye}
          labelClassName="text-amber-300"
        />

        <MetricCard
          label="Low risk"
          value={visibleLowRiskCount}
          detail="Low-risk items in this view."
          icon={ShieldCheck}
          labelClassName="text-emerald-300"
        />
      </section>

      <Card className="border-white/12 bg-[linear-gradient(180deg,_rgba(18,18,22,0.98),_rgba(11,11,14,0.96))] p-4 sm:p-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-admin)]">Moderation queue</p>
            <h2 className="mt-2 font-display text-3xl">
              {activeFilter === "all" ? "Review activity" : "Review items"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{visibleItems.length} shown in {filterLabel}.</p>
          </div>
          <StatusBadge>
            {activeFilter === "active" ? "Live queue" : "History view"}
          </StatusBadge>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {filterChips.map((chip) => (
            <Link
              key={chip.value}
              href={buildReviewHref(chip.value)}
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
          {visibleItems.length ? (
            visibleItems.map((item) => {
              const isActiveItem = item.status === "OPEN" || item.status === "REVIEWED";
              const detailFlags = item.flags.filter((flag) => flag.startsWith("subject:"));

              return (
                <div key={item.id} className="rounded-[1.5rem] border border-white/12 bg-black/25 p-3.5 sm:p-4">
                  <div className="grid gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge>{getAdminReviewQueueLabel(item.queue)}</StatusBadge>
                        <StatusBadge tone={getAdminReviewRiskTone(item.riskBand)}>
                          {item.riskBand === "high" ? "High risk" : item.riskBand === "medium" ? "Medium risk" : "Low risk"}
                        </StatusBadge>
                        <StatusBadge tone={item.status === "OPEN" ? "danger" : item.status === "REVIEWED" ? "info" : "success"}>
                          {getReportStatusLabel(item.status)}
                        </StatusBadge>
                      </div>

                      <p className="mt-3 text-lg font-semibold text-foreground">{item.creatorLabel}</p>
                      <p className="mt-2 text-sm leading-6 text-foreground/72">{item.summary}</p>

                      {detailFlags.length ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {detailFlags.map((flag) => (
                            <StatusBadge key={flag}>
                              {flag.replace("subject:", "Subject: ").trim()}
                            </StatusBadge>
                          ))}
                        </div>
                      ) : null}

                      <AdminEntityFacts
                        className="mt-4 xl:grid-cols-2"
                        items={[
                          { label: "Submitted", value: item.submittedAt },
                          { label: "Status", value: item.actionState },
                        ]}
                      />

                      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.85fr)]">
                        <div className="rounded-[1.25rem] border border-white/12 bg-white/[0.045] px-4 py-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Latest note</p>
                            {item.resolutionHref ? (
                              <Link href={item.resolutionHref} className="text-xs text-muted-foreground transition hover:text-foreground">
                                View source
                              </Link>
                            ) : null}
                          </div>
                          {item.relatedNotes[0] ? (
                            <>
                              <p className="mt-3 text-sm font-medium text-foreground">
                                {item.relatedNotes[0].actor} · {item.relatedNotes[0].action}
                              </p>
                              <p className="mt-2 text-sm leading-6 text-foreground/72">{item.relatedNotes[0].notes}</p>
                            </>
                          ) : (
                            <p className="mt-3 text-sm text-muted-foreground">No moderation notes recorded yet.</p>
                          )}
                        </div>

                        <div className="rounded-[1.25rem] border border-white/12 bg-white/[0.045] px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">History</p>
                          <p className="mt-3 text-sm leading-6 text-foreground/68">
                            {item.relatedNotes.length
                              ? `${item.relatedNotes.length} moderation entr${item.relatedNotes.length === 1 ? "y" : "ies"} recorded.`
                              : "No history recorded yet."}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-[1.25rem] border border-white/12 bg-white/[0.045] px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Queue summary</p>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-foreground/68">
                          Review this item, leave a note, then record the exact moderation outcome from the action rail.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      {isActiveItem ? (
                        <>
                          <form action={updateModerationReportStatusAction} className="grid gap-3 rounded-[1.5rem] border border-white/12 bg-white/[0.045] p-3.5 sm:p-4">
                            <input type="hidden" name="reportId" value={item.reportId} />
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Review note</p>
                              <Textarea
                                required
                                name="notes"
                                className="mt-2 min-h-24"
                                placeholder="Add the decision and any follow-up."
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
                                  Resolve and close item
                                </Button>
                              </div>
                            </div>
                          </form>

                          {item.queue === "post" ? (
                            <form action={takeDownReportedPostAction} className="grid gap-3 rounded-[1.5rem] border border-white/12 bg-white/[0.045] p-3.5 sm:p-4">
                              <input type="hidden" name="reportId" value={item.reportId} />
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

                          {item.targetCreatorProfileId ? (
                            <form action={updateCreatorModerationStateAction} className="grid gap-3 rounded-[1.5rem] border border-white/12 bg-white/[0.045] p-3.5 sm:p-4">
                              <input type="hidden" name="creatorProfileId" value={item.targetCreatorProfileId} />
                              <input type="hidden" name="reportId" value={item.reportId} />
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
                        </>
                      ) : (
                        <div className="rounded-[1.5rem] border border-white/12 bg-white/[0.045] p-3.5 sm:p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Closed item</p>
                          <p className="mt-3 text-sm text-muted-foreground">
                            This record is part of queue history and is no longer awaiting moderation action.
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
                ? "No content items are currently waiting on moderation review."
                : "No review items match the selected status."}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
