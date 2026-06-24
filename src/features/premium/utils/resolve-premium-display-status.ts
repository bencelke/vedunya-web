import type { ProfileSnapshot } from "@/features/profile/types/user-profile";
import { resolvePremiumAccess } from "@/features/profile/utils/premium-access";
import type { PremiumDisplayStatus } from "@/features/premium/types/premium-display-status";

export type { PremiumDisplayStatus } from "@/features/premium/types/premium-display-status";

export function resolvePremiumDisplayStatus(
  profile: ProfileSnapshot | null,
): PremiumDisplayStatus {
  if (!profile?.publicProfile) {
    return "free";
  }

  const { isOwner, isPremium, premiumOverride } = profile.publicProfile;

  if (isOwner === true) {
    return "owner";
  }

  if (isPremium === true) {
    return "premium";
  }

  if (premiumOverride === true) {
    return "devOverride";
  }

  return "free";
}

export function hasPremiumEntitlement(profile: ProfileSnapshot | null): boolean {
  return resolvePremiumAccess(profile);
}
