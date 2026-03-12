import { Lock, MessageSquareText, Send, Sparkles } from "lucide-react";

import { CreatorPageHeader } from "@/components/creator/creator-page-header";
import { MetricCard } from "@/components/shared/metric-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { creatorConversations, formatCreatorCurrency } from "@/lib/creator/demo-data";
import { getCreatorConversationTone, getCreatorConversationToneLabel } from "@/lib/creator/presentation";

export default function CreatorMessagesPage() {
  const featuredConversation = creatorConversations[0];
  const activeSubscribers = creatorConversations.filter((item) => item.activeSubscription).length;
  const unreadThreads = creatorConversations.filter((item) => item.unreadCount > 0).length;

  return (
    <div className="grid gap-6">
      <CreatorPageHeader
        eyebrow="Messages"
        title="Private conversations and paid drops"
        description="Review conversation health, identify subscribers ready to convert, and validate the paid-message workspace before sending is enabled."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          label="Unread threads"
          value={unreadThreads}
          detail="Fans waiting for a high-touch reply or a paid offer."
          icon={MessageSquareText}
          labelClassName="text-primary"
        />
        <MetricCard
          label="Subscribed chats"
          value={activeSubscribers}
          detail="Threads backed by an active monthly relationship."
          icon={Sparkles}
          labelClassName="text-primary"
        />
        <MetricCard
          label="Offer baseline"
          value={formatCreatorCurrency(featuredConversation.suggestedOfferCents)}
          detail="Suggested starting point for a locked message bundle."
          icon={Lock}
          labelClassName="text-primary"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="grid gap-4">
          {creatorConversations.map((conversation) => (
            <Card key={conversation.id} className="border-white/10 bg-[linear-gradient(180deg,_rgba(20,20,24,0.98),_rgba(11,11,14,0.96))] p-5">
              <div className="flex items-center gap-4">
                <div
                  className="size-14 rounded-[1.4rem] border border-white/10 bg-cover bg-center"
                  style={{ backgroundImage: `url(${conversation.fanAvatarUrl})` }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">{conversation.fanName}</p>
                    <StatusBadge tone={getCreatorConversationTone(conversation.tone)} size="xs">
                      {getCreatorConversationToneLabel(conversation.tone)}
                    </StatusBadge>
                    {conversation.activeSubscription ? (
                      <StatusBadge tone="creator" size="xs">
                        Subscriber
                      </StatusBadge>
                    ) : (
                      <StatusBadge tone="neutral" size="xs">
                        Lapsed
                      </StatusBadge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {conversation.fanHandle} · {conversation.lastMessageAt}
                  </p>
                  <p className="mt-3 text-sm text-foreground/80">{conversation.lastMessagePreview}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-white/10 bg-black/20 px-4 py-3 text-sm">
                <span className="text-muted-foreground">
                  Suggested locked drop {formatCreatorCurrency(conversation.suggestedOfferCents)}
                </span>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="sm" disabled>
                    Reply
                  </Button>
                  <Button type="button" size="sm" disabled>
                    Send paid drop
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <aside className="grid gap-4 self-start xl:sticky xl:top-24">
          <Card className="border-white/10 bg-[linear-gradient(180deg,_rgba(45,24,75,0.32),_rgba(11,11,15,0.98))] p-5">
            <div className="flex items-center gap-2 text-[var(--color-creator)]">
              <Lock className="size-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.24em]">Paid message composer</p>
            </div>
            <h2 className="mt-3 font-display text-3xl">Queue locked content</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Review pricing, copy, and targeting here while outbound sending remains disabled for this environment.
            </p>

            <div className="mt-5 grid gap-3">
              <div className="grid gap-2">
                <Label htmlFor="fan-recipient">Send to</Label>
                <select
                  id="fan-recipient"
                  defaultValue={featuredConversation.id}
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
                <Input id="price-cents" defaultValue={featuredConversation.suggestedOfferCents / 100} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="media-attachment">Media attachment</Label>
                <Input id="media-attachment" type="file" accept="image/*,video/*" />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button type="button" disabled>
                <Send className="size-4" />
                Send locked message
              </Button>
              <Button type="button" variant="outline" disabled>
                Save as template
              </Button>
            </div>
          </Card>

          <Card className="border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="size-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.24em]">Featured conversation</p>
            </div>
            <h3 className="mt-3 text-lg font-semibold">{featuredConversation.fanName}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{featuredConversation.fanHandle}</p>
            <p className="mt-4 text-sm leading-6 text-foreground/80">{featuredConversation.lastMessagePreview}</p>
            <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-black/20 p-4 text-sm text-muted-foreground">
              Best next step: review the thread and offer details here, then validate the live send flow in an environment with
              creator messaging enabled.
            </div>
          </Card>
        </aside>
      </section>
    </div>
  );
}
