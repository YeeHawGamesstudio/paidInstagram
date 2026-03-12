import "server-only";

import { z } from "zod";

import { userRoles } from "@/lib/auth/roles";

const DEVELOPMENT_WEBHOOK_SECRET = "dev-onlyclaw-webhook-secret";
const DEVELOPMENT_MEDIA_SIGNING_SECRET = "dev-onlyclaw-media-signing-secret";
const DEVELOPMENT_AUTH_SECRET = "dev-onlyclaw-auth-secret";

const rawEnvSchema = z.object({
  APP_ENV: z.enum(["development", "staging", "production"]).optional(),
  ALLOWED_MEDIA_HOSTS: z.string().optional(),
  ALLOW_DEMO_AUTH: z.string().optional(),
  ALLOW_DEMO_DATA_FALLBACK: z.string().optional(),
  AUTH_SECRET: z.string().min(16).optional(),
  BILLING_PROVIDER: z.string().min(1).optional(),
  BILLING_PROVIDER_WEBHOOK_SECRET: z.string().min(1).optional(),
  BILLING_RECONCILIATION_BATCH_SIZE: z.string().optional(),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required."),
  DEMO_VIEWER_EMAIL: z.string().email().optional(),
  DEMO_VIEWER_ROLE: z.enum(userRoles).optional(),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).optional(),
  MEDIA_SIGNING_SECRET: z.string().min(16).optional(),
  MOCK_FAN_EMAIL: z.string().email().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  WEBHOOK_SIGNATURE_TOLERANCE_SECONDS: z.string().optional(),
});

function parseBoolean(value: string | undefined, defaultValue: boolean) {
  if (value === undefined) {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();

  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  throw new Error(`Invalid boolean environment value: ${value}`);
}

function parseInteger(value: string | undefined, defaultValue: number) {
  if (value === undefined) {
    return defaultValue;
  }

  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid integer environment value: ${value}`);
  }

  return parsed;
}

function parseStringList(value: string | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

const parsedEnv = rawEnvSchema.parse(process.env);
const demoViewerEmail = parsedEnv.DEMO_VIEWER_EMAIL ?? parsedEnv.MOCK_FAN_EMAIL;
const demoViewerRole =
  parsedEnv.DEMO_VIEWER_ROLE ?? (parsedEnv.MOCK_FAN_EMAIL ? "FAN" : undefined);
const appEnv =
  parsedEnv.APP_ENV ??
  (parsedEnv.NODE_ENV === "production" ? "production" : "development");
const isProduction = parsedEnv.NODE_ENV === "production";
const isDevelopmentAppEnv = appEnv === "development";
const requiresStrictLaunchSeparation = appEnv === "staging" || appEnv === "production";
const billingProvider = parsedEnv.BILLING_PROVIDER ?? (isDevelopmentAppEnv ? "mock" : undefined);
const allowDemoAuth = parseBoolean(parsedEnv.ALLOW_DEMO_AUTH, isDevelopmentAppEnv);
const allowDemoDataFallback = parseBoolean(
  parsedEnv.ALLOW_DEMO_DATA_FALLBACK,
  isDevelopmentAppEnv,
);
const billingProviderWebhookSecret =
  parsedEnv.BILLING_PROVIDER_WEBHOOK_SECRET ??
  (isDevelopmentAppEnv ? DEVELOPMENT_WEBHOOK_SECRET : undefined);
const mediaSigningSecret =
  parsedEnv.MEDIA_SIGNING_SECRET ??
  (isDevelopmentAppEnv ? DEVELOPMENT_MEDIA_SIGNING_SECRET : undefined);
const authSecret =
  parsedEnv.AUTH_SECRET ?? (isDevelopmentAppEnv ? DEVELOPMENT_AUTH_SECRET : undefined);
const webhookSignatureToleranceSeconds = parseInteger(
  parsedEnv.WEBHOOK_SIGNATURE_TOLERANCE_SECONDS,
  300,
);
const logLevel =
  parsedEnv.LOG_LEVEL ?? (parsedEnv.NODE_ENV === "development" ? "debug" : "info");

if (allowDemoAuth && !demoViewerEmail) {
  throw new Error(
    "ALLOW_DEMO_AUTH requires DEMO_VIEWER_EMAIL or MOCK_FAN_EMAIL. Refusing to auto-select the first active account.",
  );
}

if (requiresStrictLaunchSeparation && parsedEnv.NODE_ENV !== "production") {
  throw new Error('APP_ENV="staging" and APP_ENV="production" require NODE_ENV="production".');
}

if (!isDevelopmentAppEnv && allowDemoAuth) {
  throw new Error("ALLOW_DEMO_AUTH must be disabled outside local development.");
}

if (!isDevelopmentAppEnv && allowDemoDataFallback) {
  throw new Error("ALLOW_DEMO_DATA_FALLBACK must be disabled outside local development.");
}

if (!isDevelopmentAppEnv && billingProvider === "mock") {
  throw new Error('BILLING_PROVIDER="mock" is not allowed outside local development.');
}

if (billingProvider && !billingProviderWebhookSecret) {
  throw new Error("BILLING_PROVIDER_WEBHOOK_SECRET is required when billing webhooks are enabled.");
}

if (!mediaSigningSecret) {
  throw new Error("MEDIA_SIGNING_SECRET is required to issue protected media URLs.");
}

if (!authSecret) {
  throw new Error("AUTH_SECRET is required to issue authenticated sessions.");
}

if (!isDevelopmentAppEnv && billingProviderWebhookSecret === DEVELOPMENT_WEBHOOK_SECRET) {
  throw new Error("BILLING_PROVIDER_WEBHOOK_SECRET must be unique outside local development.");
}

if (!isDevelopmentAppEnv && mediaSigningSecret === DEVELOPMENT_MEDIA_SIGNING_SECRET) {
  throw new Error("MEDIA_SIGNING_SECRET must be unique outside local development.");
}

if (!isDevelopmentAppEnv && authSecret === DEVELOPMENT_AUTH_SECRET) {
  throw new Error("AUTH_SECRET must be unique outside local development.");
}

export const env = {
  appEnv,
  allowedMediaHosts: parseStringList(parsedEnv.ALLOWED_MEDIA_HOSTS),
  allowDemoAuth,
  allowDemoDataFallback,
  authSecret,
  billingProvider,
  billingProviderWebhookSecret,
  billingReconciliationBatchSize: parseInteger(parsedEnv.BILLING_RECONCILIATION_BATCH_SIZE, 25),
  billingUsesMockProvider: billingProvider === "mock",
  databaseUrl: parsedEnv.DATABASE_URL,
  demoViewerEmail,
  demoViewerRole,
  isProduction,
  logLevel,
  mediaSigningSecret,
  nodeEnv: parsedEnv.NODE_ENV,
  webhookSignatureToleranceSeconds,
} as const;
