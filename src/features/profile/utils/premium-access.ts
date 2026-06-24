import type { ProfileSnapshot } from "@/features/profile/types/user-profile";
import type { MysticPlusEntitlement } from "@/features/payments/types/payment";
import { hasActiveMysticPlusEntitlement } from "@/features/payments/utils/entitlement-access";

/**
 * Read-only premium access from profile fields and verified entitlements.
 */
export function resolvePremiumAccess(
  profile: ProfileSnapshot | null,
  mysticPlus?: MysticPlusEntitlement | null,
): boolean {
  return (
    profile?.publicProfile?.isPremium === true ||
    profile?.publicProfile?.premiumOverride === true ||
    profile?.publicProfile?.isOwner === true ||
    hasActiveMysticPlusEntitlement(mysticPlus ?? null)
  );
}
