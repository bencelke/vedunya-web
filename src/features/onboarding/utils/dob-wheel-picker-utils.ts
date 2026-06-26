import { combineIsoParts, daysInMonth, parseIsoParts } from "@/features/onboarding/utils/dob-input-utils";
import { dateOfBirthSchema } from "@/features/profile/schemas/onboarding-schema";
import type { SupportedLocale } from "@/config/app-config";

export const MONTH_LABELS_EN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export const MONTH_LABELS_RU = [
  "Янв",
  "Фев",
  "Мар",
  "Апр",
  "Май",
  "Июн",
  "Июл",
  "Авг",
  "Сен",
  "Окт",
  "Ноя",
  "Дек",
] as const;

export function getMonthLabels(locale: SupportedLocale): readonly string[] {
  return locale === "ru" ? MONTH_LABELS_RU : MONTH_LABELS_EN;
}

export const DEFAULT_WHEEL_YEAR = 1990;

export type DobWheelParts = {
  day: number;
  month: number;
  year: number;
};

export function getDefaultWheelParts(maxYear = new Date().getFullYear()): DobWheelParts {
  return { day: 15, month: 6, year: Math.min(DEFAULT_WHEEL_YEAR, maxYear) };
}

export function parseWheelValue(value?: string): DobWheelParts {
  if (!value) {
    return getDefaultWheelParts();
  }

  const parts = parseIsoParts(value);
  if (!parts.day || !parts.month || !parts.year) {
    return getDefaultWheelParts();
  }

  return {
    day: Number(parts.day),
    month: Number(parts.month),
    year: Number(parts.year),
  };
}

export function clampDayForMonth(day: number, month: number, year: number): number {
  const maxDay = daysInMonth(month, year);
  return Math.min(Math.max(1, day), maxDay);
}

export function resolveWheelPickerValue(
  day: number,
  month: number,
  year: number,
): string | null {
  const clampedDay = clampDayForMonth(day, month, year);
  const iso = combineIsoParts(String(clampedDay), String(month), String(year));
  if (!iso) {
    return null;
  }

  const result = dateOfBirthSchema.safeParse(iso);
  return result.success ? iso : null;
}

export function buildWheelYearOptions(
  minYear = 1900,
  maxYear = new Date().getFullYear(),
): number[] {
  const years: number[] = [];
  for (let year = maxYear; year >= minYear; year -= 1) {
    years.push(year);
  }
  return years;
}

export function buildWheelDayOptions(month: number, year: number): number[] {
  const limit = daysInMonth(month, year);
  return Array.from({ length: limit }, (_, index) => index + 1);
}

export function formatDisplayDate(value: string, locale: SupportedLocale): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return "";
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function clampWheelParts(parts: DobWheelParts): DobWheelParts {
  return {
    ...parts,
    day: clampDayForMonth(parts.day, parts.month, parts.year),
  };
}
