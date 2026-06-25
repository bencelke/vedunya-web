"use client";

import type { SupportedLocale } from "@/config/app-config";
import { AppleSignInButton } from "@/features/auth/components/apple-sign-in-button";
import {
  isAppleLoginEnabled,
  isFacebookLoginEnabled,
} from "@/features/auth/config/auth-provider-flags";
import { FacebookSignInButton } from "@/features/auth/components/facebook-sign-in-button";
import { GoogleSignInButton } from "@/features/auth/components/google-sign-in-button";

type AuthProviderButtonsProps = {
  locale: SupportedLocale;
  firebaseConfigured?: boolean;
  onSuccess: () => void;
};

export function AuthProviderButtons({
  locale,
  firebaseConfigured = true,
  onSuccess,
}: AuthProviderButtonsProps) {
  const appleEnabled = isAppleLoginEnabled();
  const facebookEnabled = isFacebookLoginEnabled();

  if (!firebaseConfigured) {
    return null;
  }

  return (
    <div className="space-y-3">
      <GoogleSignInButton locale={locale} onSuccess={onSuccess} />
      {appleEnabled ? <AppleSignInButton locale={locale} onSuccess={onSuccess} /> : null}
      {facebookEnabled ? (
        <FacebookSignInButton locale={locale} onSuccess={onSuccess} />
      ) : null}
    </div>
  );
}
