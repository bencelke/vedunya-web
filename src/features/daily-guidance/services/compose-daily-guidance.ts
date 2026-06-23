import { getRuneAssetPath } from "@/features/runes/constants/rune-assets";
import { moonPhaseArtDescriptor } from "@/features/moon/engine/phase-asset-map";
import type { MoonGuidanceResult } from "@/features/moon/types/moon";
import type { PersonalDayResult } from "@/features/numerology/types/numerology";
import type { DailyRuneResult } from "@/features/runes/types/rune";
import {
  composePrimaryMessage,
  shouldShowRuneAction,
} from "@/features/daily-guidance/services/compose-primary-message";
import type {
  DailyGuidanceMoonSection,
  DailyGuidanceNumerologySection,
  DailyGuidanceRuneSection,
  DailyGuidanceViewModel,
} from "@/features/daily-guidance/types/daily-guidance-view-model";

type ComposeAuthenticatedInput = {
  formattedDate: string;
  greetingName: string | null;
  premiumActive: boolean;
  runeDeep?: string | null;
  labels: {
    primaryLabel: string;
    numerologyUnavailable: string;
    moonUnavailable: string;
    runeUnavailable: string;
    formatPersonalDayExplanation: (number: number, title: string) => string;
  };
  numerology: PersonalDayResult | null;
  moon: MoonGuidanceResult | null;
  rune: DailyRuneResult | null;
};

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function composeNumerologySection(
  numerology: PersonalDayResult | null,
  unavailableMessage: string,
  primaryMessage: string,
  primaryAction: string,
  formatPersonalDayExplanation: (number: number, title: string) => string,
): DailyGuidanceNumerologySection {
  if (!numerology) {
    return { status: "unavailable", message: unavailableMessage };
  }

  return {
    status: "ready",
    data: {
      number: numerology.calculation.personalDayNumber,
      title: numerology.content.title,
      explanation: formatPersonalDayExplanation(
        numerology.calculation.personalDayNumber,
        numerology.content.title,
      ),
    },
  };
}

export function composeReflectionNote(
  numerology: PersonalDayResult | null,
  primaryMessage: string,
  primaryAction: string,
  premiumActive: boolean,
): string | null {
  if (!premiumActive || !numerology) {
    return null;
  }

  const note = numerology.content.avoidAdvice.trim();
  if (!note) {
    return null;
  }

  const normalizedPrimary = normalizeText(primaryMessage);
  const normalizedAction = normalizeText(primaryAction);

  if (
    normalizeText(note) === normalizedPrimary ||
    normalizeText(note) === normalizedAction
  ) {
    return null;
  }

  return note;
}

export function composeMoonSection(
  moon: MoonGuidanceResult | null,
  unavailableMessage: string,
  premiumActive: boolean,
): DailyGuidanceMoonSection {
  if (!moon) {
    return { status: "unavailable", message: unavailableMessage };
  }

  const deepSource = moon.phase.guidance?.trim() || "";
  const actionSource = moon.phase.action?.trim() || "";

  return {
    status: "ready",
    data: {
      phaseId: moon.calculation.phaseId,
      phaseTitle: moon.phase.title,
      lunarDay: moon.calculation.lunarDay,
      summary: moon.phase.short,
      deep: premiumActive ? deepSource || null : null,
      action: premiumActive ? actionSource || null : null,
      showPremiumDeepLock: !premiumActive && Boolean(deepSource || actionSource),
      assetPath: moonPhaseArtDescriptor({
        phase4Id: moon.calculation.phaseId,
        phase8Id: moon.calculation.phase8Id,
      }).assetPath,
      href: "/moon",
    },
  };
}

export function composeRuneSection(
  rune: DailyRuneResult | null,
  unavailableMessage: string,
  primaryAction: string,
  options: {
    premiumActive: boolean;
    runeDeep?: string | null;
  },
): DailyGuidanceRuneSection {
  if (!rune) {
    return { status: "unavailable", message: unavailableMessage };
  }

  const runeAction = rune.content.action.trim();
  const runeDeep = options.runeDeep?.trim() || "";
  const hasPremiumDepth = Boolean(runeDeep || runeAction);

  return {
    status: "ready",
    data: {
      runeId: rune.selection.runeId,
      title: rune.content.title,
      summary: rune.content.short,
      deep: options.premiumActive ? runeDeep || null : null,
      action:
        options.premiumActive && shouldShowRuneAction(primaryAction, runeAction)
          ? runeAction
          : null,
      showPremiumDeepLock: !options.premiumActive && hasPremiumDepth,
      assetPath: getRuneAssetPath(rune.selection.runeId),
      href: `/runes/${rune.selection.runeId}`,
    },
  };
}

export function composeAuthenticatedGuidance(
  input: ComposeAuthenticatedInput,
): DailyGuidanceViewModel | null {
  const primary = composePrimaryMessage({
    primaryLabel: input.labels.primaryLabel,
    numerology: input.numerology,
    rune: input.rune,
  });

  if (!primary) {
    return null;
  }

  const numerology = composeNumerologySection(
    input.numerology,
    input.labels.numerologyUnavailable,
    primary.message,
    primary.action,
    input.labels.formatPersonalDayExplanation,
  );

  const moon = composeMoonSection(
    input.moon,
    input.labels.moonUnavailable,
    input.premiumActive,
  );
  const rune = composeRuneSection(
    input.rune,
    input.labels.runeUnavailable,
    primary.action,
    {
      premiumActive: input.premiumActive,
      runeDeep: input.runeDeep,
    },
  );

  return {
    formattedDate: input.formattedDate,
    greetingName: input.greetingName,
    premiumActive: input.premiumActive,
    primary,
    numerology,
    moon,
    rune,
    reflection: composeReflectionNote(
      input.numerology,
      primary.message,
      primary.action,
      input.premiumActive,
    ),
  };
}

/** Safe serialization for tests — no sensitive or internal fields. */
export function serializeGuidanceForTests(
  guidance: DailyGuidanceViewModel,
): Record<string, unknown> {
  return {
    formattedDate: guidance.formattedDate,
    greetingName: guidance.greetingName ? "[present]" : null,
    primary: guidance.primary,
    numerologyStatus: guidance.numerology.status,
    moonStatus: guidance.moon.status,
    runeStatus: guidance.rune.status,
    hasReflection: Boolean(guidance.reflection),
    premiumActive: guidance.premiumActive,
  };
}
