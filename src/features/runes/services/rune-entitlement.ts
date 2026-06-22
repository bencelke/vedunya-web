import type { ProfileSnapshot } from "@/features/profile/types/user-profile";
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
  const premiumActive =
    profile?.publicProfile?.isPremium === true ||
    profile?.publicProfile?.premiumOverride === true ||
    profile?.publicProfile?.isOwner === true;

  return {
    premiumActive,
    freeFields: [...FREE_FIELDS],
    premiumFields: [...PREMIUM_FIELDS],
  };
}
