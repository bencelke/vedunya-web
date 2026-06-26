"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";

import { mysticAssets } from "@/config/mysticAssets";
import type { AuthProviderMode } from "@/features/auth/components/auth-provider-buttons";
import {
  AppleProviderIcon,
  FacebookProviderIcon,
} from "@/features/auth/components/auth-provider-icons";
import { AuthErrorMessage } from "@/features/auth/components/auth-error-message";
import {
  loginWithApple,
  loginWithFacebook,
  loginWithGoogle,
} from "@/features/auth/services/auth-service";
import {
  completeSocialSignIn,
  mapSocialSignInError,
} from "@/features/auth/services/social-sign-in-flow";
import type { SocialAuthProviderId } from "@/features/auth/config/social-auth-providers";
import type { AuthErrorKey } from "@/features/auth/utils/auth-error-map";
import { Button } from "@/components/ui/button";
import type { SupportedLocale } from "@/config/app-config";
import type { UserCredential } from "firebase/auth";

type SocialAuthButtonProps = {
  providerId: SocialAuthProviderId;
  locale: SupportedLocale;
  mode: AuthProviderMode;
  onSuccess: () => void;
};

const providerSignIn: Record<
  SocialAuthProviderId,
  () => Promise<UserCredential | null>
> = {
  google: loginWithGoogle,
  apple: loginWithApple,
  facebook: loginWithFacebook,
};

export function SocialAuthButton({
  providerId,
  locale,
  mode,
  onSuccess,
}: SocialAuthButtonProps) {
  const t = useTranslations(`auth.${providerId}`);
  const [submitting, setSubmitting] = useState(false);
  const [errorKey, setErrorKey] = useState<AuthErrorKey | null>(null);

  async function handleClick() {
    setErrorKey(null);
    setSubmitting(true);

    try {
      const credential = await providerSignIn[providerId]();
      if (!credential) {
        return;
      }

      await completeSocialSignIn(credential, locale, onSuccess);
    } catch (error) {
      setErrorKey(mapSocialSignInError(error, providerId));
    } finally {
      setSubmitting(false);
    }
  }

  const label =
    submitting ? t("submitting") : mode === "register" ? t("registerContinue") : t("continue");

  return (
    <div className="space-y-3" data-social-provider={providerId}>
      <AuthErrorMessage errorKey={errorKey} tone="auth" />
      <Button
        type="button"
        variant="authOutline"
        className="social-auth-button w-full gap-2.5"
        disabled={submitting}
        onClick={handleClick}
      >
        {providerId === "google" ? (
          <Image
            src={mysticAssets.brand.googleIcon}
            alt=""
            aria-hidden="true"
            width={18}
            height={18}
          />
        ) : null}
        {providerId === "apple" ? (
          <AppleProviderIcon className="h-[18px] w-[18px] text-auth-text-primary" />
        ) : null}
        {providerId === "facebook" ? (
          <FacebookProviderIcon className="h-[18px] w-[18px] text-auth-text-primary" />
        ) : null}
        {label}
      </Button>
    </div>
  );
}
