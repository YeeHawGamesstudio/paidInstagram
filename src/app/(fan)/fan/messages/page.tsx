import Link from "next/link";
import { ChevronRight, Lock, Sparkles } from "lucide-react";

import { FanPageHeader } from "@/components/fan/fan-page-header";
import { EmptyStateCard } from "@/components/shared/empty-state-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getFanConversationTone, getFanConversationToneLabel } from "@/lib/fan/presentation";
import { getFanConversationPreviews } from "@/lib/fan/server-data";

export default async function FanMessagesPage() {
  const fanConversations = await getFanConversationPreviews();

  return (
    <div className="grid gap-5">
      <FanPageHeader
        eyebrow="Messages"
        title="Premium creator inbox"
        description="Browse active conversations, spot unread replies quickly, and jump into paid drops or subscriber-only chat moments."
        actions={
          <Button asChild variant="outline">
            <Link href="/fan/subscriptions">View memberships</Link>
          </Button>
        }
      />

      <section className="grid gap-4">
        {fanConversations.length ? (
          fanConversations.map((conversation) => (
            <Link key={conversation.id} href={`/fan/messages/${conversation.id}`}>
              <Card className="border-white/10 bg-[radial-gradient(circle_at_top_right,_rgba(201,169,110,0.08),_transparent_14rem),linear-gradient(180deg,_rgba(20,20,24,0.98),_rgba(11,11,14,0.96))] p-4 transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white/[0.05] sm:p-5">
                <div className="flex items-center gap-4">
                  <div
                    className="size-14 rounded-[1.4rem] border border-white/10 bg-cover bg-center shadow-[0_16px_36px_rgba(0,0,0,0.2)]"
                    style={{ backgroundImage: `url(${conversation.creatorAvatarUrl})` }}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-semibold text-foreground">{conversation.creatorName}</p>
                          <StatusBadge tone={getFanConversationTone(conversation.tone)} size="xs">
                            {getFanConversationToneLabel(conversation.tone)}
                          </StatusBadge>
                        </div>
                        <p className="truncate text-sm text-muted-foreground">
                          {conversation.creatorHandle} · {conversation.creatorHeadline}
                        </p>
                      </div>
                      <p className="shrink-0 text-xs text-muted-foreground">{conversation.lastMessageAt}</p>
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-foreground/78">{conversation.lastMessagePreview}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {conversation.hasLockedDrop ? (
                        <StatusBadge tone="primary" className="text-xs normal-case tracking-normal">
                          <Lock className="size-3.5" />
                          Paid drop inside
                        </StatusBadge>
                      ) : null}
                      {conversation.unreadCount > 0 ? (
                        <StatusBadge tone="success" className="text-xs normal-case tracking-normal">
                          <Sparkles className="size-3.5" />
                          {conversation.unreadCount} unread
                        </StatusBadge>
                      ) : null}
                    </div>
                  </div>

                  <ChevronRight className="hidden size-5 text-muted-foreground sm:block" />
                </div>
              </Card>
            </Link>
          ))
        ) : (
          <EmptyStateCard>
            No conversations yet. Once creators reply or send premium drops, your inbox will collect them here in a single polished thread list.
          </EmptyStateCard>
        )}
      </section>
    </div>
  );
}
