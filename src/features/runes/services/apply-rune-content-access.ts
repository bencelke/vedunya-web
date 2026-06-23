import type { RuneContentAccess, RuneDeepContent } from "@/features/runes/types/rune";

const PREMIUM_FIELD_KEYS = [
  "deep",
  "action",
  "warning",
  "affirmation",
  "reflection",
] as const satisfies readonly (keyof RuneDeepContent)[];

export function hasRunePremiumContent(content: RuneDeepContent): boolean {
  return PREMIUM_FIELD_KEYS.some((key) => content[key].trim().length > 0);
}

export function applyRuneContentAccess(
  content: RuneDeepContent,
  access: RuneContentAccess,
): RuneDeepContent {
  if (access.premiumActive) {
    return content;
  }

  return {
    ...content,
    deep: "",
    action: "",
    warning: "",
    affirmation: "",
    reflection: "",
  };
}
