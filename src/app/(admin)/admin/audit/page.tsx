import { Eye, ScrollText, ShieldCheck } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import { listRecentAdminActions } from "@/lib/admin/audit";
import { getAdminAuditCategoryLabel, getAdminAuditCategoryTone } from "@/lib/admin/presentation";

export default async function AdminAuditPage() {
  const adminActionLog = await listRecentAdminActions(50);
  const highlightedActions = adminActionLog.filter((entry) => !entry.isLowSignal);
  const routineActions = adminActionLog.filter((entry) => entry.isLowSignal);
  const groupedRoutineCount = routineActions.filter((entry) => (entry.groupedCount ?? 1) > 1).length;
  const notesCapturedCount = adminActionLog.filter((entry) => entry.hasNotes).length;

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Audit visibility"
        title="Admin audit log"
        description="Review recent moderation and compliance events."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Logged actions"
          value={adminActionLog.length}
          detail="Actions in this feed."
          icon={ScrollText}
          labelClassName="text-[var(--color-admin)]"
        />
        <MetricCard
          label="Notes captured"
          value={notesCapturedCount}
          detail="Entries with a moderator note."
          icon={Eye}
          labelClassName="text-amber-300"
        />
        <MetricCard
          label="Grouped routine"
          value={groupedRoutineCount}
          detail="Repeated low-signal actions collapsed."
          icon={ShieldCheck}
          labelClassName="text-emerald-300"
        />
      </section>

      <Card className="border-white/10 bg-[linear-gradient(180deg,_rgba(18,18,22,0.98),_rgba(11,11,14,0.96))] p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-admin)]">Audit trail</p>
            <h2 className="mt-2 font-display text-3xl">Recent events</h2>
          </div>
          <StatusBadge>Audit feed</StatusBadge>
        </div>

        <div className="mt-5 grid gap-5">
          {highlightedActions.length ? (
            <section className="grid gap-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Important actions</p>
                <p className="text-xs text-muted-foreground">{highlightedActions.length} shown</p>
              </div>
              <div className="grid gap-3">
                {highlightedActions.map((entry) => (
                  <div key={entry.id} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge tone={getAdminAuditCategoryTone(entry.category)}>
                        {getAdminAuditCategoryLabel(entry.category)}
                      </StatusBadge>
                      <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{entry.when}</span>
                    </div>
                    <p className="mt-3 text-lg font-semibold text-foreground">
                      {entry.actor} · {entry.action}
                    </p>
                    <p className="mt-2 text-sm text-foreground/82">{entry.target}</p>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{entry.notes}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-black/20 px-4 py-10 text-center text-sm text-muted-foreground">
              No high-signal audit entries are available right now.
            </div>
          )}

          {routineActions.length ? (
            <section className="grid gap-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Routine activity</p>
                <p className="text-xs text-muted-foreground">De-emphasized when no note was captured.</p>
              </div>
              <div className="grid gap-2">
                {routineActions.map((entry) => (
                  <div key={entry.id} className="rounded-[1.25rem] border border-white/8 bg-black/10 px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge tone={getAdminAuditCategoryTone(entry.category)}>
                        {getAdminAuditCategoryLabel(entry.category)}
                      </StatusBadge>
                      {(entry.groupedCount ?? 1) > 1 ? (
                        <StatusBadge>{entry.groupedCount} similar actions</StatusBadge>
                      ) : null}
                      <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{entry.when}</span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-foreground/88">
                      {entry.actor} · {entry.action}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{entry.target}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{entry.notes}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
