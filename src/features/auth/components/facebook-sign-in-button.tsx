"use client";

import type { AuthProviderMode } from "@/features/auth/components/auth-provider-buttons";
import { SocialAuthButton } from "@/features/auth/components/social-auth-button";
import type { SupportedLocale } from "@/config/app-config";

type FacebookSignInButtonProps = {
  locale: SupportedLocale;
  mode?: AuthProviderMode;
  onSuccess: () => void;
};

export function FacebookSignInButton({
  locale,
  mode = "login",
  onSuccess,
}: FacebookSignInButtonProps) {
  return (
    <SocialAuthButton
      providerId="facebook"
      locale={locale}
      mode={mode}
      onSuccess={onSuccess}
    />
  );
}
