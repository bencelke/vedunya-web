"use client";

import type { UserCredential } from "firebase/auth";

import { createServerSession } from "@/features/auth/services/session-service";
import {
  mapFirebaseAuthError,
  type AuthErrorKey,
} from "@/features/auth/utils/auth-error-map";
import { bootstrapUserProfile } from "@/features/profile/services/profile-bootstrap-service";
import type { SupportedLocale } from "@/config/app-config";
import { resolveProfileBootstrapLocale } from "@/i18n/resolve-profile-bootstrap-locale";

export async function completeSocialSignIn(
  credential: UserCredential,
  locale: SupportedLocale,
  onSuccess: () => void,
): Promise<void> {
  await bootstrapUserProfile(
    credential.user,
    resolveProfileBootstrapLocale(locale),
  );
  const token = await credential.user.getIdToken(true);
  await createServerSession(token);
  onSuccess();
}

export function mapSocialSignInError(error: unknown): AuthErrorKey {
  if (error instanceof Error && error.message === "configuration") {
    return "configuration";
  }

  return mapFirebaseAuthError(error);
}
