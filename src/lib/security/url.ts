import "server-only";

export function getSafeDisplayUrl(value: string | null | undefined) {
  if (!value) {
    return undefined;
  }

  if (value.startsWith("/")) {
    return value;
  }

  try {
    const parsed = new URL(value);

    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString();
    }
  } catch {
    return undefined;
  }

  return undefined;
}
