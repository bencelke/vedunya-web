import type { SupportedLocale } from "@/config/app-config";
import {
  formatDateOfBirth,
  onboardingDobSchema,
} from "@/features/profile/schemas/onboarding-schema";
import type { ProfileSnapshot } from "@/features/profile/types/user-profile";
import { isShellDisplayName } from "@/features/profile/utils/profile-merge";

import type { OnboardingDraft } from "./onboarding-draft";

/**
 * Never allow session draft to skip required steps (especially DOB).
 */
export function resolveOnboardingStep(
  draft: Partial<OnboardingDraft>,
  profile: ProfileSnapshot | null,
): number {
  const displayName = (draft.displayName ?? profile?.displayName ?? "").trim();
  const dateOfBirth =
    draft.dateOfBirth ??
    (profile?.dateOfBirth ? formatDateOfBirth(profile.dateOfBirth) : "");
  const language = (draft.language ?? profile?.language) as SupportedLocale | undefined;

  let maxAllowed = 0;

  if (displayName && !isShellDisplayName(displayName)) {
    maxAllowed = 1;
  }

  if (onboardingDobSchema.safeParse({ dateOfBirth }).success) {
    maxAllowed = 2;

    if (language === "en" || language === "ru") {
      maxAllowed = 3;
    }
  }

  const requested = typeof draft.step === "number" ? draft.step : 0;
  return Math.min(Math.max(requested, 0), maxAllowed);
}
