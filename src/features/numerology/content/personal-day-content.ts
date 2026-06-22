import { personalDayContentEn } from "@/features/numerology/content/personal-day-content.en";
import { personalDayContentRu } from "@/features/numerology/content/personal-day-content.ru";
import {
  buildContentKey,
  buildDeterministicSeedParts,
  selectDeterministicVariantIndex,
} from "@/features/numerology/engine/deterministic-variant";
import type {
  PersonalDayContentRecord,
  PersonalDayResolvedContent,
  SupportedNumerologyLocale,
} from "@/features/numerology/types/numerology";

const CONTENT_BY_LOCALE: Record<
  SupportedNumerologyLocale,
  Record<number, PersonalDayContentRecord>
> = {
  en: personalDayContentEn,
  ru: personalDayContentRu,
};

export function getPersonalDayContentRecord(
  personalDayNumber: number,
  locale: SupportedNumerologyLocale,
): PersonalDayContentRecord | null {
  const digit = Math.min(9, Math.max(1, personalDayNumber));
  return CONTENT_BY_LOCALE[locale][digit] ?? null;
}

export function resolvePersonalDayContent(input: {
  personalDayNumber: number;
  locale: SupportedNumerologyLocale;
  dateKey: string;
  userSeed?: string;
}): { content: PersonalDayResolvedContent; contentKey: string } | null {
  const record = getPersonalDayContentRecord(
    input.personalDayNumber,
    input.locale,
  );

  if (!record) {
    return null;
  }

  const contentKey = buildContentKey(input.personalDayNumber, input.locale);
  const seedParts = buildDeterministicSeedParts({
    userSeed: input.userSeed,
    dateKey: input.dateKey,
    personalDayNumber: input.personalDayNumber,
    locale: input.locale,
  });

  selectDeterministicVariantIndex("summary", 1, seedParts);
  selectDeterministicVariantIndex("doAdvice", 1, seedParts);
  selectDeterministicVariantIndex("avoidAdvice", 1, seedParts);

  return {
    contentKey,
    content: {
      title: record.title,
      summary: record.summary,
      doAdvice: record.doAdvice,
      avoidAdvice: record.avoidAdvice,
    },
  };
}
