import { parseIsoDateOnly } from "@/features/numerology/engine/date-only";
import { reduceToSingleDigit, sumDigits } from "@/features/numerology/engine/reduce-to-single-digit";

/**
 * Mystic Flutter numerology formulas — ported from:
 * - `lib/core/utils/numerology_service.dart`
 * - `lib/services/daily_guidance/personal_day_numerology_service.dart`
 */

export function reduceNumber(value: number, allowMaster = true): number {
  let x = Math.abs(Math.floor(value));
  if (x === 0) {
    return 0;
  }
  if (allowMaster && (x === 11 || x === 22 || x === 33)) {
    return x;
  }
  while (x > 9 && !(allowMaster && (x === 11 || x === 22 || x === 33))) {
    x = sumDigits(x);
  }
  return x;
}

export function lifePathFromIsoDate(birthDate: string): number {
  const { day, month, year } = parseIsoDateOnly(birthDate);
  return reduceNumber(sumDigits(day) + sumDigits(month) + sumDigits(year));
}

export function birthdayNumberFromIsoDate(birthDate: string): number {
  const { day } = parseIsoDateOnly(birthDate);
  return reduceNumber(day);
}

export function personalYearFromIsoDates(
  birthDate: string,
  forDate: string,
): number {
  const birth = parseIsoDateOnly(birthDate);
  const target = parseIsoDateOnly(forDate);
  const dayMonth = sumDigits(birth.day) + sumDigits(birth.month);
  const yearSum = sumDigits(target.year);
  return reduceNumber(dayMonth + yearSum);
}

export function personalMonthFromIsoDates(
  birthDate: string,
  forDate: string,
): number {
  const target = parseIsoDateOnly(forDate);
  return reduceNumber(
    personalYearFromIsoDates(birthDate, forDate) + target.month,
  );
}

/** Chain personal day (may be 11/22/33 before folding to 1–9). */
export function personalDayChainFromIsoDates(
  birthDate: string,
  forDate: string,
): number {
  const target = parseIsoDateOnly(forDate);
  return reduceNumber(
    personalMonthFromIsoDates(birthDate, forDate) + target.day,
  );
}

/** Sujok-style personal day used by Today / onboarding preview (1–9). */
export function sujokPersonalDayFromIsoDates(
  birthDate: string,
  forDate: string,
): number {
  const birth = parseIsoDateOnly(birthDate);
  const target = parseIsoDateOnly(forDate);
  const raw =
    target.day + target.month + target.year + birth.day + birth.month;
  return reduceToSingleDigit(raw);
}

export type NumerologyReading = {
  birthDate: string;
  forDate: string;
  lifePath: number;
  birthdayNumber: number;
  personalYear: number;
  personalMonth: number;
  personalDayChain: number;
  personalDay: number;
};

export function buildNumerologyReading(
  birthDate: string,
  forDate: string,
): NumerologyReading {
  return {
    birthDate,
    forDate,
    lifePath: lifePathFromIsoDate(birthDate),
    birthdayNumber: birthdayNumberFromIsoDate(birthDate),
    personalYear: personalYearFromIsoDates(birthDate, forDate),
    personalMonth: personalMonthFromIsoDates(birthDate, forDate),
    personalDayChain: personalDayChainFromIsoDates(birthDate, forDate),
    personalDay: sujokPersonalDayFromIsoDates(birthDate, forDate),
  };
}
