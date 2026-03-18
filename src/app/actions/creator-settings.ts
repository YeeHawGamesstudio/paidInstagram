"use server";

import { revalidatePath } from "next/cache";

import { updateCreatorSettings } from "@/lib/creator/settings";

export type CreatorSettingsActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function updateCreatorSettingsAction(
  _previousState: CreatorSettingsActionState,
  formData: FormData,
): Promise<CreatorSettingsActionState> {
  try {
    const result = await updateCreatorSettings({
      displayName: String(formData.get("displayName") ?? ""),
      username: String(formData.get("username") ?? ""),
      headline: String(formData.get("headline") ?? ""),
      bio: String(formData.get("bio") ?? ""),
      rightsContactEmail: String(formData.get("rightsContactEmail") ?? ""),
      adultDisclosure: String(formData.get("adultDisclosure") ?? ""),
    });

    revalidatePath("/creator");
    revalidatePath("/creator/settings");
    revalidatePath(`/creators/${result.previousSlug}`);
    revalidatePath(`/creators/${result.nextSlug}`);

    return {
      status: "success",
      message: "Profile settings saved for beta.",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to save creator settings.",
    };
  }
}
