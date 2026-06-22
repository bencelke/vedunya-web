import type { PersonalDayResult } from "@/features/numerology/types/numerology";
import type { DailyRuneResult } from "@/features/runes/types/rune";
import type { DailyGuidancePrimary } from "@/features/daily-guidance/types/daily-guidance-view-model";

type ComposePrimaryInput = {
  primaryLabel: string;
  numerology: PersonalDayResult | null;
  rune: DailyRuneResult | null;
};

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * Primary message uses personal-day summary when available.
 * Action prefers personal-day advice; falls back to rune action only when needed.
 */
export function composePrimaryMessage(
  input: ComposePrimaryInput,
): DailyGuidancePrimary | null {
  const numerology = input.numerology;
  const rune = input.rune;

  if (numerology) {
    const action =
      numerology.content.doAdvice.trim() ||
      rune?.content.action.trim() ||
      "";

    if (!numerology.content.summary.trim() && !action) {
      return null;
    }

    return {
      label: input.primaryLabel,
      title: numerology.content.title.trim() || numerology.content.summary.trim(),
      message: numerology.content.summary.trim(),
      action,
    };
  }

  if (rune) {
    const message = rune.content.short.trim() || rune.content.guidance.trim();
    const action = rune.content.action.trim();

    if (!message && !action) {
      return null;
    }

    return {
      label: input.primaryLabel,
      title: rune.content.title.trim(),
      message,
      action,
    };
  }

  return null;
}

export function shouldShowRuneAction(
  primaryAction: string,
  runeAction: string,
): boolean {
  if (!runeAction.trim()) {
    return false;
  }

  return normalizeText(primaryAction) !== normalizeText(runeAction);
}
