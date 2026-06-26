"use client";

import type { AuthProviderMode } from "@/features/auth/components/auth-provider-buttons";
import { SocialAuthButton } from "@/features/auth/components/social-auth-button";
import type { SupportedLocale } from "@/config/app-config";

type GoogleSignInButtonProps = {
  locale: SupportedLocale;
  mode?: AuthProviderMode;
  onSuccess: () => void;
};

export function GoogleSignInButton({ locale, mode = "login", onSuccess }: GoogleSignInButtonProps) {
  return (
    <SocialAuthButton
      providerId="google"
      locale={locale}
      mode={mode}
      onSuccess={onSuccess}
    />
  );
}
