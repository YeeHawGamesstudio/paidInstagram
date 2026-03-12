"use client";

import { useActionState } from "react";

import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialLoginActionState } from "@/lib/auth/action-state";
import {
  loginAction,
} from "@/lib/auth/actions";

type LoginFormProps = {
  next?: string;
};

export function LoginForm({ next }: LoginFormProps) {
  const [state, formAction] = useActionState(loginAction, initialLoginActionState);

  return (
    <form action={formAction} className="mt-8 grid gap-5">
      <input type="hidden" name="next" value={next ?? ""} />

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          defaultValue={state.values?.email ?? ""}
          autoComplete="email"
          required
        />
        {state.errors?.email ? (
          <p className="text-sm font-medium text-destructive">{state.errors.email}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          required
        />
        {state.errors?.password ? (
          <p className="text-sm font-medium text-destructive">{state.errors.password}</p>
        ) : null}
      </div>

      {state.message ? (
        <div className="rounded-3xl border border-rose-400/20 bg-rose-400/8 p-4 text-sm text-rose-100">
          {state.message}
        </div>
      ) : null}

      <AuthSubmitButton idleLabel="Log in" pendingLabel="Signing in..." />
    </form>
  );
}
