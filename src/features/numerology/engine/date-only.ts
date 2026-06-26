import type { DateOnlyParts } from "@/features/numerology/types/numerology";
import { safeDecodeCookieValue } from "@/features/numerology/utils/timezone-cookie";

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export class DateOnlyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DateOnlyError";
  }
}

export function parseIsoDateOnly(value: string): DateOnlyParts {
  const match = ISO_DATE_PATTERN.exec(value.trim());
  if (!match) {
    throw new DateOnlyError("invalid-iso-date");
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (!isValidDateParts({ year, month, day })) {
    throw new DateOnlyError("invalid-calendar-date");
  }

  return { year, month, day };
}

export function isValidDateParts(parts: DateOnlyParts): boolean {
  if (parts.month < 1 || parts.month > 12 || parts.day < 1 || parts.day > 31) {
    return false;
  }

  const probe = new Date(parts.year, parts.month - 1, parts.day);
  return (
    probe.getFullYear() === parts.year &&
    probe.getMonth() === parts.month - 1 &&
    probe.getDate() === parts.day
  );
}

export function formatIsoDateOnly(parts: DateOnlyParts): string {
  const month = String(parts.month).padStart(2, "0");
  const day = String(parts.day).padStart(2, "0");
  return `${parts.year}-${month}-${day}`;
}

export function dateOnlyFromLocalDate(date: Date): DateOnlyParts {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

export function dateOnlyFromUtcTimestamp(
  seconds: number,
  nanoseconds = 0,
): DateOnlyParts {
  const instant = new Date(seconds * 1000 + Math.floor(nanoseconds / 1_000_000));
  return {
    year: instant.getUTCFullYear(),
    month: instant.getUTCMonth() + 1,
    day: instant.getUTCDate(),
  };
}

export function dateOnlyFromFirestoreTimestamp(value: {
  toDate(): Date;
}): DateOnlyParts {
  const date = value.toDate();
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

export function getTodayDateKeyInTimeZone(timeZone: string): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(new Date());
}

export function resolveTimeZone(
  cookieTimeZone: string | undefined,
  fallback = "UTC",
): string {
  const candidate = cookieTimeZone?.trim();
  if (!candidate) {
    return fallback;
  }

  const decoded = safeDecodeCookieValue(candidate);

  try {
    Intl.DateTimeFormat(undefined, { timeZone: decoded });
    return decoded;
  } catch {
    return fallback;
  }
}
