import type { SupportedProfileLocale } from "@/features/profile/constants";
import { formatDateOfBirth } from "@/features/profile/schemas/onboarding-schema";
import type { ProfileSnapshot } from "@/features/profile/types/user-profile";

export type ProfileCompletionFields = {
  displayName: string | null | undefined;
  dateOfBirth: Date | null | undefined;
  language: SupportedProfileLocale | null | undefined;
};

/**
 * Firestore stores birth date on `user_private.dob` (Timestamp).
 * App code normalizes it as `ProfileSnapshot.dateOfBirth`.
 */
export function deriveProfileComplete(
  fields: ProfileCompletionFields,
): boolean {
  const name = fields.displayName?.trim() ?? "";
  if (!name) {
    return false;
  }

  if (!fields.dateOfBirth) {
    return false;
  }

  const iso = formatDateOfBirth(fields.dateOfBirth);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    return false;
  }

  return fields.language === "en" || fields.language === "ru";
}

export function isProfileComplete(
  profile: ProfileSnapshot | null | undefined,
): boolean {
  if (!profile) {
    return false;
  }

  return deriveProfileComplete({
    displayName: profile.displayName,
    dateOfBirth: profile.dateOfBirth,
    language: profile.language,
  });
}
