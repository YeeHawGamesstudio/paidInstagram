"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  cancelCreatorSubscriptionAction,
  type PurchaseActionState,
} from "@/app/actions/billing";
import { Button } from "@/components/ui/button";

const initialState: PurchaseActionState = {
  ok: false,
  message: "",
};

type SubscriptionCancelButtonProps = {
  subscriptionId: string;
  creatorName: string;
  isCancellationScheduled: boolean;
};

export function SubscriptionCancelButton({
  subscriptionId,
  creatorName,
  isCancellationScheduled,
}: SubscriptionCancelButtonProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    cancelCreatorSubscriptionAction,
    initialState,
  );

  useEffect(() => {
    if (state.ok) {
      router.refresh();
    }
  }, [router, state.ok]);

  const cancellationScheduled = isCancellationScheduled || state.ok;

  return (
    <form action={formAction} className="grid gap-2">
      <input type="hidden" name="subscriptionId" value={subscriptionId} />
      <Button type="submit" variant="outline" disabled={cancellationScheduled || isPending}>
        {cancellationScheduled
          ? "Cancellation scheduled"
          : isPending
            ? "Scheduling cancellation..."
            : `Cancel ${creatorName}`}
      </Button>
      {state.message ? (
        <p className="text-xs text-muted-foreground">{state.message}</p>
      ) : null}
    </form>
  );
}
