import Link from "next/link";
import { Shield, UserCog, Users } from "lucide-react";

import { updateUserModerationStateAction } from "@/app/actions/moderation";
import { AdminEntityFacts } from "@/components/admin/admin-entity-facts";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminModerationActionRail } from "@/components/admin/admin-moderation-action-rail";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { EmptyStateCard } from "@/components/shared/empty-state-card";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getRoleLabel } from "@/lib/admin/demo-data";
import {
  getAdminUserAdultAccessBadgeLabel,
  getAdminUserAdultAccessTone,
  getAdminUserRiskLabel,
  getAdminUserRiskTone,
} from "@/lib/admin/presentation";
import { type ModerationUserRecord, listAdminModerationUsers } from "@/lib/moderation/service";
import { cn } from "@/lib/utils";

type AdminUsersPageProps = {
  searchParams: Promise<{
    q?: string;
    filter?: string;
    sort?: string;
    selected?: string;
  }>;
};

const userFilters = ["all", "watch", "restricted", "creator", "fan", "admin"] as const;
const userSorts = ["activity", "risk", "moderated"] as const;

type UserFilter = (typeof userFilters)[number];
type UserSort = (typeof userSorts)[number];

function normalizeFilter(value: string | undefined): UserFilter {
  return userFilters.includes(value as UserFilter) ? (value as UserFilter) : "all";
}

function normalizeSort(value: string | undefined): UserSort {
  return userSorts.includes(value as UserSort) ? (value as UserSort) : "activity";
}

function timestamp(value: string | undefined) {
  return value ? new Date(value).getTime() : 0;
}

function sortUsers(users: ModerationUserRecord[], sort: UserSort) {
  const riskOrder: Record<ModerationUserRecord["riskState"], number> = {
    restricted: 0,
    watch: 1,
    normal: 2,
  };

  return [...users].sort((left, right) => {
    if (sort === "risk") {
      return (
        riskOrder[left.riskState] - riskOrder[right.riskState] ||
        timestamp(right.lastModeratedAt) - timestamp(left.lastModeratedAt) ||
        timestamp(right.lastSeenAt) - timestamp(left.lastSeenAt)
      );
    }

    if (sort === "moderated") {
      return (
        timestamp(right.lastModeratedAt) - timestamp(left.lastModeratedAt) ||
        riskOrder[left.riskState] - riskOrder[right.riskState] ||
        timestamp(right.lastSeenAt) - timestamp(left.lastSeenAt)
      );
    }

    return (
      timestamp(right.lastSeenAt) - timestamp(left.lastSeenAt) ||
      riskOrder[left.riskState] - riskOrder[right.riskState] ||
      left.displayName.localeCompare(right.displayName)
    );
  });
}

function filterUsers(users: ModerationUserRecord[], filter: UserFilter, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  return users.filter((user) => {
    const matchesQuery =
      !normalizedQuery ||
      user.displayName.toLowerCase().includes(normalizedQuery) ||
      user.handle.toLowerCase().includes(normalizedQuery);

    if (!matchesQuery) {
      return false;
    }

    if (filter === "watch") {
      return user.riskState === "watch";
    }

    if (filter === "restricted") {
      return user.riskState === "restricted";
    }

    if (filter === "creator") {
      return user.role === "CREATOR";
    }

    if (filter === "fan") {
      return user.role === "FAN";
    }

    if (filter === "admin") {
      return user.role === "ADMIN";
    }

    return true;
  });
}

function buildUsersHref(
  current: { q: string; filter: UserFilter; sort: UserSort; selected?: string },
  updates: Partial<{ q: string; filter: UserFilter; sort: UserSort; selected?: string }>,
) {
  const next = {
    ...current,
    ...updates,
  };
  const params = new URLSearchParams();

  if (next.q.trim()) {
    params.set("q", next.q.trim());
  }

  if (next.filter !== "all") {
    params.set("filter", next.filter);
  }

  if (next.sort !== "activity") {
    params.set("sort", next.sort);
  }

  if (next.selected) {
    params.set("selected", next.selected);
  }

  const query = params.toString();
  return query ? `/admin/users?${query}` : "/admin/users";
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const [adminUsers, params] = await Promise.all([listAdminModerationUsers(), searchParams]);
  const query = params.q?.trim() ?? "";
  const activeFilter = normalizeFilter(params.filter);
  const activeSort = normalizeSort(params.sort);
  const currentQuery = {
    q: query,
    filter: activeFilter,
    sort: activeSort,
    selected: params.selected,
  };
  const filteredUsers = sortUsers(filterUsers(adminUsers, activeFilter, query), activeSort);
  const selectedUser = filteredUsers.find((user) => user.id === params.selected);
  const watchCount = adminUsers.filter((user) => user.riskState === "watch").length;
  const restrictedCount = adminUsers.filter((user) => user.riskState === "restricted").length;
  const filterChips = [
    {
      label: `All · ${adminUsers.length}`,
      href: buildUsersHref(currentQuery, { filter: "all", selected: undefined }),
      active: activeFilter === "all",
    },
    {
      label: `Under watch · ${watchCount}`,
      href: buildUsersHref(currentQuery, { filter: "watch", selected: undefined }),
      active: activeFilter === "watch",
    },
    {
      label: `Restricted · ${restrictedCount}`,
      href: buildUsersHref(currentQuery, { filter: "restricted", selected: undefined }),
      active: activeFilter === "restricted",
    },
    {
      label: `Creators · ${adminUsers.filter((user) => user.role === "CREATOR").length}`,
      href: buildUsersHref(currentQuery, { filter: "creator", selected: undefined }),
      active: activeFilter === "creator",
    },
    {
      label: `Fans · ${adminUsers.filter((user) => user.role === "FAN").length}`,
      href: buildUsersHref(currentQuery, { filter: "fan", selected: undefined }),
      active: activeFilter === "fan",
    },
    {
      label: `Admins · ${adminUsers.filter((user) => user.role === "ADMIN").length}`,
      href: buildUsersHref(currentQuery, { filter: "admin", selected: undefined }),
      active: activeFilter === "admin",
    },
  ];
  const showClear = Boolean(query) || activeFilter !== "all" || activeSort !== "activity";

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="User management"
        title="User oversight"
        description="Review user access, risk, and recent moderation."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Visible accounts"
          value={adminUsers.length}
          detail="Accounts in this view."
          icon={Users}
          labelClassName="text-[var(--color-admin)]"
        />

        <MetricCard
          label="Under watch"
          value={watchCount}
          detail="Accounts with review flags."
          icon={Shield}
          labelClassName="text-amber-300"
        />

        <MetricCard
          label="Restricted"
          value={restrictedCount}
          detail="Accounts with active restrictions."
          icon={UserCog}
          labelClassName="text-rose-300"
        />
      </section>

      <AdminFilterBar
        action="/admin/users"
        searchValue={query}
        searchPlaceholder="Search by display name or handle"
        selectedSort={activeSort}
        sortOptions={[
          { label: "Recently active", value: "activity" },
          { label: "Risk first", value: "risk" },
          { label: "Recently moderated", value: "moderated" },
        ]}
        chips={filterChips}
        clearHref="/admin/users"
        showClear={showClear}
        preservedParams={activeFilter !== "all" ? { filter: activeFilter } : undefined}
      />

      <Card className="border-white/10 bg-[linear-gradient(180deg,_rgba(18,18,22,0.98),_rgba(11,11,14,0.96))] p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-admin)]">Account directory</p>
            <h2 className="mt-2 font-display text-3xl">User records</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {filteredUsers.length} shown
              {query ? ` for "${query}"` : ""}
              {activeFilter !== "all" ? ` in ${activeFilter}` : ""}.
            </p>
          </div>
          <StatusBadge>Review on demand</StatusBadge>
        </div>

        <div className="mt-5 grid gap-3">
          {filteredUsers.length ? (
            filteredUsers.map((user) => {
              const latestNote = user.relatedNotes[0];
              const isSelected = selectedUser?.id === user.id;
              const reviewHref = buildUsersHref(currentQuery, { selected: user.id });
              const closeHref = buildUsersHref(currentQuery, { selected: undefined });
              const primaryAction = user.isActive
                ? { label: "Suspend account", pendingLabel: "Suspending account...", value: "SUSPEND" }
                : { label: "Restore account", pendingLabel: "Restoring account...", value: "RESTORE" };
              const secondaryAction = user.isActive
                ? { label: "Restore account", pendingLabel: "Restoring account...", value: "RESTORE" }
                : { label: "Suspend account", pendingLabel: "Suspending account...", value: "SUSPEND" };

              return (
                <div
                  key={user.id}
                  className={cn(
                    "rounded-[1.5rem] border border-white/10 bg-black/20 p-4 transition",
                    isSelected && "border-[var(--color-admin)]/35 bg-black/25",
                  )}
                >
                  <div className={cn("grid gap-4", isSelected && "xl:grid-cols-[minmax(0,1fr)_24rem]")}>
                    <div>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-lg font-semibold text-foreground">{user.displayName}</p>
                            {user.riskState !== "normal" ? (
                              <StatusBadge tone={getAdminUserRiskTone(user.riskState)}>
                                {getAdminUserRiskLabel(user.riskState)}
                              </StatusBadge>
                            ) : null}
                            {user.adultAccessStatus !== "VERIFIED" ? (
                              <StatusBadge tone={getAdminUserAdultAccessTone(user.adultAccessStatus)}>
                                {getAdminUserAdultAccessBadgeLabel(user.adultAccessStatus)}
                              </StatusBadge>
                            ) : null}
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {user.handle} · {getRoleLabel(user.role)}
                          </p>
                        </div>

                        {isSelected ? (
                          <Button asChild size="sm" variant="ghost">
                            <Link href={closeHref}>Close review</Link>
                          </Button>
                        ) : (
                          <Button asChild size="sm" variant="outline">
                            <Link href={reviewHref}>Review user</Link>
                          </Button>
                        )}
                      </div>

                      <AdminEntityFacts
                        className="mt-4"
                        items={[
                          { label: "Lifecycle", value: user.lifecycle },
                          { label: "Spend / status", value: user.spendLabel },
                          { label: "Open reports", value: user.openReports },
                          { label: "Recent activity", value: user.lastSeen },
                        ]}
                      />

                      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.85fr)]">
                        <Card className="rounded-[1.25rem] border-white/10 bg-white/[0.03] px-4 py-3 shadow-none">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Next step</p>
                            {latestNote ? (
                              <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{latestNote.when}</span>
                            ) : null}
                          </div>
                          <p className="mt-2 text-sm text-foreground/85">{user.actionState}</p>
                          {latestNote ? (
                            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                              {latestNote.actor} · {latestNote.action}
                            </p>
                          ) : (
                            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                              No recent moderator notes
                            </p>
                          )}
                        </Card>

                        <Card className="rounded-[1.25rem] border-white/10 bg-white/[0.03] px-4 py-3 shadow-none">
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Access</p>
                          <p className="mt-2 text-sm font-medium text-foreground">
                            {user.isActive ? "Access active" : "Sign-in suspended"}
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {user.isActive
                              ? "Review only if a decision is needed."
                              : "Blocked until restored."}
                          </p>
                        </Card>
                      </div>
                    </div>

                    {isSelected ? (
                      <AdminModerationActionRail
                        title="Moderation review"
                        description="Apply access changes and leave a short note."
                        currentStateLabel="Selected user context"
                        currentStateValue={user.isActive ? user.actionState : `${user.actionState} ${user.lifecycle}`}
                        notePlaceholder={
                          user.isActive
                            ? "Why is access being suspended?"
                            : "Why is access being restored?"
                        }
                        noteHint="A note is required for audit history."
                        closeHref={closeHref}
                        auditHref="/admin/audit"
                        history={user.relatedNotes.slice(0, 4)}
                        formAction={updateUserModerationStateAction}
                        hiddenFields={<input type="hidden" name="userId" value={user.userId} />}
                        primaryAction={primaryAction}
                        secondaryAction={secondaryAction}
                      />
                    ) : null}
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyStateCard className="border-white/12 bg-black/20 text-center">
              No users match the current search and filter combination.
            </EmptyStateCard>
          )}
        </div>
      </Card>
    </div>
  );
}
