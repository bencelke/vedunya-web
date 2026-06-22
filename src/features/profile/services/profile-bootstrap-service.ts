"use client";

import {
  doc,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  type Firestore,
} from "firebase/firestore";
import type { User } from "firebase/auth";

import {
  DEFAULT_DISPLAY_NAME,
  USER_PRIVATE_COLLECTION,
  USERS_COLLECTION,
  type SupportedProfileLocale,
} from "@/features/profile/constants";
import type { OnboardingCompleteInput } from "@/features/profile/schemas/onboarding-schema";
import { parseDateOfBirth } from "@/features/profile/schemas/onboarding-schema";
import {
  isShellDisplayName,
  mergeAuthProviders,
  sanitizePublicProfilePatch,
} from "@/features/profile/utils/profile-merge";
import { getFirebaseFirestore } from "@/lib/firebase/firestore";

function createPublicShellPayload(user: User, languageCode?: string) {
  const displayName = user.displayName?.trim();
  const now = serverTimestamp();

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

async function mergePublicProfile(
  db: Firestore,
  user: User,
  languageCode?: string,
): Promise<void> {
  const ref = doc(db, USERS_COLLECTION, user.uid);

  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(ref);
    const data = snap.data() ?? {};

    if (!snap.exists) {
      transaction.set(ref, createPublicShellPayload(user, languageCode), {
        merge: true,
      });
      return;
    }

    const patch: Record<string, unknown> = sanitizePublicProfilePatch({
      uid: user.uid,
      updatedAt: serverTimestamp(),
      lastSeenAt: serverTimestamp(),
    });

    const displayName = user.displayName?.trim();
    if (displayName && isShellDisplayName(String(data.displayName ?? ""))) {
      patch.displayName = displayName;
    }

    const photoUrl = user.photoURL?.trim();
    if (photoUrl && !data.photoUrl) {
      patch.photoUrl = photoUrl;
    }

    if (languageCode && !data.language) {
      patch.language = languageCode;
    }

    if (Object.keys(patch).length > 0) {
      transaction.set(ref, patch, { merge: true });
    }
  });
}

async function mergePrivateProfile(db: Firestore, user: User): Promise<void> {
  const ref = doc(db, USER_PRIVATE_COLLECTION, user.uid);

  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(ref);
    const data = snap.data() ?? {};
    const patch: Record<string, unknown> = {
      uid: user.uid,
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };

    const email = user.email?.trim();
    if (email && !data.email) {
      patch.email = email;
    }

    if (!snap.exists) {
      patch.createdAt = serverTimestamp();
    }

    transaction.set(ref, patch, { merge: true });
  });
}

export async function bootstrapUserProfile(
  user: User,
  languageCode?: SupportedProfileLocale,
): Promise<void> {
  const db = getFirebaseFirestore();
  if (!db) {
    throw new Error("Firestore is not configured.");
  }

  await mergePublicProfile(db, user, languageCode);
  await mergePrivateProfile(db, user);
}

export async function completeUserProfile(
  user: User,
  input: OnboardingCompleteInput,
): Promise<void> {
  const db = getFirebaseFirestore();
  if (!db) {
    throw new Error("Firestore is not configured.");
  }

  const parsed = parseDateOfBirth(input.dateOfBirth);
  const publicRef = doc(db, USERS_COLLECTION, user.uid);
  const privateRef = doc(db, USER_PRIVATE_COLLECTION, user.uid);

  const publicPatch = sanitizePublicProfilePatch({
    uid: user.uid,
    displayName: input.displayName.trim(),
    language: input.language,
    profileComplete: true,
    updatedAt: serverTimestamp(),
    lastSeenAt: serverTimestamp(),
  });

  await setDoc(publicRef, publicPatch, { merge: true });

  await setDoc(
    privateRef,
    {
      uid: user.uid,
      email: user.email ?? undefined,
      dob: Timestamp.fromDate(parsed),
      profileComplete: true,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function updateUserProfileFields(
  user: User,
  input: OnboardingCompleteInput,
): Promise<void> {
  await completeUserProfile(user, input);
}
