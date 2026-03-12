import { z } from "zod";

export const userRoleSchema = z.enum(["FAN", "CREATOR", "ADMIN"]);

export const onboardingIntentSchema = z.object({
  email: z.email(),
  displayName: z.string().min(2).max(40),
  role: userRoleSchema,
});

export type OnboardingIntentInput = z.infer<typeof onboardingIntentSchema>;
