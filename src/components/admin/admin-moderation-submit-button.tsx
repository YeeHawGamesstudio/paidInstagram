"use client";

import { useFormStatus } from "react-dom";

import { Button, type ButtonProps } from "@/components/ui/button";

type AdminModerationSubmitButtonProps = ButtonProps & {
  idleLabel: string;
  pendingLabel: string;
};

export function AdminModerationSubmitButton({
  idleLabel,
  pendingLabel,
  disabled,
  ...props
}: AdminModerationSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={disabled || pending} {...props}>
      {pending ? pendingLabel : idleLabel}
    </Button>
  );
}
