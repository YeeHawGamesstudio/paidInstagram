"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  ADULT_ACCESS_COOKIE_NAME,
  ADULT_ACCESS_COOKIE_VALUE,
  normalizeComplianceRedirectTarget,
} from "@/lib/compliance/scaffolding";

export async function acknowledgeAdultAccessAction(formData: FormData) {
  const nextTarget = normalizeComplianceRedirectTarget(formData.get("next")?.toString());

  const cookieStore = await cookies();
  cookieStore.set(ADULT_ACCESS_COOKIE_NAME, ADULT_ACCESS_COOKIE_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect(nextTarget);
}
