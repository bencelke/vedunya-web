"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { AppleProviderIcon } from "@/features/auth/components/auth-provider-icons";
import { AuthErrorMessage } from "@/features/auth/components/auth-error-message";
import { loginWithApple } from "@/features/auth/services/auth-service";
import {
  completeSocialSignIn,
  mapSocialSignInError,
} from "@/features/auth/services/social-sign-in-flow";
import type { AuthErrorKey } from "@/features/auth/utils/auth-error-map";
import { Button } from "@/components/ui/button";
import type { SupportedLocale } from "@/config/app-config";

type AppleSignInButtonProps = {
  locale: SupportedLocale;
  onSuccess: () => void;
};

export function AppleSignInButton({ locale, onSuccess }: AppleSignInButtonProps) {
  const t = useTranslations("auth.apple");
  const [submitting, setSubmitting] = useState(false);
  const [errorKey, setErrorKey] = useState<AuthErrorKey | null>(null);

  async function handleClick() {
    setErrorKey(null);
    setSubmitting(true);

    try {
      const credential = await loginWithApple();
      if (!credential) {
        return;
      }

      await completeSocialSignIn(credential, locale, onSuccess);
    } catch (error) {
      setErrorKey(mapSocialSignInError(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      <AuthErrorMessage errorKey={errorKey} tone="auth" />
      <Button
        type="button"
        variant="authOutline"
        className="w-full gap-2.5"
        disabled={submitting}
        onClick={handleClick}
      >
        <AppleProviderIcon className="h-[18px] w-[18px]" />
        {submitting ? t("submitting") : t("continue")}
      </Button>
    </div>
  );
}
