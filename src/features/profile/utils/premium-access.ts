import type { ProfileSnapshot } from "@/features/profile/types/user-profile";

/**
 * Read-only premium access from existing profile fields.
 * Does not write or assume subscription state.
 */
export function resolvePremiumAccess(profile: ProfileSnapshot | null): boolean {
  return (
    profile?.publicProfile?.isPremium === true ||
    profile?.publicProfile?.premiumOverride === true ||
    profile?.publicProfile?.isOwner === true
  );
}
