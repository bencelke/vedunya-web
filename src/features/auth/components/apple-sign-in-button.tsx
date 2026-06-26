"use client";

import type { AuthProviderMode } from "@/features/auth/components/auth-provider-buttons";
import { SocialAuthButton } from "@/features/auth/components/social-auth-button";
import type { SupportedLocale } from "@/config/app-config";

type AppleSignInButtonProps = {
  locale: SupportedLocale;
  mode?: AuthProviderMode;
  onSuccess: () => void;
};

export function AppleSignInButton({ locale, mode = "login", onSuccess }: AppleSignInButtonProps) {
  return (
    <SocialAuthButton
      providerId="apple"
      locale={locale}
      mode={mode}
      onSuccess={onSuccess}
    />
  );
}
