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
  const entry = cookieHeader
    .split("; ")
    .find((part) => part.startsWith(`${cookieName}=`));

  if (!entry) {
    return null;
  }

  return entry.slice(cookieName.length + 1);
}

export function shouldWriteTimezoneCookie(
  timeZone: string,
  existingCookieValue: string | null,
): boolean {
  if (!timeZone) {
    return false;
  }

  if (!existingCookieValue) {
    return true;
  }

  return safeDecodeCookieValue(existingCookieValue) !== timeZone;
}

export function formatTimezoneCookieAssignment(
  cookieName: string,
  timeZone: string,
  maxAgeSeconds: number,
): string {
  return `${cookieName}=${encodeURIComponent(timeZone)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}
