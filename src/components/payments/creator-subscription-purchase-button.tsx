"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  purchaseCreatorSubscriptionAction,
  type PurchaseActionState,
} from "@/app/actions/billing";
import { Button } from "@/components/ui/button";

const initialState: PurchaseActionState = {
  ok: false,
  message: "",
};

type CreatorSubscriptionPurchaseButtonProps = {
  creatorSlug: string;
  creatorName: string;
  isSubscribed: boolean;
  buttonLabel?: string;
  alreadyOwnedLabel?: string;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
};

export function CreatorSubscriptionPurchaseButton({
  creatorSlug,
  creatorName,
  isSubscribed,
  buttonLabel,
  alreadyOwnedLabel = "Subscribed",
  variant = "default",
  size = "default",
  className,
}: CreatorSubscriptionPurchaseButtonProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    purchaseCreatorSubscriptionAction,
    initialState,
  );

  useEffect(() => {
    if (state.ok) {
      router.refresh();
    }
  }, [router, state.ok]);

  const purchased = isSubscribed || state.ok || state.alreadyOwned;

  return (
    <form action={formAction} className="grid gap-2">
      <input type="hidden" name="creatorSlug" value={creatorSlug} />
      <Button
        type="submit"
        variant={variant}
        size={size}
        className={className}
        disabled={purchased || isPending}
      >
        {purchased
          ? alreadyOwnedLabel
          : isPending
            ? "Processing payment..."
            : buttonLabel ?? `Subscribe to ${creatorName}`}
      </Button>
      {state.message ? (
        <p className="text-xs text-muted-foreground">{state.message}</p>
      ) : null}
    </form>
  );
}
