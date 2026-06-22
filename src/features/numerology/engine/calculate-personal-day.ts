import {
  formatIsoDateOnly,
  parseIsoDateOnly,
  type DateOnlyError,
} from "@/features/numerology/engine/date-only";
import { reduceToSingleDigit } from "@/features/numerology/engine/reduce-to-single-digit";
import type {
  PersonalDayCalculation,
  PersonalDayInput,
} from "@/features/numerology/types/numerology";

export class PersonalDayCalculationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PersonalDayCalculationError";
  }
}

export function calculatePersonalDay(
  input: PersonalDayInput,
): PersonalDayCalculation {
  let birthParts;
  let calculationParts;

  try {
    birthParts = parseIsoDateOnly(input.birthDate);
    calculationParts = parseIsoDateOnly(input.calculationDate);
  } catch (error) {
    const reason =
      error instanceof Error && error.name === "DateOnlyError"
        ? error.message
        : "invalid-date-input";
    throw new PersonalDayCalculationError(reason);
  }

  const rawValue =
    calculationParts.day +
    calculationParts.month +
    calculationParts.year +
    birthParts.day +
    birthParts.month;

  const personalDayNumber = reduceToSingleDigit(rawValue);

  return {
    birthDay: birthParts.day,
    birthMonth: birthParts.month,
    currentDay: calculationParts.day,
    currentMonth: calculationParts.month,
    currentYear: calculationParts.year,
    rawValue,
    personalDayNumber,
    dateKey: formatIsoDateOnly(calculationParts),
  };
}

export type { DateOnlyError };
