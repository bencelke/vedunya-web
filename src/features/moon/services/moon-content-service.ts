import type {
  LunarDayContentRecord,
  MoonLocalizedContent,
  MoonPhaseContentRecord,
  SupportedMoonLocale,
} from "@/features/moon/types/moon";

export function localizeMoonPhaseContent(
  record: MoonPhaseContentRecord,
  locale: SupportedMoonLocale,
  includePremiumFields = true,
): MoonLocalizedContent {
  const isRu = locale === "ru";

  return {
    title: isRu ? record.titleRu : record.titleEn,
    short: isRu ? record.shortRu : record.shortEn,
    guidance: isRu ? record.deepRu : record.deepEn,
    action: includePremiumFields
      ? isRu
        ? record.actionRu
        : record.actionEn
      : undefined,
    reflection: includePremiumFields
      ? isRu
        ? record.warningRu
        : record.warningEn
      : undefined,
  };
}

export function localizeLunarDayContent(
  record: LunarDayContentRecord,
  locale: SupportedMoonLocale,
  includePremiumFields = false,
): MoonLocalizedContent {
  const block = locale === "ru" ? record.ru : record.en;
  const fallback = locale === "ru" ? record.en : record.ru;

  const title = block.title || fallback.title;
  const short = block.short || fallback.short;

  return {
    title,
    short,
    guidance: includePremiumFields ? block.deep || fallback.deep : short,
    action: includePremiumFields
      ? block.action || fallback.action
      : undefined,
    reflection: includePremiumFields
      ? block.reflection || fallback.reflection
      : undefined,
  };
}

export function resolveLocaleWithFallback(
  requested: SupportedMoonLocale,
): SupportedMoonLocale {
  return requested === "ru" ? "ru" : "en";
}
