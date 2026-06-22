import { TODAY_RUNE_MODULES } from "@/features/runes/content/today-rune-modules.generated";
import {
  CANONICAL_RUNE_BY_ID,
  CANONICAL_RUNE_ORDER,
} from "@/features/runes/constants/canonical-runes";
import type {
  CanonicalRuneId,
  RuneDeepContent,
  SupportedRuneLocale,
} from "@/features/runes/types/rune";

function buildLocalDeepTranslation(
  runeId: CanonicalRuneId,
  locale: SupportedRuneLocale,
): RuneDeepContent | null {
  const runeModule = TODAY_RUNE_MODULES[runeId];
  if (!runeModule) {
    return null;
  }

  const lang = locale === "ru" ? "ru" : "en";
  const messages =
    runeModule.messages[lang]?.length > 0
      ? runeModule.messages[lang]
      : runeModule.messages.en;
  const actions =
    runeModule.actions[lang]?.length > 0
      ? runeModule.actions[lang]
      : runeModule.actions.en;

  if (!messages?.length) {
    return null;
  }

  const definition = CANONICAL_RUNE_BY_ID[runeId];
  const title =
    locale === "ru" ? definition.displayNameRu : definition.displayNameEn;

  return {
    runeId,
    title,
    short: messages[0] ?? title,
    deep: messages[1] ?? messages[0] ?? "",
    action: actions[0] ?? "",
    warning: actions[1] ?? "",
    affirmation:
      locale === "ru"
        ? `Я осознанно двигаюсь вместе с энергией руны ${title}.`
        : `I move consciously with ${title}.`,
    reflection:
      locale === "ru"
        ? `Где руна ${title} просит меня скорректировать шаг сегодня?`
        : `Where does ${title} ask me to adjust today?`,
  };
}

export function buildLocalDeepFallback(
  runeId: CanonicalRuneId,
  locale: SupportedRuneLocale,
): RuneDeepContent | null {
  return (
    buildLocalDeepTranslation(runeId, locale) ??
    buildLocalDeepTranslation(runeId, locale === "ru" ? "en" : "ru")
  );
}

export function buildMinimalDeepContent(
  runeId: CanonicalRuneId,
  locale: SupportedRuneLocale,
): RuneDeepContent {
  const definition = CANONICAL_RUNE_BY_ID[runeId];
  const title =
    locale === "ru" ? definition.displayNameRu : definition.displayNameEn;

  if (locale === "ru") {
    return {
      runeId,
      title,
      short: "Подсказка руны временно недоступна.",
      deep: "Детали руны сейчас недоступны. Сохраняйте простоту и устойчивый ритм шага сегодня.",
      action: "Сделайте один ясный и практичный шаг.",
      warning: "Избегайте поспешных решений.",
      affirmation: "Я двигаюсь вперед с ясностью и устойчивостью.",
      reflection: "Какой один устойчивый шаг я могу сделать сейчас?",
    };
  }

  return {
    runeId,
    title,
    short: "Rune guidance is temporarily unavailable.",
    deep: "Rune details are currently unavailable. Keep your step simple and grounded today.",
    action: "Take one clear, practical step.",
    warning: "Avoid rushed decisions.",
    affirmation: "I move forward with clarity and steadiness.",
    reflection: "What is the one stable step I can take now?",
  };
}

export function isCanonicalRuneId(value: string): value is CanonicalRuneId {
  return CANONICAL_RUNE_ORDER.includes(value as CanonicalRuneId);
}
