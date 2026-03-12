import "server-only";

import { env } from "@/lib/config/env";

type LogLevel = "debug" | "info" | "warn" | "error";

type LogInput = {
  event: string;
  message: string;
  requestId?: string;
  metadata?: Record<string, unknown>;
};

const logLevelPriority: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function normalizeError(error: Error) {
  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
  };
}

function normalizeValue(value: unknown): unknown {
  if (value instanceof Error) {
    return normalizeError(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalizeValue(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, normalizeValue(entry)]),
    );
  }

  return value;
}

function shouldLog(level: LogLevel) {
  return logLevelPriority[level] >= logLevelPriority[env.logLevel];
}

function writeLog(level: LogLevel, input: LogInput) {
  if (!shouldLog(level)) {
    return;
  }

  const record = {
    timestamp: new Date().toISOString(),
    level,
    event: input.event,
    message: input.message,
    service: "onlyclaw-web",
    environment: env.appEnv,
    nodeEnv: env.nodeEnv,
    requestId: input.requestId,
    metadata: normalizeValue(input.metadata ?? {}),
  };

  const line = JSON.stringify(record);

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  console.log(line);
}

export function logDebug(input: LogInput) {
  writeLog("debug", input);
}

export function logInfo(input: LogInput) {
  writeLog("info", input);
}

export function logWarn(input: LogInput) {
  writeLog("warn", input);
}

export function logError(input: LogInput) {
  writeLog("error", input);
}
