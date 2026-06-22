import {
  CANONICAL_RUNE_ORDER,
  CANONICAL_RUNE_BY_ID,
} from "@/features/runes/constants/canonical-runes";
import {
  computeDailyRuneSeed,
  runeIndexFromSeed,
} from "@/features/runes/engine/rune-seed";
import { formatDateKey } from "@/features/runes/engine/date-key";
import { resolveTodayRuneContent } from "@/features/runes/content/today-rune-content";
import type {
  CanonicalRuneId,
  DailyRuneSelection,
  DailyRuneSelectionInput,
} from "@/features/runes/types/rune";

export class DailyRuneSelectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DailyRuneSelectionError";
  }
}

export function selectDailyRune(
  input: DailyRuneSelectionInput,
): DailyRuneSelection {
  if (
    !Number.isFinite(input.personalDayNumber) ||
    input.personalDayNumber < 1 ||
    input.personalDayNumber > 9
  ) {
    throw new DailyRuneSelectionError("invalid-personal-day");
  }

  const seed = computeDailyRuneSeed(input);
  const runeIndex = runeIndexFromSeed(seed);
  const runeId = CANONICAL_RUNE_ORDER[runeIndex];

  if (!runeId) {
    throw new DailyRuneSelectionError("invalid-rune-index");
  }

  return {
    runeId,
    runeIndex,
    dateKey: formatDateKey(input.forDate),
    seed,
  };
}

export function getRuneDisplayName(
  runeId: CanonicalRuneId,
  locale: DailyRuneSelectionInput["locale"],
): string {
  const definition = CANONICAL_RUNE_BY_ID[runeId];
  return locale === "ru" ? definition.displayNameRu : definition.displayNameEn;
}

export function buildDailyRuneContent(input: DailyRuneSelectionInput & {
  selection: DailyRuneSelection;
}) {
  const localized = resolveTodayRuneContent(
    input.selection.runeId,
    input.locale,
    input.forDate.day,
  );

  if (!localized) {
    throw new DailyRuneSelectionError("missing-today-content");
  }

  const title = getRuneDisplayName(input.selection.runeId, input.locale);

  return {
    title,
    short: localized.summary,
    guidance: localized.summary,
    action: localized.action,
  };
}

export { resolveRuneId } from "@/features/runes/constants/rune-aliases";
