import Link from "next/link";
import { ChevronRight, Lock, Sparkles } from "lucide-react";

import { FanPageHeader } from "@/components/fan/fan-page-header";
import { EmptyStateCard } from "@/components/shared/empty-state-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getFanConversationTone, getFanConversationToneLabel } from "@/lib/fan/presentation";
import { getFanConversationPreviews } from "@/lib/fan/server-data";

function getAvatarStyle(imageUrl?: string) {
  return imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined;
}

export default async function FanMessagesPage() {
  const fanConversations = await getFanConversationPreviews();
  const unreadConversationCount = fanConversations.filter((conversation) => conversation.unreadCount > 0).length;
  const lockedDropCount = fanConversations.filter((conversation) => conversation.hasLockedDrop).length;

  return (
    <div className="grid gap-4 sm:gap-5">
      <FanPageHeader
        eyebrow="Messages"
        title="Premium creator inbox"
        description="Browse active conversations, spot unread replies quickly, and jump into paid drops or subscriber-only chat moments."
        actions={
          <Button asChild variant="outline" className="w-full justify-center sm:w-auto">
            <Link href="/fan/subscriptions">View memberships</Link>
          </Button>
        }
      />

      <Card className="border-white/10 bg-[radial-gradient(circle_at_top_right,_rgba(201,169,110,0.08),_transparent_16rem),linear-gradient(180deg,_rgba(20,20,24,0.96),_rgba(11,11,14,0.98))] p-4 sm:p-5">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">Inbox overview</p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl">Start with the threads that need attention now</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Unread replies and paid drops are surfaced first so you can jump straight into the most important creator activity.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="success" className="text-xs normal-case tracking-normal">
              {unreadConversationCount} unread thread{unreadConversationCount === 1 ? "" : "s"}
            </StatusBadge>
            <StatusBadge tone="primary" className="text-xs normal-case tracking-normal">
              {lockedDropCount} paid drop{lockedDropCount === 1 ? "" : "s"} waiting
            </StatusBadge>
          </div>
        </div>
      </Card>

      <section className="grid gap-4">
        {fanConversations.length ? (
          fanConversations.map((conversation) => (
            <Link key={conversation.id} href={`/fan/messages/${conversation.id}`} className="block">
              <Card className="min-h-[10rem] border-white/10 bg-[radial-gradient(circle_at_top_right,_rgba(201,169,110,0.08),_transparent_14rem),linear-gradient(180deg,_rgba(20,20,24,0.98),_rgba(11,11,14,0.96))] p-4 transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white/[0.05] active:scale-[0.995] sm:p-5">
                <div className="flex items-start gap-4">
                  <div
                    className="size-14 rounded-[1.4rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(201,169,110,0.24),_rgba(23,23,30,0.94))] bg-cover bg-center shadow-[0_16px_36px_rgba(0,0,0,0.2)]"
                    style={getAvatarStyle(conversation.creatorAvatarUrl)}
                    aria-label={conversation.creatorName}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-[1rem] font-semibold text-foreground sm:text-[1.05rem]">
                            {conversation.creatorName}
                          </p>
                          {conversation.unreadCount > 0 ? (
                            <StatusBadge tone="success" className="text-xs normal-case tracking-normal">
                              <Sparkles className="size-3.5" />
                              {conversation.unreadCount} unread
                            </StatusBadge>
                          ) : null}
                        </div>
                        <p className="truncate text-sm text-muted-foreground">
                          {conversation.creatorHandle} · {conversation.creatorHeadline}
                        </p>
                      </div>
                      <p className="shrink-0 text-xs text-muted-foreground">{conversation.lastMessageAt}</p>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 pr-2">
                      <StatusBadge tone={getFanConversationTone(conversation.tone)} size="xs">
                        {getFanConversationToneLabel(conversation.tone)}
                      </StatusBadge>
                      {conversation.hasLockedDrop ? (
                        <StatusBadge tone="primary" className="text-xs normal-case tracking-normal">
                          <Lock className="size-3.5" />
                          Paid drop waiting
                        </StatusBadge>
                      ) : null}
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-foreground/78">{conversation.lastMessagePreview}</p>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        Open conversation
                      </p>
                      <ChevronRight className="size-5 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))
        ) : (
          <EmptyStateCard>
            <div className="grid gap-4">
              <p>
                No conversations yet. Once creators reply or send premium drops, your inbox will collect them here in a
                single polished thread list.
              </p>
              <div className="grid gap-2 sm:flex sm:flex-wrap">
                <Button asChild className="w-full justify-center sm:w-auto">
                  <Link href="/fan/subscriptions">Find memberships</Link>
                </Button>
                <Button asChild variant="outline" className="w-full justify-center sm:w-auto">
                  <Link href="/fan">Back to feed</Link>
                </Button>
              </div>
            </div>
          </EmptyStateCard>
        )}
      </section>
    </div>
  );
}
