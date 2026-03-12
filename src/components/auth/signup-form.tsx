"use client";

import { useActionState } from "react";

import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialSignupActionState } from "@/lib/auth/action-state";
import {
  signupAction,
} from "@/lib/auth/actions";
import { roleLabels } from "@/lib/auth/roles";

const roleOptions = [
  {
    label: roleLabels.FAN,
    value: "FAN",
    description: "Browse creators, unlock memberships, and join premium fan flows immediately.",
  },
  {
    label: roleLabels.CREATOR,
    value: "CREATOR",
    description: "Register now, then wait for manual approval before creator studio access opens.",
  },
] as const;

export function SignupForm() {
  const [state, formAction] = useActionState(signupAction, initialSignupActionState);

  return (
    <form action={formAction} className="mt-8 grid gap-5">
      <div className="grid gap-2">
        <Label htmlFor="displayName">Display name</Label>
        <Input
          id="displayName"
          name="displayName"
          type="text"
          placeholder="Display name"
          defaultValue={state.values?.displayName ?? ""}
          autoComplete="name"
          required
        />
        {state.errors?.displayName ? (
          <p className="text-sm font-medium text-destructive">{state.errors.displayName}</p>
        ) : null}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="signupEmail">Email</Label>
        <Input
          id="signupEmail"
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
        <Label htmlFor="signupPassword">Password</Label>
        <Input
          id="signupPassword"
          name="password"
          type="password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          required
          minLength={8}
        />
        {state.errors?.password ? (
          <p className="text-sm font-medium text-destructive">{state.errors.password}</p>
        ) : null}
      </div>

      <div className="grid gap-3">
        <Label>I want to join as</Label>
        <div className="grid gap-3 sm:grid-cols-2">
          {roleOptions.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer flex-col gap-2 rounded-3xl border border-white/10 bg-black/20 p-4 transition hover:border-primary/40"
            >
              <div className="flex items-center gap-3">
                <input
                  defaultChecked={state.values?.role ? state.values.role === option.value : option.value === "FAN"}
                  name="role"
                  type="radio"
                  value={option.value}
                  className="size-4 accent-[var(--color-primary)]"
                />
                <span className="font-medium text-foreground">{option.label}</span>
              </div>
              <span className="text-sm leading-6 text-muted-foreground">{option.description}</span>
            </label>
          ))}
        </div>
        {state.errors?.role ? (
          <p className="text-sm font-medium text-destructive">{state.errors.role}</p>
        ) : null}
      </div>

      {state.message ? (
        <div className="rounded-3xl border border-rose-400/20 bg-rose-400/8 p-4 text-sm text-rose-100">
          {state.message}
        </div>
      ) : null}

      <AuthSubmitButton idleLabel="Create account" pendingLabel="Creating account..." />
    </form>
  );
}
