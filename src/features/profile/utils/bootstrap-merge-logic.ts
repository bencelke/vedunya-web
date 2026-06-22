import type { User } from "firebase/auth";

import {
  DEFAULT_DISPLAY_NAME,
  type SupportedProfileLocale,
} from "@/features/profile/constants";
import {
  isShellDisplayName,
  mergeAuthProviders,
  sanitizePublicProfilePatch,
} from "@/features/profile/utils/profile-merge";

type ExistingPublicProfile = Record<string, unknown>;
type ExistingPrivateProfile = Record<string, unknown>;

export function buildBootstrapPublicPatch(input: {
  user: Pick<User, "uid" | "displayName" | "photoURL" | "providerData">;
  existing: ExistingPublicProfile;
  languageCode?: SupportedProfileLocale;
  now: unknown;
}): Record<string, unknown> | null {
  if (!input.existing || Object.keys(input.existing).length === 0) {
    return createPublicShellPayload(input.user, input.languageCode, input.now);
  }

  const patch: Record<string, unknown> = sanitizePublicProfilePatch({
    uid: input.user.uid,
    updatedAt: input.now,
    lastSeenAt: input.now,
  });

  const displayName = input.user.displayName?.trim();
  if (
    displayName &&
    isShellDisplayName(String(input.existing.displayName ?? ""))
  ) {
    patch.displayName = displayName;
  }

  const photoUrl = input.user.photoURL?.trim();
  if (photoUrl && !input.existing.photoUrl) {
    patch.photoUrl = photoUrl;
  }

  if (input.languageCode && !input.existing.language) {
    patch.language = input.languageCode;
  }

  return Object.keys(patch).length > 0 ? patch : null;
}

export function buildBootstrapPrivatePatch(input: {
  user: Pick<User, "uid" | "email">;
  existing: ExistingPrivateProfile;
  exists: boolean;
  now: unknown;
}): Record<string, unknown> {
  const patch: Record<string, unknown> = {
    uid: input.user.uid,
    updatedAt: input.now,
    lastLoginAt: input.now,
  };

  const email = input.user.email?.trim();
  if (email && !input.existing.email) {
    patch.email = email;
  }

  if (!input.exists) {
    patch.createdAt = input.now;
  }

  return patch;
}

export function createPublicShellPayload(
  user: Pick<User, "uid" | "displayName" | "photoURL" | "providerData">,
  languageCode?: SupportedProfileLocale,
  now: unknown = "SERVER_TIMESTAMP",
): Record<string, unknown> {
  const displayName = user.displayName?.trim();

  return {
    uid: user.uid,
    displayName:
      displayName && displayName.length > 0
        ? displayName
        : DEFAULT_DISPLAY_NAME,
    ...(user.photoURL ? { photoUrl: user.photoURL } : {}),
    ...(languageCode ? { language: languageCode } : {}),
    role: "user",
    accountType: "standard",
    accountState: "active",
    isVerified: false,
    isPremium: false,
    premiumOverride: false,
    isOwner: false,
    isAdmin: false,
    postsCount: 0,
    commentsCount: 0,
    authProviders: mergeAuthProviders(
      [],
      user.providerData.map((provider) => provider.providerId),
    ),
    createdAt: now,
    updatedAt: now,
    lastSeenAt: now,
  };
}

export function preservesProtectedPublicFields(
  existing: ExistingPublicProfile,
  patch: Record<string, unknown> | null,
): boolean {
  if (!patch) {
    return true;
  }

  const protectedKeys = [
    "isPremium",
    "premiumOverride",
    "isOwner",
    "isAdmin",
    "role",
    "dob",
    "profileComplete",
  ] as const;

  for (const key of protectedKeys) {
    if (key in patch && patch[key] !== existing[key]) {
      if (patch[key] !== undefined) {
        return false;
      }
    }
  }

  return true;
}
