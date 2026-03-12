"use server";

import { redirect } from "next/navigation";
import type { AuthError } from "@supabase/supabase-js";

import { CreatorApplicationStatus, Prisma, UserRole } from "@/generated/prisma/client";
import type {
  LoginActionState,
  SignupActionState,
} from "@/lib/auth/action-state";
import { findOrLinkUserBySupabaseIdentity } from "@/lib/auth/user-identity";
import { prisma } from "@/lib/prisma/client";
import { loginSchema, signupSchema } from "@/lib/auth/schemas";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function mapValidationErrors(error: Prisma.PrismaClientKnownRequestError | Error) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return "That email or username is already in use.";
  }

  return "We couldn't save your account right now. Please try again.";
}

function mapSupabaseAuthError(error: AuthError | Error) {
  const normalizedMessage = error.message.trim().toLowerCase();

  if (
    normalizedMessage.includes("invalid login credentials") ||
    normalizedMessage.includes("email not confirmed")
  ) {
    return "Invalid email or password.";
  }

  if (
    normalizedMessage.includes("user already registered") ||
    normalizedMessage.includes("already been registered")
  ) {
    return "An account with that email already exists.";
  }

  if (normalizedMessage.includes("password should be at least")) {
    return "Password must be at least 8 characters.";
  }

  return "We couldn't complete authentication right now. Please try again.";
}

function buildLoginState(formData: FormData): LoginActionState {
  return {
    values: {
      email: getStringValue(formData, "email"),
    },
  };
}

function buildSignupState(formData: FormData): SignupActionState {
  const role = getStringValue(formData, "role");

  return {
    values: {
      displayName: getStringValue(formData, "displayName"),
      email: getStringValue(formData, "email"),
      role: role === "CREATOR" ? "CREATOR" : "FAN",
    },
  };
}

function getSafeRedirectTarget(rawTarget: string) {
  if (!rawTarget.startsWith("/") || rawTarget.startsWith("//")) {
    return "/auth/redirect";
  }

  return rawTarget;
}

function slugifyUsername(displayName: string) {
  const slug = displayName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);

  return slug || "fan";
}

async function getUniqueUsername(tx: Prisma.TransactionClient, displayName: string) {
  const baseUsername = slugifyUsername(displayName);

  for (let index = 0; index < 100; index += 1) {
    const candidate = index === 0 ? baseUsername : `${baseUsername}${index + 1}`;
    const existingProfile = await tx.profile.findUnique({
      where: {
        username: candidate,
      },
      select: {
        id: true,
      },
    });

    if (!existingProfile) {
      return candidate;
    }
  }

  throw new Error("Unable to generate a unique username.");
}

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const baseState = buildLoginState(formData);
  const parsedInput = loginSchema.safeParse({
    email: getStringValue(formData, "email"),
    password: getStringValue(formData, "password"),
  });

  if (!parsedInput.success) {
    const issue = parsedInput.error.issues[0];

    return {
      ...baseState,
      message: issue?.message ?? "Enter a valid email and password.",
      errors: issue?.path[0]
        ? {
            [issue.path[0] as "email" | "password"]: issue.message,
          }
        : undefined,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsedInput.data.email,
    password: parsedInput.data.password,
  });

  if (error) {
    return {
      ...baseState,
      message: mapSupabaseAuthError(error),
    };
  }

  const appUser = data.user
    ? await findOrLinkUserBySupabaseIdentity({
        email: data.user.email,
        id: data.user.id,
      })
    : null;

  if (!appUser) {
    await supabase.auth.signOut();
    return {
      ...baseState,
      message: "Your account is authenticated, but no app profile is linked to it yet.",
    };
  }

  if (!appUser.isActive) {
    await supabase.auth.signOut();
    return {
      ...baseState,
      message: "This account is currently inactive.",
    };
  }

  redirect(getSafeRedirectTarget(getStringValue(formData, "next") || "/auth/redirect"));
}

export async function signupAction(
  _previousState: SignupActionState,
  formData: FormData,
): Promise<SignupActionState> {
  const baseState = buildSignupState(formData);
  const parsedInput = signupSchema.safeParse({
    displayName: getStringValue(formData, "displayName"),
    email: getStringValue(formData, "email"),
    password: getStringValue(formData, "password"),
    role: getStringValue(formData, "role"),
  });

  if (!parsedInput.success) {
    const issue = parsedInput.error.issues[0];

    return {
      ...baseState,
      message: issue?.message ?? "Review the highlighted fields and try again.",
      errors: issue?.path[0]
        ? {
            [issue.path[0] as "displayName" | "email" | "password" | "role"]: issue.message,
          }
        : undefined,
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email: parsedInput.data.email,
    },
    select: {
      id: true,
    },
  });

  if (existingUser) {
    return {
      ...baseState,
      message: "An account with that email already exists.",
      errors: {
        email: "An account with that email already exists.",
      },
    };
  }

  const adminSupabase = createSupabaseAdminClient();
  let createdSupabaseUserId: string | null = null;

  try {
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email: parsedInput.data.email,
      email_confirm: true,
      password: parsedInput.data.password,
      user_metadata: {
        displayName: parsedInput.data.displayName,
        role: parsedInput.data.role,
      },
    });

    if (authError || !authData.user) {
      return {
        ...baseState,
        message: mapSupabaseAuthError(authError ?? new Error("Unable to create auth user.")),
      };
    }

    createdSupabaseUserId = authData.user.id;

    await prisma.$transaction(async (tx) => {
      const username = await getUniqueUsername(tx, parsedInput.data.displayName);
      const user = await tx.user.create({
        data: {
          supabaseAuthUserId: createdSupabaseUserId,
          email: parsedInput.data.email,
          name: parsedInput.data.displayName,
          role: parsedInput.data.role as UserRole,
          profile: {
            create: {
              displayName: parsedInput.data.displayName,
              username,
            },
          },
        },
        select: {
          id: true,
        },
      });

      if (parsedInput.data.role === "CREATOR") {
        await tx.creatorApplication.create({
          data: {
            applicantId: user.id,
            requestedSlug: username,
            status: CreatorApplicationStatus.SUBMITTED,
          },
        });
      }
    });
  } catch (error) {
    if (createdSupabaseUserId) {
      await adminSupabase.auth.admin.deleteUser(createdSupabaseUserId);
    }

    return {
      ...baseState,
      message: mapValidationErrors(error as Prisma.PrismaClientKnownRequestError | Error),
    };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsedInput.data.email,
    password: parsedInput.data.password,
  });

  if (error) {
    return {
      ...baseState,
      message: mapSupabaseAuthError(error),
    };
  }

  redirect("/auth/redirect");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
