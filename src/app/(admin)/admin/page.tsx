import Link from "next/link";
import { AlertTriangle, ArrowRight, BadgeCheck, ClipboardList, ScrollText, ShieldAlert, Users } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listRecentAdminActions } from "@/lib/admin/audit";
import { getOperationalReadinessSnapshot } from "@/lib/operations/readiness";
import {
  getAdminAuditCategoryLabel,
  getAdminAuditCategoryTone,
  getAdminCreatorApprovalBadgeLabel,
  getAdminCreatorApprovalTone,
  getAdminCreatorVerificationBadgeLabel,
  getAdminCreatorVerificationTone,
  getAdminReportSeverityLabel,
  getAdminReportSeverityTone,
  getAdminReportStatusTone,
  getAdminUserRiskLabel,
  getAdminUserRiskTone,
} from "@/lib/admin/presentation";
import {
  getReportStatusLabel,
  listAdminModerationCreators,
  listAdminModerationReports,
  listAdminModerationReviewQueue,
  listAdminModerationUsers,
} from "@/lib/moderation/service";

const moderationControlStates = [
  { label: "Report SLA routing", state: "Healthy" },
  { label: "Creator compliance", state: "Pending" },
  { label: "18+ access gate", state: "Active" },
  { label: "Audit visibility", state: "Active" },
] as const;

export default async function AdminPage() {
  const [adminCreators, adminReports, adminReviewQueue, adminUsers, recentAdminActions, operationalReadiness] = await Promise.all([
    listAdminModerationCreators(),
    listAdminModerationReports(),
    listAdminModerationReviewQueue(),
    listAdminModerationUsers(),
    listRecentAdminActions(4),
    getOperationalReadinessSnapshot(),
  ]);
  const approvalQueue = adminCreators.filter((creator) => creator.state !== "APPROVED");
  const priorityReports = adminReports.filter((report) => report.status === "OPEN" || report.severity === "critical").slice(0, 3);
  const recentReviews = adminReviewQueue.filter((item) => item.status === "OPEN" || item.status === "REVIEWED").slice(0, 3);
  const riskyAccounts = adminUsers.filter((user) => user.riskState !== "normal").slice(0, 3);
  const readinessIssues = operationalReadiness.checks.filter((check) => check.status !== "pass");
  const readinessTone =
    operationalReadiness.status === "fail" ? "danger" : operationalReadiness.status === "warn" ? "warning" : "success";
  const readinessLabel =
    operationalReadiness.status === "fail"
      ? "Action required"
      : operationalReadiness.status === "warn"
        ? "Needs review"
        : "Healthy";
  const priorityCards = [
    {
      label: "Open reports",
      value: String(adminReports.filter((report) => report.status === "OPEN").length),
      detail: priorityReports[0]?.actionState ?? "No active report escalations.",
      href: "/admin/reports",
      cta: "Review reports",
    },
    {
      label: "Creator decisions",
      value: String(approvalQueue.length),
      detail: approvalQueue[0]?.actionState ?? "No creators waiting on a decision.",
      href: "/admin/creators",
      cta: "Review creators",
    },
    {
      label: "Risk accounts",
      value: String(riskyAccounts.length),
      detail: riskyAccounts[0]?.actionState ?? "No accounts need attention.",
      href: "/admin/users",
      cta: "Open users",
    },
    {
      label: "Readiness issues",
      value: String(readinessIssues.length),
      detail: readinessIssues[0]?.detail ?? "All readiness checks are passing.",
      href: "/admin/review",
      cta: "Review queue",
    },
  ] as const;

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        title="Dashboard"
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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {priorityCards.map((item) => (
          <Card key={item.label} className="border-white/12 bg-white/[0.05] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-admin)]">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold text-foreground">{item.value}</p>
            <p className="mt-2 min-h-12 text-sm leading-5 text-foreground/72">{item.detail}</p>
            <Button asChild size="sm" variant="ghost" className="mt-4 px-0 text-foreground hover:bg-transparent">
              <Link href={item.href}>{item.cta}</Link>
            </Button>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
        <Card className="border-white/12 bg-white/[0.05] p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-admin)]">Reports</p>
              <h2 className="mt-2 font-display text-3xl">Urgent moderation queue</h2>
            </div>
            <ShieldAlert className="size-5 text-[var(--color-admin)]" />
          </div>

          <div className="mt-5 grid gap-3">
            {priorityReports.length ? (
              priorityReports.map((report) => (
                <div key={report.id} className="rounded-[1.5rem] border border-white/12 bg-black/25 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge tone={getAdminReportStatusTone(report.status)}>
                      {getReportStatusLabel(report.status)}
                    </StatusBadge>
                    <StatusBadge tone={getAdminReportSeverityTone(report.severity)}>
                      {getAdminReportSeverityLabel(report.severity)}
                    </StatusBadge>
                  </div>
                  <p className="mt-3 font-semibold">{report.targetLabel}</p>
                  <p className="mt-2 text-sm leading-6 text-foreground/72">{report.reason}</p>
                  <div className="mt-4 flex items-center justify-between gap-3 text-sm text-foreground/78">
                    <span>{report.actionState}</span>
                    <span>{report.openedAt}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-black/20 px-4 py-10 text-center text-sm text-muted-foreground">
                No urgent reports are waiting right now.
              </div>
            )}
          </div>
        </Card>

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
            {approvalQueue.slice(0, 3).map((creator) => (
              <div key={creator.id} className="rounded-[1.5rem] border border-white/12 bg-black/25 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold">{creator.displayName}</p>
                      <StatusBadge tone={getAdminCreatorApprovalTone(creator.approvalStatus)}>
                        {getAdminCreatorApprovalBadgeLabel(creator.approvalStatus)}
                      </StatusBadge>
                      {creator.verificationStatus !== "VERIFIED" ? (
                        <StatusBadge tone={getAdminCreatorVerificationTone(creator.verificationStatus)}>
                          {getAdminCreatorVerificationBadgeLabel(creator.verificationStatus)}
                        </StatusBadge>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-foreground/68">
                      {creator.handle} · {creator.category} · {creator.pricingLabel}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-foreground/76">{creator.actionState}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm">
                      <Link href="/admin/creators">
                        {creator.canRestore ? "Restore creator" : creator.canApprove ? "Review approval" : "Review creator"}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.9fr)]">
        <Card className="border-white/12 bg-white/[0.05] p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-admin)]">
                Operations
              </p>
              <h2 className="mt-2 font-display text-3xl">Readiness focus</h2>
            </div>
            <AlertTriangle className="size-5 text-[var(--color-admin)]" />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <StatusBadge tone={readinessTone}>
              {readinessLabel}
            </StatusBadge>
            <span className="text-sm text-muted-foreground">
              {operationalReadiness.summary.pass} pass · {operationalReadiness.summary.warn} warn · {operationalReadiness.summary.fail} fail
            </span>
          </div>

          <div className="mt-5 grid gap-3">
            {readinessIssues.length ? (
              readinessIssues.map((check) => (
                <div key={check.id} className="rounded-[1.5rem] border border-white/12 bg-black/25 px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">{check.label}</p>
                    <StatusBadge tone={check.status === "fail" ? "danger" : "warning"}>
                      {check.status}
                    </StatusBadge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-foreground/72">{check.detail}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-white/12 bg-black/25 px-4 py-5">
                <p className="text-sm font-medium text-foreground">No active readiness issues</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  All current checks are passing in this environment.
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card className="border-white/12 bg-white/[0.05] p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-admin)]">Accounts</p>
              <h2 className="mt-2 font-display text-3xl">Risk watchlist</h2>
            </div>
            <Users className="size-5 text-[var(--color-admin)]" />
          </div>

          <div className="mt-5 grid gap-3">
            {riskyAccounts.length ? (
              riskyAccounts.map((user) => (
                <div key={user.id} className="rounded-[1.5rem] border border-white/12 bg-black/25 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{user.displayName}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{user.handle}</p>
                    </div>
                    <StatusBadge tone={getAdminUserRiskTone(user.riskState)}>
                      {getAdminUserRiskLabel(user.riskState)}
                    </StatusBadge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-foreground/76">{user.actionState}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-black/20 px-4 py-10 text-center text-sm text-muted-foreground">
                No risky accounts are queued right now.
              </div>
            )}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="border-white/12 bg-white/[0.05] p-5">
          <h2 className="font-display text-3xl">Systems</h2>
          <div className="mt-5 grid gap-3">
            {moderationControlStates.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-[1.5rem] border border-white/12 bg-black/25 px-4 py-3">
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <StatusBadge
                  tone={
                    item.state === "Healthy" || item.state === "Active"
                      ? "success"
                      : item.state === "Pending"
                        ? "warning"
                        : "info"
                  }
                >
                  {item.state}
                </StatusBadge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-white/12 bg-white/[0.05] p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-admin)]">Content review</p>
              <h2 className="mt-2 font-display text-3xl">Review queue</h2>
            </div>
            <ClipboardList className="size-5 text-[var(--color-admin)]" />
          </div>

          <div className="mt-5 grid gap-3">
            {recentReviews.map((item) => (
              <div key={item.id} className="rounded-[1.5rem] border border-white/12 bg-black/25 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-foreground">{item.creatorLabel}</p>
                  <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.queue}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-foreground/76">{item.summary}</p>
                <p className="mt-3 text-sm leading-6 text-foreground/68">{item.actionState}</p>
                <Button asChild size="sm" variant="ghost" className="mt-3 px-0 text-foreground hover:bg-transparent">
                  <Link href="/admin/review">Open review queue</Link>
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        

        <Card className="border-white/12 bg-white/[0.05] p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-admin)]">Recent actions</p>
              <h2 className="mt-2 font-display text-3xl">Recent audit activity</h2>
            </div>
            <Users className="size-5 text-[var(--color-admin)]" />
          </div>

          <div className="mt-5 grid gap-3">
            {recentAdminActions.map((entry) => (
              <div key={entry.id} className="rounded-[1.5rem] border border-white/12 bg-black/25 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge tone={getAdminAuditCategoryTone(entry.category)}>
                    {getAdminAuditCategoryLabel(entry.category)}
                  </StatusBadge>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{entry.when}</p>
                </div>
                <p className="mt-3 text-sm font-medium text-foreground">
                  {entry.actor} · {entry.action}
                </p>
                <p className="mt-1 text-sm text-foreground/68">{entry.target}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/admin/creators" className="rounded-[1.5rem] border border-white/12 bg-white/[0.05] p-5 transition hover:border-[var(--color-admin)]/30">
            <BadgeCheck className="size-5 text-[var(--color-admin)]" />
            <h3 className="mt-4 text-lg font-semibold">Manage creators</h3>
          </Link>

          <Link href="/admin/users" className="rounded-[1.5rem] border border-white/12 bg-white/[0.05] p-5 transition hover:border-[var(--color-admin)]/30">
            <Users className="size-5 text-[var(--color-admin)]" />
            <h3 className="mt-4 text-lg font-semibold">View users</h3>
          </Link>

          <Link href="/admin/review" className="rounded-[1.5rem] border border-white/12 bg-white/[0.05] p-5 transition hover:border-[var(--color-admin)]/30">
            <ArrowRight className="size-5 text-[var(--color-admin)]" />
            <h3 className="mt-4 text-lg font-semibold">Review queue</h3>
          </Link>

          <Link href="/admin/audit" className="rounded-[1.5rem] border border-white/12 bg-white/[0.05] p-5 transition hover:border-[var(--color-admin)]/30">
            <ScrollText className="size-5 text-[var(--color-admin)]" />
            <h3 className="mt-4 text-lg font-semibold">Audit trail</h3>
          </Link>
        </div>
      </section>
    </div>
  );
}
