"use client";

import type { SupportedLocale } from "@/config/app-config";
import { SocialAuthButton } from "@/features/auth/components/social-auth-button";
import {
  getEnabledSocialAuthProviders,
  getSocialAuthProviderAvailability,
  SOCIAL_AUTH_PROVIDER_ORDER,
} from "@/features/auth/config/social-auth-providers";

export type AuthProviderMode = "login" | "register";

type AuthProviderButtonsProps = {
  locale: SupportedLocale;
  mode: AuthProviderMode;
  firebaseConfigured?: boolean;
  onSuccess: () => void;
};

export function AuthProviderButtons({
  locale,
  mode,
  firebaseConfigured = true,
  onSuccess,
}: AuthProviderButtonsProps) {
  const availability = getSocialAuthProviderAvailability(firebaseConfigured);
  const enabledProviders = SOCIAL_AUTH_PROVIDER_ORDER.filter((providerId) =>
    getEnabledSocialAuthProviders(availability).includes(providerId),
  );

  if (enabledProviders.length === 0) {
    return null;
  }

  return (
    <div
      className="auth-provider-buttons space-y-3"
      data-auth-mode={mode}
      data-enabled-providers={enabledProviders.join(",")}
    >
      {enabledProviders.map((providerId) => (
        <SocialAuthButton
          key={providerId}
          providerId={providerId}
          locale={locale}
          mode={mode}
          onSuccess={onSuccess}
        />
      ))}
    </div>
  );
}
