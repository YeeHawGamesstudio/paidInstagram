import Link from "next/link";
import { DollarSign, Mail, Users } from "lucide-react";

import { CreatorPaidDropForm } from "@/components/creator/creator-paid-drop-form";
import { CreatorReplyForm } from "@/components/creator/creator-reply-form";
import { CreatorPageHeader } from "@/components/creator/creator-page-header";
import { EmptyStateCard } from "@/components/shared/empty-state-card";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCreatorConversationPreviews } from "@/lib/creator/server-data";
import { getCreatorConversationTone, getCreatorConversationToneLabel } from "@/lib/creator/presentation";
import { formatCurrency } from "@/lib/formatting";

function getConversationNextStep(activeSubscription: boolean, unreadCount: number) {
  if (unreadCount > 0 && activeSubscription) {
    return "Reply first, then decide whether to pitch a locked drop.";
  }

  if (unreadCount > 0) {
    return "Reply first and gauge whether a one-off drop still fits.";
  }

  if (activeSubscription) {
    return "Subscriber is current. This is a good thread to test a paid-drop draft.";
  }

  return "No unread pressure here. Use this thread for occasional reactivation offers.";
}

function getAvatarStyle(imageUrl?: string) {
  if (imageUrl) {
    return { backgroundImage: `url(${imageUrl})` };
  }

  return {
    backgroundImage:
      "linear-gradient(180deg, rgba(130,92,255,0.24), rgba(15,15,20,0.92))",
  };
}

export default async function CreatorMessagesPage({
  searchParams,
}: {
  searchParams?: Promise<{ conversationId?: string }>;
}) {
  const conversations = await getCreatorConversationPreviews();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const selectedConversationId = resolvedSearchParams?.conversationId;
  const sortedConversations = [...conversations].sort((left, right) => {
    if (selectedConversationId) {
      if (left.id === selectedConversationId) {
        return -1;
      }

      if (right.id === selectedConversationId) {
        return 1;
      }
    }

    const unreadDelta = right.unreadCount - left.unreadCount;

    if (unreadDelta !== 0) {
      return unreadDelta;
    }

    if (left.activeSubscription !== right.activeSubscription) {
      return Number(right.activeSubscription) - Number(left.activeSubscription);
    }

    return right.suggestedOfferCents - left.suggestedOfferCents;
  });

  const featuredConversation = sortedConversations[0];
  const activeSubscribers = conversations.filter((item) => item.activeSubscription).length;
  const unreadThreads = conversations.filter((item) => item.unreadCount > 0).length;

  const offerBaseline = featuredConversation ? formatCurrency(featuredConversation.suggestedOfferCents, "usd") : "N/A";

  return (
    <div className="grid gap-6">
      <CreatorPageHeader
        title="Messages"
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Unread threads"
          value={unreadThreads}
          detail="Work these first before reviewing quieter threads."
          icon={Mail}
          labelClassName="text-primary"
        />
        <MetricCard
          label="Subscriber chats"
          value={activeSubscribers}
          detail="Threads tied to an active subscription."
          icon={Users}
          labelClassName="text-primary"
        />
        <MetricCard
          label="Offer baseline"
          value={offerBaseline}
          detail="Starting point for the highest-priority paid-drop draft."
          icon={DollarSign}
          labelClassName="text-primary"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="grid gap-4">
          {sortedConversations.length > 0 ? (
            sortedConversations.map((conversation) => (
              <Card
                key={conversation.id}
                className={`border-white/10 bg-[linear-gradient(180deg,_rgba(20,20,24,0.98),_rgba(11,11,14,0.96))] p-5 ${
                  conversation.id === selectedConversationId ? "ring-1 ring-primary/40" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="size-14 rounded-[1.4rem] border border-white/10 bg-cover bg-center"
                    style={getAvatarStyle(conversation.fanAvatarUrl)}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{conversation.fanName}</p>
                        <p className="text-sm text-muted-foreground">
                          {conversation.fanHandle} · {conversation.lastMessageAt}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {conversation.id === selectedConversationId ? (
                          <StatusBadge tone="creator" size="xs">
                            Currently viewing
                          </StatusBadge>
                        ) : null}
                        {conversation.unreadCount > 0 ? (
                          <StatusBadge tone={getCreatorConversationTone(conversation.tone)} size="xs">
                            {conversation.unreadCount} unread
                          </StatusBadge>
                        ) : null}
                        <StatusBadge tone={conversation.activeSubscription ? "creator" : "neutral"} size="xs">
                          {conversation.activeSubscription ? "Subscriber" : "Lapsed"}
                        </StatusBadge>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-foreground/80">{conversation.lastMessagePreview}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                  <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {conversation.unreadCount > 0 ? (
                        <StatusBadge tone="success" size="xs">
                          Needs reply
                        </StatusBadge>
                      ) : (
                        <StatusBadge tone="neutral" size="xs">
                          No unread pressure
                        </StatusBadge>
                      )}
                      {conversation.tone !== "UNREAD" ? (
                        <span className="text-xs text-muted-foreground">
                          {getCreatorConversationToneLabel(conversation.tone)}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 text-sm text-foreground/85">
                      {getConversationNextStep(conversation.activeSubscription, conversation.unreadCount)}
                    </p>
                    <p className="mt-3 text-sm text-muted-foreground">
                      Suggested locked drop {formatCurrency(conversation.suggestedOfferCents, "usd")}
                    </p>
                  </div>

                  <div className="grid gap-3 md:w-[22rem]">
                    <CreatorReplyForm conversationId={conversation.id} fanName={conversation.fanName} />
                    <div className="flex flex-wrap items-center gap-2 md:self-end">
                      <Button asChild type="button" size="sm" variant="outline">
                        <Link href={`/creator/messages?conversationId=${conversation.id}`}>Draft paid drop</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <EmptyStateCard>
              <div className="space-y-3">
                <p className="font-medium text-foreground">No subscriber conversations yet.</p>
                <p>
                  When subscribers start messaging or paid-drop drafts become relevant, the inbox triage list will appear here.
                </p>
              </div>
            </EmptyStateCard>
          )}
        </div>

        <aside className="grid gap-4 self-start xl:sticky xl:top-24">
          <Card className="border-white/10 bg-[linear-gradient(180deg,_rgba(45,24,75,0.32),_rgba(11,11,15,0.98))] p-5">
            <CreatorPaidDropForm
              conversations={conversations}
              selectedConversationId={selectedConversationId ?? featuredConversation?.id}
            />
          </Card>

          
        </aside>
      </section>
    </div>
  );
}
