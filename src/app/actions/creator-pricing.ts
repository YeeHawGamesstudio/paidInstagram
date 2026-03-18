"use server";

import { revalidatePath } from "next/cache";

import { updateCreatorMembershipPrice } from "@/lib/creator/pricing";

export type CreatorPricingActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function updateCreatorPricingAction(
  _previousState: CreatorPricingActionState,
  formData: FormData,
): Promise<CreatorPricingActionState> {
  try {
    const result = await updateCreatorMembershipPrice({
      monthlyPriceCents: Number(formData.get("monthlyPriceCents") ?? 0),
    });

    revalidatePath("/creator");
    revalidatePath("/creator/pricing");
    revalidatePath("/fan/subscriptions");
    revalidatePath(`/creators/${result.creatorSlug}`);

    return {
      status: "success",
      message: "Membership price saved for beta.",
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Unable to save creator pricing.",
    };
  }
}
