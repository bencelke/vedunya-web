"use client";

import type { UserCredential } from "firebase/auth";

import { createServerSession } from "@/features/auth/services/session-service";
import {
  mapFirebaseAuthError,
  type AuthErrorKey,
} from "@/features/auth/utils/auth-error-map";
import { logGoogleAuth } from "@/features/auth/utils/google-auth-debug";
import { bootstrapUserProfile } from "@/features/profile/services/profile-bootstrap-service";
import type { SupportedLocale } from "@/config/app-config";
import { resolveProfileBootstrapLocale } from "@/i18n/resolve-profile-bootstrap-locale";
import type { SocialAuthProviderId } from "@/features/auth/config/social-auth-providers";

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
  const sessionOk = await createServerSession(token);

  if (!sessionOk) {
    logGoogleAuth("session-failed", { status: 0 });
    throw new Error("session");
  }

  logGoogleAuth("session-success", { status: 200 });
  onSuccess();
  logGoogleAuth("route-complete");
}

export function mapSocialSignInError(
  error: unknown,
  providerId?: SocialAuthProviderId,
): AuthErrorKey {
  if (error instanceof Error && error.message === "configuration") {
    return "configuration";
  }

  if (error instanceof Error && error.message === "session") {
    return providerId === "google" ? "googleSignInFailed" : "generic";
  }

  const mapped = mapFirebaseAuthError(error);
  if (providerId === "google" && mapped === "generic") {
    return "googleSignInFailed";
  }

  return mapped;
}
