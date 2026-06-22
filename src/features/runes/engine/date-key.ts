import type { DateOnlyParts } from "@/features/runes/types/rune";

/** Local calendar day-of-year — matches Flutter `DateTime.difference(jan1).inDays`. */
export function computeDayOfYear(parts: DateOnlyParts): number {
  const current = new Date(parts.year, parts.month - 1, parts.day);
  const jan1 = new Date(parts.year, 0, 1);
  return Math.round((current.getTime() - jan1.getTime()) / 86_400_000);
}

export function formatDateKey(parts: DateOnlyParts): string {
  const month = String(parts.month).padStart(2, "0");
  const day = String(parts.day).padStart(2, "0");
  return `${parts.year}-${month}-${day}`;
}

export function parseDateKey(dateKey: string): DateOnlyParts {
  const [year, month, day] = dateKey.split("-").map(Number);
  return { year, month, day };
}
