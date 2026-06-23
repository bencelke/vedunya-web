"use client";

import type { SupportedLocale } from "@/config/app-config";
import { AppleSignInPlaceholder } from "@/features/auth/components/apple-sign-in-placeholder";
import { GoogleSignInButton } from "@/features/auth/components/google-sign-in-button";

type AuthProviderButtonsProps = {
  locale: SupportedLocale;
  onSuccess: () => void;
};

export function AuthProviderButtons({
  locale,
  onSuccess,
}: AuthProviderButtonsProps) {
  return (
    <div className="space-y-3">
      <GoogleSignInButton locale={locale} onSuccess={onSuccess} />
      <AppleSignInPlaceholder />
    </div>
  );
}
