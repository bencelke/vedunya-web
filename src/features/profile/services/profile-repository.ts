import "server-only";

import { Timestamp } from "firebase-admin/firestore";

import {
  DEFAULT_DISPLAY_NAME,
  USER_PRIVATE_COLLECTION,
  USERS_COLLECTION,
  type SupportedProfileLocale,
} from "@/features/profile/constants";
import type { ProfileSnapshot } from "@/features/profile/types/user-profile";
import { deriveProfileComplete } from "@/features/profile/utils/profile-complete";
import { isShellDisplayName } from "@/features/profile/utils/profile-merge";
import { getFirebaseAdminFirestore } from "@/lib/firebase-admin/firestore";

function timestampToDate(value: unknown): Date | null {
  if (value instanceof Timestamp) {
    const date = value.toDate();
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  return null;
}

function readLanguage(value: unknown): SupportedProfileLocale | null {
  if (value === "en" || value === "ru") {
    return value;
  }
  return null;
}

export async function getProfileSnapshot(
  uid: string,
): Promise<ProfileSnapshot | null> {
  const db = getFirebaseAdminFirestore();
  if (!db || !uid) {
    return null;
  }

  const [publicDoc, privateDoc] = await Promise.all([
    db.collection(USERS_COLLECTION).doc(uid).get(),
    db.collection(USER_PRIVATE_COLLECTION).doc(uid).get(),
  ]);

  if (!publicDoc.exists && !privateDoc.exists) {
    return null;
  }

  const publicData = publicDoc.data() ?? {};
  const privateData = privateDoc.data() ?? {};

  const dob =
    timestampToDate(privateData.dob) ??
    timestampToDate(publicData.dob);

  const authProviders = Array.isArray(publicData.authProviders)
    ? publicData.authProviders.filter(
        (item): item is string => typeof item === "string",
      )
    : [];

  const displayNameRaw =
    typeof publicData.displayName === "string" ? publicData.displayName : null;
  const trimmedName = displayNameRaw?.trim() || null;
  const displayName = isShellDisplayName(trimmedName) ? null : trimmedName;

  const language = readLanguage(publicData.language);
  const derivedProfileComplete = deriveProfileComplete({
    displayName,
    dateOfBirth: dob,
    language,
  });

  return {
    uid,
    displayName,
    email:
      typeof privateData.email === "string"
        ? privateData.email
        : typeof publicData.email === "string"
          ? publicData.email
          : null,
    dateOfBirth: dob,
    language,
    profileComplete: derivedProfileComplete,
    authProviders,
    publicProfile: publicDoc.exists
      ? {
          uid,
          displayName:
            typeof publicData.displayName === "string"
              ? publicData.displayName
              : DEFAULT_DISPLAY_NAME,
          photoUrl:
            typeof publicData.photoUrl === "string"
              ? publicData.photoUrl
              : undefined,
          language: readLanguage(publicData.language) ?? undefined,
          profileComplete: publicData.profileComplete === true,
          role:
            typeof publicData.role === "string" ? publicData.role : undefined,
          accountType:
            typeof publicData.accountType === "string"
              ? publicData.accountType
              : undefined,
          accountState:
            typeof publicData.accountState === "string"
              ? publicData.accountState
              : undefined,
          isVerified: publicData.isVerified === true,
          isPremium: publicData.isPremium === true,
          premiumOverride: publicData.premiumOverride === true,
          isOwner: publicData.isOwner === true,
          isAdmin: publicData.isAdmin === true,
        }
      : null,
    privateProfile: privateDoc.exists
      ? {
          uid,
          email:
            typeof privateData.email === "string"
              ? privateData.email
              : undefined,
          dob: dob ?? undefined,
          profileComplete: privateData.profileComplete === true,
        }
      : null,
  };
}
