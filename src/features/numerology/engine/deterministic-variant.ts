import type { SupportedNumerologyLocale } from "@/features/numerology/types/numerology";

/**
 * Flutter `PersonalDayGuidanceDataset` uses fixed copy per digit (1–9).
 * There is no multi-variant array selection in the audited Today path.
 */
export function selectDeterministicVariantIndex(
  category: "summary" | "doAdvice" | "avoidAdvice",
  optionsLength: number,
  seedParts: string[],
): number {
  void category;
  void optionsLength;
  void seedParts;
  return 0;
}

export function buildContentKey(
  personalDayNumber: number,
  locale: SupportedNumerologyLocale,
): string {
  return `personal-day:${personalDayNumber}:${locale}`;
}

export function buildDeterministicSeedParts(input: {
  userSeed?: string;
  dateKey: string;
  personalDayNumber: number;
  locale: SupportedNumerologyLocale;
}): string[] {
  return [
    input.userSeed ?? "anonymous",
    input.dateKey,
    String(input.personalDayNumber),
    input.locale,
  ];
}
