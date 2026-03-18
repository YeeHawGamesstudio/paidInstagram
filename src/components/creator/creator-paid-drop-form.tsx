"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";

import {
  sendCreatorPaidDropAction,
  type CreatorPaidDropActionState,
} from "@/app/actions/creator-messages";
import type { CreatorConversationPreview } from "@/lib/creator/demo-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: CreatorPaidDropActionState = {
  ok: false,
  message: "",
};

type CreatorPaidDropFormProps = {
  conversations: CreatorConversationPreview[];
  selectedConversationId?: string;
};

export function CreatorPaidDropForm({
  conversations,
  selectedConversationId,
}: CreatorPaidDropFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(sendCreatorPaidDropAction, initialState);
  const defaultConversationId = selectedConversationId ?? conversations[0]?.id ?? "";
  const [conversationId, setConversationId] = useState(defaultConversationId);
  const [unlockPriceDollars, setUnlockPriceDollars] = useState(
    String(((conversations.find((item) => item.id === defaultConversationId)?.suggestedOfferCents ?? 1800) / 100).toFixed(0)),
  );

  useEffect(() => {
    const nextConversationId = selectedConversationId ?? conversations[0]?.id ?? "";
    setConversationId(nextConversationId);
    setUnlockPriceDollars(
      String(((conversations.find((item) => item.id === nextConversationId)?.suggestedOfferCents ?? 1800) / 100).toFixed(0)),
    );
  }, [conversations, selectedConversationId]);

  useEffect(() => {
    if (!state.ok || !state.conversationId) {
      return;
    }

    formRef.current?.reset();
    setConversationId(state.conversationId);
    setUnlockPriceDollars(
      String(((conversations.find((item) => item.id === state.conversationId)?.suggestedOfferCents ?? 1800) / 100).toFixed(0)),
    );
    router.refresh();
  }, [conversations, router, state.conversationId, state.ok]);

  const activeConversation = useMemo(
    () => conversations.find((item) => item.id === conversationId),
    [conversationId, conversations],
  );

  return (
    <form ref={formRef} action={formAction}>
      <div className="flex items-center gap-2 text-[var(--color-creator)]">
        <Send className="size-4" />
        <p className="text-xs font-semibold uppercase tracking-[0.24em]">Paid drop</p>
      </div>
      <h2 className="mt-3 font-display text-3xl">Send a locked message</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Send a paid drop into an existing conversation. The subscriber will need to unlock it to see the full message.
      </p>

      <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-black/20 p-4 text-sm text-muted-foreground">
        {activeConversation ? (
          <>
            Current target: <span className="text-foreground">{activeConversation.fanName}</span>. Suggested starting price{" "}
            <span className="text-foreground">${(activeConversation.suggestedOfferCents / 100).toFixed(0)}</span>.
          </>
        ) : (
          "Once inbox activity exists, this panel will point to the best current subscriber conversation for a paid drop."
        )}
      </div>

      <input type="hidden" name="conversationId" value={conversationId} />

      <div className="mt-5 grid gap-3">
        <div className="grid gap-2">
          <Label htmlFor="fan-recipient">Send to</Label>
          <select
            id="fan-recipient"
            value={conversationId}
            onChange={(event) => setConversationId(event.target.value)}
            className="h-11 rounded-2xl border border-border bg-input px-4 text-sm text-foreground outline-none focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/25"
          >
            {conversations.map((conversation) => (
              <option key={conversation.id} value={conversation.id}>
                {conversation.fanName}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="paid-message">Locked message</Label>
          <Textarea
            id="paid-message"
            name="body"
            placeholder="Write the message your subscriber will see after unlocking..."
            className="min-h-28"
          />
          <p className="text-xs text-muted-foreground">
            The first line of this text becomes the paid-drop preview fans see before unlocking.
          </p>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="price-cents">Unlock price</Label>
          <Input
            id="price-cents"
            name="unlockPriceDollars"
            value={unlockPriceDollars}
            onChange={(event) => setUnlockPriceDollars(event.target.value)}
            inputMode="decimal"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="media-attachment">Media attachment</Label>
          <Input id="media-attachment" type="file" accept="image/*,video/*" disabled />
          <p className="text-xs text-muted-foreground">Media attachments for paid drops are coming soon.</p>
        </div>
      </div>

      {state.message ? (
        <p className={`mt-4 text-sm ${state.ok ? "text-emerald-300" : "text-rose-300"}`}>{state.message}</p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <Button type="submit" disabled={isPending || !conversationId}>
          <Send className="size-4" />
          {isPending ? "Sending..." : "Send paid drop"}
        </Button>
      </div>
    </form>
  );
}
