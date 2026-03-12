import "server-only";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitInput = {
  key: string;
  limit: number;
  windowMs: number;
  message?: string;
};

declare global {
  var __onlyClawRateLimits: Map<string, RateLimitEntry> | undefined;
}

const rateLimitStore = globalThis.__onlyClawRateLimits ?? new Map<string, RateLimitEntry>();

if (!globalThis.__onlyClawRateLimits) {
  globalThis.__onlyClawRateLimits = rateLimitStore;
}

export class RateLimitExceededError extends Error {
  readonly retryAfterSeconds: number;

  constructor(message: string, retryAfterSeconds: number) {
    super(message);
    this.name = "RateLimitExceededError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

function pruneExpiredEntries(now: number) {
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

export function consumeRateLimit(input: RateLimitInput) {
  const now = Date.now();
  pruneExpiredEntries(now);

  const existing = rateLimitStore.get(input.key);

  if (!existing || existing.resetAt <= now) {
    rateLimitStore.set(input.key, {
      count: 1,
      resetAt: now + input.windowMs,
    });

    return {
      allowed: true,
      remaining: Math.max(input.limit - 1, 0),
      retryAfterSeconds: 0,
    } as const;
  }

  if (existing.count >= input.limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(Math.ceil((existing.resetAt - now) / 1000), 1),
    } as const;
  }

  existing.count += 1;
  rateLimitStore.set(input.key, existing);

  return {
    allowed: true,
    remaining: Math.max(input.limit - existing.count, 0),
    retryAfterSeconds: 0,
  } as const;
}

export function enforceRateLimit(input: RateLimitInput) {
  const result = consumeRateLimit(input);

  if (!result.allowed) {
    throw new RateLimitExceededError(
      input.message ?? "Too many requests. Please try again shortly.",
      result.retryAfterSeconds,
    );
  }

  return result;
}
