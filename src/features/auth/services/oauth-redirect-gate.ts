"use client";

import type { UserCredential } from "firebase/auth";

import { resolveOAuthRedirectResult } from "@/features/auth/services/auth-service";
import { logGoogleAuth } from "@/features/auth/utils/google-auth-debug";

let redirectCheckPromise: Promise<UserCredential | null> | null = null;

/** Ensures Firebase redirect OAuth is resolved once per full page load. */
export function ensureOAuthRedirectChecked(): Promise<UserCredential | null> {
  if (!redirectCheckPromise) {
    redirectCheckPromise = (async () => {
      logGoogleAuth("redirect-result-check");
      try {
        const result = await resolveOAuthRedirectResult();
        if (!result) {
          logGoogleAuth("redirect-result-empty");
          return null;
        }

        logGoogleAuth("firebase-success");
        return result;
      } catch (error) {
        const code =
          error && typeof error === "object" && "code" in error
            ? String((error as { code?: string }).code)
            : "unknown";
        logGoogleAuth("firebase-failed", { code });
        throw error;
      }
    })();
  }

  return redirectCheckPromise;
}

export function resetOAuthRedirectGateForTests(): void {
  redirectCheckPromise = null;
}
