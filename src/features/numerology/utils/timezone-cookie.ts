export function safeDecodeCookieValue(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function getCookieValue(
  cookieName: string,
  cookieHeader: string,
): string | null {
  if (!cookieHeader) {
    return null;
  }

  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();
    if (trimmed.startsWith(`${cookieName}=`)) {
      return trimmed.slice(cookieName.length + 1);
    }
  }

  return null;
}

export function shouldWriteTimezoneCookie(
  timeZone: string,
  existingCookieValue: string | null,
): boolean {
  const normalizedTimeZone = timeZone.trim();
  if (!normalizedTimeZone) {
    return false;
  }

  const normalizedExisting = existingCookieValue?.trim();
  if (!normalizedExisting) {
    return true;
  }

  return safeDecodeCookieValue(normalizedExisting) !== normalizedTimeZone;
}

export function formatTimezoneCookieAssignment(
  cookieName: string,
  timeZone: string,
  maxAgeSeconds: number,
): string {
  return `${cookieName}=${encodeURIComponent(timeZone)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}
