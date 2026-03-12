import { Shield, UserCog, Users } from "lucide-react";

import { updateUserModerationStateAction } from "@/app/actions/moderation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getRoleLabel } from "@/lib/admin/demo-data";
import {
  getAdminUserAdultAccessTone,
  getAdminUserRiskLabel,
  getAdminUserRiskTone,
} from "@/lib/admin/presentation";
import { Textarea } from "@/components/ui/textarea";
import { getUserAdultAccessStatusLabel } from "@/lib/compliance/scaffolding";
import { listAdminModerationUsers } from "@/lib/moderation/service";

export default async function AdminUsersPage() {
  const adminUsers = await listAdminModerationUsers();

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="User management"
        title="User oversight"
        description="Review platform users, suspend abusive accounts when needed, restore cleared users, and retain moderation notes in the audit trail."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Visible accounts"
          value={adminUsers.length}
          detail="Representative mix of fan, creator, and admin users."
          icon={Users}
          labelClassName="text-[var(--color-admin)]"
        />

        <MetricCard
          label="Under watch"
          value={adminUsers.filter((user) => user.riskState === "watch").length}
          detail="Users with billing, trust, or behavioral review flags."
          icon={Shield}
          labelClassName="text-amber-300"
        />

        <MetricCard
          label="Restricted"
          value={adminUsers.filter((user) => user.riskState === "restricted").length}
          detail="Accounts with placeholder messaging or access limitations applied."
          icon={UserCog}
          labelClassName="text-rose-300"
        />
      </section>

      <Card className="border-white/10 bg-[linear-gradient(180deg,_rgba(18,18,22,0.98),_rgba(11,11,14,0.96))] p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-admin)]">Account directory</p>
            <h2 className="mt-2 font-display text-3xl">Users and action states</h2>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Logged controls
          </span>
        </div>

        <div className="mt-5 grid gap-3">
          {adminUsers.length ? (
            adminUsers.map((user) => (
              <div key={user.id} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold text-foreground">{user.displayName}</p>
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        {getRoleLabel(user.role)}
                      </span>
                      <StatusBadge tone={getAdminUserRiskTone(user.riskState)}>
                        {getAdminUserRiskLabel(user.riskState)}
                      </StatusBadge>
                      <StatusBadge tone={getAdminUserAdultAccessTone(user.adultAccessStatus)}>
                        {getUserAdultAccessStatusLabel(user.adultAccessStatus)}
                      </StatusBadge>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">{user.handle}</p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-4">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Lifecycle</p>
                        <p className="mt-1 text-sm font-medium">{user.lifecycle}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Spend / status</p>
                        <p className="mt-1 text-sm font-medium">{user.spendLabel}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Recent activity</p>
                        <p className="mt-1 text-sm font-medium">{user.lastSeen}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Adult access</p>
                        <p className="mt-1 text-sm font-medium">{getUserAdultAccessStatusLabel(user.adultAccessStatus)}</p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Current action state</p>
                      <p className="mt-2 text-sm leading-6 text-foreground/80">{user.actionState}</p>
                    </div>

                    <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-white/[0.03] px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Recent moderation notes</p>
                      <div className="mt-3 grid gap-3">
                        {user.relatedNotes.length ? (
                          user.relatedNotes.slice(0, 3).map((note) => (
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

                  <form action={updateUserModerationStateAction} className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                    <input type="hidden" name="userId" value={user.userId} />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Moderator note</p>
                      <Textarea
                        name="notes"
                        className="mt-2 min-h-24"
                        placeholder="Explain why access is being suspended or restored."
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" name="action" value="SUSPEND">
                        Suspend account
                      </Button>
                      <Button size="sm" variant="ghost" name="action" value="RESTORE">
                        Restore account
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-black/20 px-4 py-10 text-center text-sm text-muted-foreground">
              No users are currently available in the admin oversight list.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
