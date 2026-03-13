"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/auth/actions";

type SignOutButtonProps = {
  className?: string;
  variant?: "default" | "outline" | "ghost" | "destructive";
};

function SignOutButtonInner({
  className,
  variant = "destructive",
}: SignOutButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant={variant} className={className} disabled={pending}>
      {pending ? "Signing out..." : "Sign out"}
    </Button>
  );
}

export function SignOutButton(props: SignOutButtonProps) {
  return (
    <form action={signOutAction}>
      <SignOutButtonInner {...props} />
    </form>
  );
}
