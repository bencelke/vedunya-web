import { personalDayContentEn } from "@/features/numerology/content/personal-day-content.en";
import { personalDayContentRu } from "@/features/numerology/content/personal-day-content.ru";
import type { SupportedNumerologyLocale } from "@/features/numerology/types/numerology";

/**
 * Structured Mystic personal-day copy — ported from
 * `lib/data/daily_guidance/personal_day_guidance_dataset.dart`.
 */
export const numerologyMeanings = {
  en: {
    personalDay: personalDayContentEn,
  },
  ru: {
    personalDay: personalDayContentRu,
  },
} as const;

export function getPersonalDayMeaning(
  locale: SupportedNumerologyLocale,
  personalDayNumber: number,
) {
  const bucket = numerologyMeanings[locale].personalDay[personalDayNumber];
  if (!bucket) {
    return null;
  }

  return {
    title: bucket.title,
    short: bucket.summary,
    onboardingPreview: bucket.summary,
    today: bucket.summary,
    doAdvice: bucket.doAdvice,
    avoidAdvice: bucket.avoidAdvice,
  };
}
