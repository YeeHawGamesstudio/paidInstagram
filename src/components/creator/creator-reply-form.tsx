"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import {
  sendCreatorReplyAction,
  type CreatorReplyActionState,
} from "@/app/actions/creator-messages";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const initialState: CreatorReplyActionState = {
  ok: false,
  message: "",
};

type CreatorReplyFormProps = {
  conversationId: string;
  fanName: string;
};

export function CreatorReplyForm({ conversationId, fanName }: CreatorReplyFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(sendCreatorReplyAction, initialState);

  useEffect(() => {
    if (!state.ok || state.conversationId !== conversationId) {
      return;
    }

    formRef.current?.reset();
    router.refresh();
  }, [conversationId, router, state.conversationId, state.ok]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
      <input type="hidden" name="conversationId" value={conversationId} />
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Reply</p>
        <p className="mt-2 text-sm text-muted-foreground">Send a direct reply to {fanName} from the creator inbox.</p>
      </div>
      <Textarea
        name="body"
        placeholder="Write a reply that keeps the conversation moving."
        className="min-h-24"
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Sending..." : "Send reply"}
        </Button>
        {state.message && state.conversationId === conversationId ? (
          <p className={`text-xs ${state.ok ? "text-emerald-300" : "text-rose-300"}`}>{state.message}</p>
        ) : null}
      </div>
    </form>
  );
}
