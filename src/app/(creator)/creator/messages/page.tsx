import { Lock, MessageSquareText, Send, Sparkles } from "lucide-react";

import { CreatorPageHeader } from "@/components/creator/creator-page-header";
import { EmptyStateCard } from "@/components/shared/empty-state-card";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { creatorConversations, formatCreatorCurrency } from "@/lib/creator/demo-data";
import { getCreatorConversationTone, getCreatorConversationToneLabel } from "@/lib/creator/presentation";

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

export default function CreatorMessagesPage() {
  const sortedConversations = [...creatorConversations].sort((left, right) => {
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
  const activeSubscribers = creatorConversations.filter((item) => item.activeSubscription).length;
  const unreadThreads = creatorConversations.filter((item) => item.unreadCount > 0).length;
  const lapsedThreads = creatorConversations.filter((item) => !item.activeSubscription).length;
  const offerBaseline = featuredConversation ? formatCreatorCurrency(featuredConversation.suggestedOfferCents) : "N/A";

  return (
    <div className="grid gap-6">
      <CreatorPageHeader
        eyebrow="Messages"
        title="Inbox and paid-drop preview"
        description="Review thread health, check subscription context, and test the paid-message form. Sending is disabled here."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Unread threads"
          value={unreadThreads}
          detail="Work these first before reviewing quieter threads."
          icon={MessageSquareText}
          labelClassName="text-primary"
        />
        <MetricCard
          label="Subscriber chats"
          value={activeSubscribers}
          detail="Threads tied to an active subscription."
          icon={Sparkles}
          labelClassName="text-primary"
        />
        <MetricCard
          label="Offer baseline"
          value={offerBaseline}
          detail="Starting point for the highest-priority paid-drop draft."
          icon={Lock}
          labelClassName="text-primary"
        />
      </section>

      <Card className="border-white/10 bg-white/[0.04] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Inbox workflow</p>
        <h2 className="mt-2 font-display text-3xl">Triage first, draft second</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          This launch slice is inbox plus paid-drop composer only. There is no thread-detail route yet, so use the list to
          prioritize who needs attention and the right rail to validate copy, pricing, and attachments.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Reply pressure</p>
            <p className="mt-2 text-sm text-foreground/85">{unreadThreads} unread threads need the first pass.</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Subscriber context</p>
            <p className="mt-2 text-sm text-foreground/85">
              {activeSubscribers} subscriber chats and {lapsedThreads} lapsed chats.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Paid-drop review</p>
            <p className="mt-2 text-sm text-foreground/85">Use the composer to validate offer copy and price only. Sending stays disabled.</p>
          </div>
        </div>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="grid gap-4">
          {sortedConversations.length > 0 ? (
            sortedConversations.map((conversation) => (
              <Card key={conversation.id} className="border-white/10 bg-[linear-gradient(180deg,_rgba(20,20,24,0.98),_rgba(11,11,14,0.96))] p-5">
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
                      Suggested locked drop {formatCreatorCurrency(conversation.suggestedOfferCents)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 md:self-end">
                    <Button type="button" variant="outline" size="sm" disabled>
                      Reply disabled
                    </Button>
                    <Button type="button" size="sm" disabled>
                      Paid drop disabled
                    </Button>
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
            <div className="flex items-center gap-2 text-[var(--color-creator)]">
              <Lock className="size-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.24em]">Paid drop draft</p>
            </div>
            <h2 className="mt-3 font-display text-3xl">Review a locked message</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Validate recipient choice, copy, unlock price, and media attachment here. Outbound sending stays disabled in this
              preview.
            </p>

            <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-black/20 p-4 text-sm text-muted-foreground">
              {featuredConversation ? (
                <>
                  Best current target: <span className="text-foreground">{featuredConversation.fanName}</span>. This fan has the
                  highest mix of unread pressure and paid-drop potential in the current sample data.
                </>
              ) : (
                "Once inbox activity exists, this panel will point to the best current subscriber conversation for a paid-drop draft."
              )}
            </div>

            <div className="mt-5 grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="fan-recipient">Send to</Label>
                <select
                  id="fan-recipient"
                  defaultValue={featuredConversation?.id}
                  className="h-11 rounded-2xl border border-border bg-input px-4 text-sm text-foreground outline-none focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/25"
                >
                  {creatorConversations.map((conversation) => (
                    <option key={conversation.id} value={conversation.id}>
                      {conversation.fanName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="paid-message">Message</Label>
                <Textarea
                  id="paid-message"
                  defaultValue="Here is the locked rooftop sequence with the voice note included. Unlock if you want the full after-hours set."
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="price-cents">Unlock price</Label>
                <Input id="price-cents" defaultValue={featuredConversation ? featuredConversation.suggestedOfferCents / 100 : 18} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="media-attachment">Media attachment</Label>
                <Input id="media-attachment" type="file" accept="image/*,video/*" />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button type="button" disabled>
                <Send className="size-4" />
                Send disabled
              </Button>
              <Button type="button" variant="outline" disabled>
                Template save disabled
              </Button>
            </div>
          </Card>

          <Card className="border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="size-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.24em]">Launch-slice note</p>
            </div>
            <h3 className="mt-3 text-lg font-semibold">Inbox and composer only</h3>
            <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                Thread detail is not part of this launch slice, so the conversation list is the primary review surface.
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                Use the composer to check copy, price, recipient selection, and file input behavior only.
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                Validate live sending later in an environment where creator messaging is fully enabled.
              </div>
            </div>
          </Card>
        </aside>
      </section>
    </div>
  );
}
