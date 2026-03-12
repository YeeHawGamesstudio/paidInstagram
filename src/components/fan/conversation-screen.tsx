"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Sparkles } from "lucide-react";

import {
  purchaseMessageUnlockAction,
  type PurchaseActionState,
} from "@/app/actions/billing";
import { MediaPreviewCard } from "@/components/shared/media-preview-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { FanConversation } from "@/lib/fan/types";
import { formatCurrency } from "@/lib/formatting";
import { cn } from "@/lib/utils";

type ConversationScreenProps = {
  conversation: FanConversation;
};

export function ConversationScreen({ conversation }: ConversationScreenProps) {
  const router = useRouter();
  const [purchaseState, formAction, isPending] = useActionState<PurchaseActionState, FormData>(
    purchaseMessageUnlockAction,
    {
      ok: false,
      message: "",
    },
  );

  const lastUnlockedTitle = purchaseState.ok ? purchaseState.title ?? "premium drop" : null;
  const unlockedSet = useMemo(() => {
    const ids = new Set(conversation.unlockedMessageIds);

    if (purchaseState.ok && purchaseState.messageId) {
      ids.add(purchaseState.messageId);
    }

    return ids;
  }, [conversation.unlockedMessageIds, purchaseState.ok, purchaseState.messageId]);

  useEffect(() => {
    if (!purchaseState.ok || !purchaseState.messageId) {
      return;
    }

    router.refresh();
  }, [purchaseState.messageId, purchaseState.ok, router]);

  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <Button asChild variant="ghost" className="-ml-2 w-fit px-2 text-muted-foreground hover:text-foreground">
          <Link href="/fan/messages">
            <ArrowLeft className="size-4" />
            Back to inbox
          </Link>
        </Button>

        <StatusBadge tone="success" className="tracking-[0.22em]">
          {conversation.creatorReplyWindow}
        </StatusBadge>
      </div>

      <Card className="overflow-hidden border-white/10 bg-[linear-gradient(180deg,_rgba(20,20,24,0.96),_rgba(10,10,13,0.98))]">
        <div className="border-b border-white/6 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div
              className="size-12 rounded-2xl border border-white/10 bg-cover bg-center"
              style={{ backgroundImage: `url(${conversation.creatorAvatarUrl})` }}
            />
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground">{conversation.creatorName}</p>
              <p className="truncate text-sm text-muted-foreground">
                {conversation.creatorHandle} · {conversation.creatorHeadline}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 px-3 py-4 sm:px-4">
          {lastUnlockedTitle ? (
            <div className="rounded-3xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">
              Unlock completed for <span className="font-semibold">{lastUnlockedTitle}</span>.
            </div>
          ) : null}
          {!purchaseState.ok && purchaseState.message ? (
            <div className="rounded-3xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
              {purchaseState.message}
            </div>
          ) : null}

          {conversation.messages.map((message) => {
            const isFan = message.sender === "fan";
            const isUnlocked = unlockedSet.has(message.id);

            if (message.kind === "locked" && !isUnlocked) {
              return (
                <div key={message.id} className="flex justify-start">
                  <div className="w-full max-w-sm rounded-[1.75rem] border border-primary/20 bg-[linear-gradient(180deg,_rgba(201,169,110,0.16),_rgba(23,18,10,0.5))] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.25)]">
                    <div className="flex items-center gap-2 text-primary">
                      <Lock className="size-4" />
                      <span className="text-xs font-semibold uppercase tracking-[0.22em]">Locked paid drop</span>
                    </div>
                    <h2 className="mt-3 text-lg font-semibold text-foreground">{message.locked.title}</h2>
                    <p className="mt-2 text-sm text-foreground/80">{message.locked.teaser}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{message.locked.description}</p>
                    <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Unlock</p>
                        <p className="font-display text-2xl text-foreground">
                          {formatCurrency(message.locked.priceCents, message.locked.currency)}
                        </p>
                      </div>
                      <form action={formAction}>
                        <input type="hidden" name="messageId" value={message.id} />
                        <Button type="submit" disabled={isPending}>
                          {isPending ? "Processing..." : "Unlock now"}
                        </Button>
                      </form>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Unlock reveals the premium message and any attached media in this thread.
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">{message.sentAt}</p>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={message.id}
                className={cn("flex", isFan ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "w-full max-w-sm rounded-[1.75rem] px-4 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.18)]",
                    isFan
                      ? "bg-primary text-primary-foreground"
                      : "border border-white/10 bg-white/[0.05] text-foreground",
                  )}
                >
                  {message.kind === "locked" ? (
                    <div className="space-y-3">
                      <StatusBadge tone="success" className="tracking-[0.2em]">
                        <Sparkles className="size-3.5" />
                        Unlocked
                      </StatusBadge>
                      <p className={cn("text-sm leading-6", isFan ? "text-primary-foreground/90" : "text-muted-foreground")}>
                        {message.locked.unlockedText}
                      </p>
                      {message.locked.media ? <MediaPreviewCard media={message.locked.media} /> : null}
                    </div>
                  ) : null}

                  {message.body ? (
                    <p
                      className={cn(
                        "text-sm leading-6",
                        isFan ? "text-primary-foreground" : "text-foreground",
                      )}
                    >
                      {message.body}
                    </p>
                  ) : null}

                  {message.kind === "media" ? (
                    <div className="space-y-3">
                      <MediaPreviewCard media={message.media} />
                    </div>
                  ) : null}

                  <p
                    className={cn(
                      "mt-3 text-[11px]",
                      isFan ? "text-primary-foreground/75" : "text-muted-foreground",
                    )}
                  >
                    {message.sentAt}
                  </p>
                  {!isFan && message.reportHref ? (
                    <Link
                      href={message.reportHref}
                      className="mt-2 inline-flex text-[11px] text-muted-foreground transition hover:text-foreground"
                    >
                      Report message
                    </Link>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-white/6 bg-background/70 p-3 sm:p-4">
          <div className="rounded-[1.75rem] border border-dashed border-white/15 bg-white/[0.04] p-4">
            <p className="text-sm font-medium text-foreground">Replies are not part of this launch slice.</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              This thread is available for reviewing message history and paid unlock behavior. Reply sending remains off
              while launch access stays controlled.
            </p>
          </div>
        </div>
      </Card>
    </section>
  );
}
