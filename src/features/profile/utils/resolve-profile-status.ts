import { formatDateOfBirth } from "@/features/profile/schemas/onboarding-schema";
import type { ProfileSnapshot } from "@/features/profile/types/user-profile";
import { isShellDisplayName } from "@/features/profile/utils/profile-merge";

export type ProfileMissingField = "displayName" | "language" | "dob";

export type ProfileStatusResponse = {
  authenticated: boolean;
  profileComplete: boolean;
  missing: ProfileMissingField[];
};

function collectMissingFields(
  profile: ProfileSnapshot | null,
): ProfileMissingField[] {
  const missing: ProfileMissingField[] = [];

  const name = profile?.displayName?.trim() ?? "";
  if (!name || isShellDisplayName(name)) {
    missing.push("displayName");
  }

  if (profile?.language !== "en" && profile?.language !== "ru") {
    missing.push("language");
  }

  if (!profile?.dateOfBirth) {
    missing.push("dob");
  } else {
    const iso = formatDateOfBirth(profile.dateOfBirth);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      missing.push("dob");
    }
  }

  return missing;
}

export function resolveProfileStatus(
  profile: ProfileSnapshot | null,
  authenticated: boolean,
): ProfileStatusResponse {
  if (!authenticated) {
    return {
      authenticated: false,
      profileComplete: false,
      missing: ["displayName", "language", "dob"],
    };
  }

  const missing = collectMissingFields(profile);

  return {
    authenticated: true,
    profileComplete: missing.length === 0,
    missing,
  };
}
