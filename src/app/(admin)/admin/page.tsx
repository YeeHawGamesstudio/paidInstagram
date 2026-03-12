import Link from "next/link";
import { Activity, ArrowRight, BadgeCheck, ClipboardList, ScrollText, ShieldAlert, Users } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listRecentAdminActions } from "@/lib/admin/audit";
import {
  adminCreators,
  adminReports,
  adminReviewQueue,
  getCreatorStateLabel,
  getReportStatusLabel,
} from "@/lib/admin/demo-data";
import { getOperationalReadinessSnapshot } from "@/lib/operations/readiness";
import { getAdminCreatorStateTone, getAdminReportStatusTone } from "@/lib/admin/presentation";

const moderationControlStates = [
  {
    label: "Report SLA routing",
    state: "Healthy",
    detail: "Open critical reports are routed to manual review.",
  },
  {
    label: "Creator compliance",
    state: "Pending",
    detail: "Creator approval and verification states are now visible separately.",
  },
  {
    label: "18+ access gate",
    state: "Scaffolded",
    detail: "Public adult access now routes through an acknowledgment checkpoint.",
  },
  {
    label: "Audit visibility",
    state: "Active",
    detail: "Admin actions have a dedicated log surface for later expansion.",
  },
] as const;

export default async function AdminPage() {
  const approvalQueue = adminCreators.filter((creator) => creator.state !== "APPROVED").slice(0, 3);
  const priorityReports = adminReports.slice(0, 3);
  const recentReviews = adminReviewQueue.slice(0, 3);
  const recentAdminActions = await listRecentAdminActions(4);
  const operationalReadiness = await getOperationalReadinessSnapshot();
  const readinessTone =
    operationalReadiness.status === "fail"
      ? "bg-destructive/10 text-destructive"
      : operationalReadiness.status === "warn"
        ? "bg-amber-500/10 text-amber-300"
        : "bg-emerald-500/10 text-emerald-300";
  const readinessLabel =
    operationalReadiness.status === "fail"
      ? "Action required"
      : operationalReadiness.status === "warn"
        ? "Needs review"
        : "Healthy";

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Admin dashboard"
        title="Operational dashboard"
        description="A single admin surface for creator approvals, moderation intake, user oversight, and content review queues."
        actions={
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/admin/reports">Open reports</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/creators">Review creators</Link>
            </Button>
          </div>
        }
      />

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
        <Card className="border-white/10 bg-white/[0.04] p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-admin)]">
                Operations
              </p>
              <h2 className="mt-2 font-display text-3xl">Readiness status</h2>
            </div>
            <Activity className="size-5 text-[var(--color-admin)]" />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${readinessTone}`}>
              {readinessLabel}
            </span>
            <span className="text-sm text-muted-foreground">
              {operationalReadiness.summary.pass} pass · {operationalReadiness.summary.warn} warn · {operationalReadiness.summary.fail} fail
            </span>
          </div>

          <div className="mt-5 grid gap-3">
            {operationalReadiness.checks.map((check) => (
              <div key={check.id} className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">{check.label}</p>
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                      check.status === "fail"
                        ? "bg-destructive/10 text-destructive"
                        : check.status === "warn"
                          ? "bg-amber-500/10 text-amber-300"
                          : "bg-emerald-500/10 text-emerald-300"
                    }`}
                  >
                    {check.status}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{check.detail}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-admin)]">Support guidance</p>
          <h2 className="mt-2 font-display text-3xl">When something breaks</h2>
          <div className="mt-5 grid gap-3">
            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3">
              <p className="text-sm font-medium text-foreground">Check runtime readiness first</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Use <span className="font-mono text-foreground">/api/health</span> to confirm database connectivity and environment-level warnings before escalating.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3">
              <p className="text-sm font-medium text-foreground">Use request IDs during triage</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                API responses now include a request identifier so logs can be correlated across support tickets, webhook failures, and media delivery issues.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3">
              <p className="text-sm font-medium text-foreground">Review the operations runbook</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Operational assumptions, backup expectations, and staging versus production guidance are documented in <span className="font-mono text-foreground">docs/operations-readiness.md</span>.
              </p>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
        <Card className="border-white/10 bg-[linear-gradient(180deg,_rgba(18,18,22,0.98),_rgba(11,11,14,0.96))] p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-admin)]">Creator approvals</p>
              <h2 className="mt-2 font-display text-3xl">Next decisions</h2>
            </div>
            <Button asChild variant="ghost">
              <Link href="/admin/creators">Full queue</Link>
            </Button>
          </div>

          <div className="mt-5 grid gap-3">
            {approvalQueue.map((creator) => (
              <div key={creator.id} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold">{creator.displayName}</p>
                      <StatusBadge tone={getAdminCreatorStateTone(creator.state)}>
                        {getCreatorStateLabel(creator.state)}
                      </StatusBadge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {creator.handle} · {creator.category} · {creator.pricingLabel}
                    </p>
                    <p className="mt-3 text-sm text-foreground/80">{creator.actionState}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button size="sm">Approve</Button>
                    <Button size="sm" variant="outline">
                      Suspend
                    </Button>
                    <Button size="sm" variant="ghost" disabled>
                      Escalate
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-admin)]">Control states</p>
          <h2 className="mt-2 font-display text-3xl">Moderation systems</h2>
          <div className="mt-5 grid gap-3">
            {moderationControlStates.map((item) => (
              <div key={item.label} className="rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {item.state}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="border-white/10 bg-white/[0.04] p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-admin)]">Reports</p>
              <h2 className="mt-2 font-display text-3xl">Priority moderation queue</h2>
            </div>
            <ShieldAlert className="size-5 text-[var(--color-admin)]" />
          </div>

          <div className="mt-5 grid gap-3">
            {priorityReports.map((report) => (
              <div key={report.id} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge tone={getAdminReportStatusTone(report.status)}>
                    {getReportStatusLabel(report.status)}
                  </StatusBadge>
                  <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{report.severity} severity</span>
                </div>
                <p className="mt-3 font-semibold">{report.targetLabel}</p>
                <p className="mt-2 text-sm text-muted-foreground">{report.reason}</p>
                <div className="mt-4 flex items-center justify-between gap-3 text-sm text-foreground/80">
                  <span>{report.actionState}</span>
                  <span>{report.openedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-white/10 bg-white/[0.04] p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-admin)]">Content review</p>
              <h2 className="mt-2 font-display text-3xl">Pending queue</h2>
            </div>
            <ClipboardList className="size-5 text-[var(--color-admin)]" />
          </div>

          <div className="mt-5 grid gap-3">
            {recentReviews.map((item) => (
              <div key={item.id} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-foreground">{item.creatorLabel}</p>
                  <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.queue}</span>
                </div>
                <p className="mt-2 text-sm text-foreground/80">{item.summary}</p>
                <p className="mt-3 text-sm text-muted-foreground">{item.actionState}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card className="border-white/10 bg-white/[0.04] p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-admin)]">Recent actions</p>
              <h2 className="mt-2 font-display text-3xl">Internal log</h2>
            </div>
            <Users className="size-5 text-[var(--color-admin)]" />
          </div>

          <div className="mt-5 grid gap-3">
            {recentAdminActions.map((entry) => (
              <div key={entry.id} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-medium text-foreground">
                  {entry.actor} · {entry.action}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{entry.target}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">{entry.when}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/admin/creators" className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 transition hover:border-[var(--color-admin)]/30">
            <BadgeCheck className="size-5 text-[var(--color-admin)]" />
            <h3 className="mt-4 text-lg font-semibold">Manage creators</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Review approval state, suspend risky accounts, and inspect creator-facing action notes.
            </p>
          </Link>

          <Link href="/admin/users" className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 transition hover:border-[var(--color-admin)]/30">
            <Users className="size-5 text-[var(--color-admin)]" />
            <h3 className="mt-4 text-lg font-semibold">View users</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Check roles, account lifecycle, billing watch states, and placeholder restriction controls.
            </p>
          </Link>

          <Link href="/admin/review" className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 transition hover:border-[var(--color-admin)]/30">
            <ArrowRight className="size-5 text-[var(--color-admin)]" />
            <h3 className="mt-4 text-lg font-semibold">Open review queue</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Process queued profile edits, posts, and message templates with structured moderation states.
            </p>
          </Link>

          <Link href="/admin/audit" className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 transition hover:border-[var(--color-admin)]/30">
            <ScrollText className="size-5 text-[var(--color-admin)]" />
            <h3 className="mt-4 text-lg font-semibold">Audit trail</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Inspect recent moderation and compliance events from a dedicated admin log surface.
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
