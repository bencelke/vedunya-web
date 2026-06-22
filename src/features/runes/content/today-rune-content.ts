import { TODAY_RUNE_MODULES } from "@/features/runes/content/today-rune-modules.generated";
import type {
  CanonicalRuneId,
  SupportedRuneLocale,
} from "@/features/runes/types/rune";

/** Matches Flutter `getRuneOfDay` variant indexing. */
export function resolveTodayRuneContent(
  runeId: CanonicalRuneId,
  locale: SupportedRuneLocale,
  forDay: number,
): { summary: string; action: string } | null {
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

  if (!messages?.length || !actions?.length) {
    return null;
  }

  const messageIndex =
    messages.length <= 1 ? 0 : forDay % messages.length;
  const actionIndex = actions.length <= 1 ? 0 : forDay % actions.length;

  return {
    summary: messages[messageIndex] ?? "",
    action: actions[actionIndex] ?? "",
  };
}

export { TODAY_RUNE_MODULES };
