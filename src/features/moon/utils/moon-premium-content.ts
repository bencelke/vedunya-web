import type { MoonLocalizedContent } from "@/features/moon/types/moon";

export function hasMoonPremiumContent(input: {
  phase: MoonLocalizedContent;
  lunarDayContent: MoonLocalizedContent | null;
}): boolean {
  const { phase, lunarDayContent } = input;

  const phasePremium =
    (phase.guidance.trim() && phase.guidance !== phase.short) ||
    Boolean(phase.action?.trim()) ||
    Boolean(phase.reflection?.trim());

  const lunarPremium = lunarDayContent
    ? (lunarDayContent.guidance.trim() &&
        lunarDayContent.guidance !== lunarDayContent.short) ||
      Boolean(lunarDayContent.action?.trim()) ||
      Boolean(lunarDayContent.reflection?.trim())
    : false;

  return phasePremium || lunarPremium;
}
