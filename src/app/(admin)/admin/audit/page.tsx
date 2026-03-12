import { Eye, ScrollText, ShieldCheck } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { Card } from "@/components/ui/card";
import { listRecentAdminActions } from "@/lib/admin/audit";

export default async function AdminAuditPage() {
  const adminActionLog = await listRecentAdminActions(50);

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Audit visibility"
        title="Admin audit log"
        description="A dedicated surface for moderation and compliance event visibility, so future production actions can be reviewed without relying only on dashboard summaries."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Logged actions"
          value={adminActionLog.length}
          detail="Recent creator, report, and risk actions visible in one place."
          icon={ScrollText}
          labelClassName="text-[var(--color-admin)]"
        />
        <MetricCard
          label="Human-reviewed"
          value={adminActionLog.filter((entry) => entry.actor !== "Trust queue").length}
          detail="Entries directly attributed to a named internal reviewer."
          icon={Eye}
          labelClassName="text-amber-300"
        />
        <MetricCard
          label="Policy-linked"
          value={adminActionLog.filter((entry) => entry.category !== "risk-controls").length}
          detail="Actions that touch creator approval, reports, or enforcement visibility."
          icon={ShieldCheck}
          labelClassName="text-emerald-300"
        />
      </section>

      <Card className="border-white/10 bg-[linear-gradient(180deg,_rgba(18,18,22,0.98),_rgba(11,11,14,0.96))] p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-admin)]">Audit trail</p>
            <h2 className="mt-2 font-display text-3xl">Visible operational events</h2>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Placeholder log surface
          </span>
        </div>

        <div className="mt-5 grid gap-3">
          {adminActionLog.map((entry) => (
            <div key={entry.id} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                <span>{entry.category}</span>
                <span>{entry.when}</span>
              </div>
              <p className="mt-3 text-lg font-semibold text-foreground">
                {entry.actor} · {entry.action}
              </p>
              <p className="mt-2 text-sm text-foreground/82">{entry.target}</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{entry.notes}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
