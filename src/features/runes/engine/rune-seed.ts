import { RUNE_COUNT } from "@/features/runes/constants/canonical-runes";
import type { DateOnlyParts } from "@/features/runes/types/rune";
import { computeDayOfYear } from "@/features/runes/engine/date-key";

/**
 * Matches Flutter `RuneModularDailyService`:
 * seed = personalDayNumber * 1009 + dayOfYear + forDate.month * 31
 */
export function computeDailyRuneSeed(input: {
  personalDayNumber: number;
  forDate: DateOnlyParts;
}): number {
  const dayOfYear = computeDayOfYear(input.forDate);
  return (
    input.personalDayNumber * 1009 +
    dayOfYear +
    input.forDate.month * 31
  );
}

export function positiveModulo(value: number, divisor: number): number {
  const mod = value % divisor;
  const result = mod < 0 ? mod + divisor : mod;
  return result === 0 ? 0 : result;
}

export function runeIndexFromSeed(seed: number): number {
  return positiveModulo(seed, RUNE_COUNT);
}
