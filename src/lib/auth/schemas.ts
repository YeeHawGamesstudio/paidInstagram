import { z } from "zod";

const normalizedEmailSchema = z
  .string()
  .trim()
  .email("Enter a valid email address.")
  .transform((value) => value.toLowerCase());

export const loginSchema = z.object({
  email: normalizedEmailSchema,
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const signupSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Display name must be at least 2 characters.")
    .max(40, "Display name must be 40 characters or less."),
  email: normalizedEmailSchema,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password must be 72 characters or less."),
  role: z.enum(["FAN", "CREATOR"]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
