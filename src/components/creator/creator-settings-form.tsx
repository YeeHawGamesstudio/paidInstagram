"use client";

import { useActionState } from "react";

import { updateCreatorSettingsAction, type CreatorSettingsActionState } from "@/app/actions/creator-settings";
import type { CreatorSettingsView } from "@/lib/creator/server-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: CreatorSettingsActionState = {
  status: "idle",
  message: "",
};

type CreatorSettingsFormProps = {
  settings: CreatorSettingsView;
};

export function CreatorSettingsForm({ settings }: CreatorSettingsFormProps) {
  const [state, formAction, pending] = useActionState(updateCreatorSettingsAction, initialState);

  return (
    <form action={formAction} className="grid gap-6">
      <div className="grid gap-4">
        <p className="text-sm font-medium text-foreground">Public identity</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="display-name">Display name</Label>
            <Input id="display-name" name="displayName" defaultValue={settings.displayName} maxLength={40} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" defaultValue={settings.username} maxLength={24} required />
            <p className="text-xs text-muted-foreground">Saving updates the public creator URL slug too.</p>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="headline">Headline</Label>
          <Input id="headline" name="headline" defaultValue={settings.headline} maxLength={120} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" name="bio" defaultValue={settings.bio} maxLength={500} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" defaultValue={settings.location} disabled />
          <p className="text-xs text-muted-foreground">Location editing is coming soon.</p>
        </div>
      </div>

      <div className="grid gap-4">
        <p className="text-sm font-medium text-foreground">Subscriber expectations</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="reply-window">Reply promise</Label>
            <Input id="reply-window" defaultValue={settings.replyWindow} disabled />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="welcome-message">Welcome message</Label>
          <Textarea id="welcome-message" defaultValue={settings.welcomeMessage} disabled />
          <p className="text-xs text-muted-foreground">
            Automated welcome messages are coming soon.
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        <p className="text-sm font-medium text-foreground">Compliance</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="rights-contact">Rights / DMCA contact</Label>
            <Input
              id="rights-contact"
              name="rightsContactEmail"
              type="email"
              defaultValue={settings.rightsContactEmail}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="adult-disclosure">Adult-content disclosure</Label>
            <Input
              id="adult-disclosure"
              name="adultDisclosure"
              defaultValue={settings.adultDisclosure}
              maxLength={160}
            />
          </div>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Save changes</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Changes to your display name, username, headline, bio, and compliance fields are saved immediately.
          Other settings are coming soon.
        </p>
        {state.message ? (
          <p
            className={`mt-3 text-sm ${
              state.status === "error" ? "text-destructive" : "text-[var(--color-success,#7ee787)]"
            }`}
          >
            {state.message}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save profile settings"}
          </Button>
        </div>
      </div>
    </form>
  );
}
