import type { ProfileSnapshot } from "@/features/profile/types/user-profile";
import { resolvePremiumAccess } from "@/features/profile/utils/premium-access";
import type { RuneContentAccess } from "@/features/runes/types/rune";

const FREE_FIELDS = ["title", "short"] as const;
const PREMIUM_FIELDS = [
  "deep",
  "action",
  "warning",
  "affirmation",
  "reflection",
] as const;

export function resolveRuneContentAccess(
  profile: ProfileSnapshot | null,
): RuneContentAccess {
  const premiumActive = resolvePremiumAccess(profile);

  return {
    premiumActive,
    freeFields: [...FREE_FIELDS],
    premiumFields: [...PREMIUM_FIELDS],
  };
}
