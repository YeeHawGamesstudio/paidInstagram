import Link from "next/link";
import type { ReactNode } from "react";

import { AdminModerationSubmitButton } from "@/components/admin/admin-moderation-submit-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type AdminModerationHistoryItem = {
  id: string;
  actor: string;
  action: string;
  notes: string;
  when: string;
};

type AdminModerationActionRailProps = {
  title: string;
  description: string;
  currentStateLabel: string;
  currentStateValue: string;
  notePlaceholder: string;
  noteHint: string;
  closeHref: string;
  auditHref: string;
  history: AdminModerationHistoryItem[];
  formAction: (formData: FormData) => void | Promise<void>;
  hiddenFields: ReactNode;
  primaryAction: {
    label: string;
    pendingLabel: string;
    value: string;
  };
  secondaryAction: {
    label: string;
    pendingLabel: string;
    value: string;
  };
};

export function AdminModerationActionRail({
  title,
  description,
  currentStateLabel,
  currentStateValue,
  notePlaceholder,
  noteHint,
  closeHref,
  auditHref,
  history,
  formAction,
  hiddenFields,
  primaryAction,
  secondaryAction,
}: AdminModerationActionRailProps) {
  return (
    <div className="grid gap-3">
      <Card className="rounded-[1.5rem] border-white/10 bg-white/[0.03] p-4 shadow-none">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-admin)]">{title}</p>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-black/20 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{currentStateLabel}</p>
          <p className="mt-2 text-sm text-foreground/85">{currentStateValue}</p>
        </div>

        <form action={formAction} className="mt-4 grid gap-3">
          {hiddenFields}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Moderator note</p>
            <Textarea
              required
              name="notes"
              className="mt-2 min-h-28 border-white/10 bg-black/20"
              placeholder={notePlaceholder}
            />
            <p className="mt-2 text-xs text-muted-foreground">{noteHint}</p>
          </div>
          <div className="rounded-[1.25rem] border border-white/10 bg-black/20 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Action</p>
            <div className="mt-3 grid gap-2">
              <AdminModerationSubmitButton
                name="action"
                value={primaryAction.value}
                idleLabel={primaryAction.label}
                pendingLabel={primaryAction.pendingLabel}
                className={primaryAction.value === "RESTORE" ? "w-full" : "w-full border-rose-400/30 bg-rose-500/10 text-rose-100 hover:bg-rose-500/15"}
              />
              <AdminModerationSubmitButton
                variant={secondaryAction.value === "RESTORE" ? "secondary" : "outline"}
                name="action"
                value={secondaryAction.value}
                idleLabel={secondaryAction.label}
                pendingLabel={secondaryAction.pendingLabel}
                className="w-full"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button asChild size="sm" variant="ghost">
              <Link href={closeHref}>Close review</Link>
            </Button>
          </div>
        </form>
      </Card>

      <Card className="rounded-[1.5rem] border-white/10 bg-white/[0.03] p-4 shadow-none">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Recent history</p>
          <Link href={auditHref} className="text-xs text-muted-foreground transition hover:text-foreground">
            Full audit trail
          </Link>
        </div>
        <div className="mt-3 grid gap-3">
          {history.length ? (
            history.map((note) => (
              <div key={note.id} className="rounded-2xl border border-white/10 bg-black/25 px-3 py-3">
                <p className="text-sm font-medium text-foreground">
                  {note.actor} · {note.action}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{note.notes}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">{note.when}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No moderation notes recorded yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
