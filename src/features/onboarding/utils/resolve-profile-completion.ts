import type { SupportedLocale } from "@/config/app-config";
import {
  formatDateOfBirth,
  onboardingCompleteSchema,
  onboardingDobSchema,
  onboardingNameSchema,
  type OnboardingCompleteInput,
} from "@/features/profile/schemas/onboarding-schema";
import { isShellDisplayName } from "@/features/profile/utils/profile-merge";
import type { ProfileSnapshot } from "@/features/profile/types/user-profile";

export type ProfileCompletionMissing = "displayName" | "dateOfBirth" | "language";

export type ProfileCompletionState = {
  displayName: string;
  dateOfBirth: string;
  language: SupportedLocale;
  missing: ProfileCompletionMissing[];
  canAutoComplete: boolean;
  parsed: OnboardingCompleteInput | null;
};

function resolveDisplayName(
  profile: ProfileSnapshot | null,
  draftName: string | undefined,
  firebaseDisplayName: string | null | undefined,
): string {
  const candidates = [
    draftName?.trim(),
    profile?.displayName?.trim(),
    firebaseDisplayName?.trim(),
  ];

  for (const candidate of candidates) {
    if (candidate && !isShellDisplayName(candidate)) {
      return candidate;
    }
  }

  return draftName?.trim() ?? "";
}

function resolveLanguage(
  profile: ProfileSnapshot | null,
  draftLanguage: SupportedLocale | undefined,
  preAuthLocale: SupportedLocale | undefined,
  routeLocale: SupportedLocale,
): SupportedLocale {
  return (
    profile?.language ??
    draftLanguage ??
    preAuthLocale ??
    routeLocale
  );
}

export function resolveProfileCompletionState(input: {
  profile: ProfileSnapshot | null;
  draftDisplayName?: string;
  draftDateOfBirth?: string;
  draftLanguage?: SupportedLocale;
  preAuthDateOfBirth?: string;
  preAuthLocale?: SupportedLocale;
  firebaseDisplayName?: string | null;
  routeLocale: SupportedLocale;
}): ProfileCompletionState {
  const displayName = resolveDisplayName(
    input.profile,
    input.draftDisplayName,
    input.firebaseDisplayName,
  );

  const dateOfBirth =
    (input.profile?.dateOfBirth
      ? formatDateOfBirth(input.profile.dateOfBirth)
      : "") ||
    input.draftDateOfBirth ||
    input.preAuthDateOfBirth ||
    "";

  const language = resolveLanguage(
    input.profile,
    input.draftLanguage,
    input.preAuthLocale,
    input.routeLocale,
  );

  const missing: ProfileCompletionMissing[] = [];

  if (!onboardingNameSchema.safeParse({ displayName: displayName.trim() }).success) {
    missing.push("displayName");
  }

  if (!onboardingDobSchema.safeParse({ dateOfBirth }).success) {
    missing.push("dateOfBirth");
  }

  if (language !== "en" && language !== "ru") {
    missing.push("language");
  }

  const parsed = onboardingCompleteSchema.safeParse({
    displayName: displayName.trim(),
    dateOfBirth,
    language,
  });

  return {
    displayName,
    dateOfBirth,
    language,
    missing,
    canAutoComplete: parsed.success,
    parsed: parsed.success ? parsed.data : null,
  };
}
