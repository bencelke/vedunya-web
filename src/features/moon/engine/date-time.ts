import { resolveTimeZone } from "@/features/numerology/engine/date-only";
import { TIMEZONE_COOKIE } from "@/features/numerology/constants";

export { TIMEZONE_COOKIE };

export function parseCalculationInstant(value: string): Date {
  const instant = new Date(value);
  if (Number.isNaN(instant.getTime())) {
    throw new Error("invalid-datetime");
  }
  return instant;
}

export function resolveMoonTimezone(cookieValue: string | undefined): string {
  return resolveTimeZone(cookieValue, "UTC");
}

export function resolveMoonDateKey(timezone: string, instant?: Date): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(instant ?? new Date());
}

export function buildMoonCalculationInput(input: {
  instant?: Date;
  timezone: string;
}): { calculationInstant: Date; timezone: string } {
  return {
    calculationInstant: input.instant ?? new Date(),
    timezone: input.timezone,
  };
}
