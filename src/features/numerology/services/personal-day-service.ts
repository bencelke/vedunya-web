import { calculatePersonalDay } from "@/features/numerology/engine/calculate-personal-day";
import { resolvePersonalDayContent } from "@/features/numerology/content/personal-day-content";
import { personalDayInputSchema } from "@/features/numerology/schemas/numerology-input-schema";
import type {
  PersonalDayInput,
  PersonalDayResult,
} from "@/features/numerology/types/numerology";

export function buildPersonalDayResult(
  input: PersonalDayInput,
): PersonalDayResult | null {
  const parsed = personalDayInputSchema.safeParse(input);
  if (!parsed.success) {
    return null;
  }

  try {
    const calculation = calculatePersonalDay(parsed.data);
    const resolved = resolvePersonalDayContent({
      personalDayNumber: calculation.personalDayNumber,
      locale: parsed.data.locale,
      dateKey: calculation.dateKey,
      userSeed: parsed.data.userSeed,
    });

    if (!resolved) {
      return null;
    }

    return {
      dateKey: calculation.dateKey,
      calculation,
      content: resolved.content,
      contentKey: resolved.contentKey,
    };
  } catch {
    return null;
  }
}
