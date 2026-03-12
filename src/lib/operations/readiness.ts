import "server-only";

import { env } from "@/lib/config/env";
import { prisma } from "@/lib/prisma/client";

export type OperationalCheckStatus = "pass" | "warn" | "fail";

export type OperationalCheck = {
  detail: string;
  id: string;
  label: string;
  status: OperationalCheckStatus;
};

export type OperationalReadinessSnapshot = {
  checkedAt: string;
  checks: OperationalCheck[];
  environment: typeof env.appEnv;
  status: OperationalCheckStatus;
  summary: {
    fail: number;
    pass: number;
    warn: number;
  };
};

function summarizeChecks(checks: OperationalCheck[]) {
  const summary = {
    fail: 0,
    pass: 0,
    warn: 0,
  };

  for (const check of checks) {
    summary[check.status] += 1;
  }

  return summary;
}

function deriveStatus(checks: OperationalCheck[]): OperationalCheckStatus {
  if (checks.some((check) => check.status === "fail")) {
    return "fail";
  }

  if (checks.some((check) => check.status === "warn")) {
    return "warn";
  }

  return "pass";
}

function getStaticChecks(): OperationalCheck[] {
  const checks: OperationalCheck[] = [
    {
      id: "environment-separation",
      label: "Environment separation",
      status: env.appEnv !== "development" && env.nodeEnv !== "production" ? "fail" : "pass",
      detail:
        env.appEnv !== "development" && env.nodeEnv !== "production"
          ? `APP_ENV=${env.appEnv} is running with NODE_ENV=${env.nodeEnv}. Staging and production must run with production runtime settings.`
          : `APP_ENV=${env.appEnv} and NODE_ENV=${env.nodeEnv}. Deployments should use isolated infrastructure and secrets per environment.`,
    },
  ];

  checks.push({
    id: "demo-auth",
    label: "Demo authentication",
    status: env.allowDemoAuth && env.appEnv !== "development" ? "fail" : "pass",
    detail: env.allowDemoAuth
      ? "Demo auth is enabled. Shared launch environments must not rely on a global demo viewer."
      : "Demo auth is disabled.",
  });

  checks.push({
    id: "demo-data-fallback",
    label: "Demo data fallback",
    status: env.allowDemoDataFallback && env.appEnv !== "development" ? "fail" : "pass",
    detail: env.allowDemoDataFallback
      ? "Demo data fallback is enabled. Launch environments should fail visibly instead of silently serving seeded content."
      : "Demo data fallback is disabled.",
  });

  checks.push({
    id: "billing-provider",
    label: "Billing provider mode",
    status: env.billingUsesMockProvider && env.appEnv !== "development" ? "fail" : "pass",
    detail: env.billingUsesMockProvider
      ? "Billing is using the mock provider. This is acceptable for local development only."
      : `Billing provider "${env.billingProvider}" is configured.`,
  });

  checks.push({
    id: "media-origin-allowlist",
    label: "Media origin allowlist",
    status: env.allowedMediaHosts.length === 0 && env.appEnv !== "development" ? "fail" : "pass",
    detail:
      env.allowedMediaHosts.length > 0
        ? `Protected media is restricted to: ${env.allowedMediaHosts.join(", ")}`
        : "No media host allowlist is configured. Launch environments should pin allowed origins.",
  });

  return checks;
}

async function getDatabaseCheck(): Promise<OperationalCheck> {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return {
      id: "database",
      label: "Database connectivity",
      status: "pass",
      detail: "Primary database responded to a lightweight readiness query.",
    };
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "Database connectivity check failed.";

    return {
      id: "database",
      label: "Database connectivity",
      status: "fail",
      detail,
    };
  }
}

export async function getOperationalReadinessSnapshot(): Promise<OperationalReadinessSnapshot> {
  const checks = [await getDatabaseCheck(), ...getStaticChecks()];

  return {
    checkedAt: new Date().toISOString(),
    checks,
    environment: env.appEnv,
    status: deriveStatus(checks),
    summary: summarizeChecks(checks),
  };
}
