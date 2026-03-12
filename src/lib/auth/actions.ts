"use server";

import { AuthError } from "next-auth";

import { signIn, signOut } from "@/auth";
import { CreatorApplicationStatus, Prisma, UserRole } from "@/generated/prisma/client";
import type {
  LoginActionState,
  SignupActionState,
} from "@/lib/auth/action-state";
import { prisma } from "@/lib/prisma/client";
import { hashPassword } from "@/lib/auth/password";
import { loginSchema, signupSchema } from "@/lib/auth/schemas";

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

function mapAuthError(error: AuthError) {
  if (error.type === "CredentialsSignin") {
    return "Invalid email or password.";
  }

  return "We couldn't sign you in right now. Please try again.";
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

  try {
    await signIn("credentials", {
      email: parsedInput.data.email,
      password: parsedInput.data.password,
      redirectTo: getSafeRedirectTarget(getStringValue(formData, "next") || "/auth/redirect"),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        ...baseState,
        message: mapAuthError(error),
      };
    }

    throw error;
  }

  return baseState;
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

  const passwordHash = await hashPassword(parsedInput.data.password);
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

  try {
    await prisma.$transaction(async (tx) => {
      const username = await getUniqueUsername(tx, parsedInput.data.displayName);
      const user = await tx.user.create({
        data: {
          email: parsedInput.data.email,
          name: parsedInput.data.displayName,
          role: parsedInput.data.role as UserRole,
          passwordHash,
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
    return {
      ...baseState,
      message: mapValidationErrors(error as Prisma.PrismaClientKnownRequestError | Error),
    };
  }

  try {
    await signIn("credentials", {
      email: parsedInput.data.email,
      password: parsedInput.data.password,
      redirectTo: "/auth/redirect",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        ...baseState,
        message: mapAuthError(error),
      };
    }

    throw error;
  }

  return baseState;
}

export async function signOutAction() {
  await signOut({
    redirectTo: "/",
  });
}
