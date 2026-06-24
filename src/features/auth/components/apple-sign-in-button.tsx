"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { AuthErrorMessage } from "@/features/auth/components/auth-error-message";
import { loginWithApple } from "@/features/auth/services/auth-service";
import { createServerSession } from "@/features/auth/services/session-service";
import {
  mapFirebaseAuthError,
  type AuthErrorKey,
} from "@/features/auth/utils/auth-error-map";
import { bootstrapUserProfile } from "@/features/profile/services/profile-bootstrap-service";
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

      await bootstrapUserProfile(credential.user, locale);
      const token = await credential.user.getIdToken(true);
      await createServerSession(token);
      onSuccess();
    } catch (error) {
      if (error instanceof Error && error.message === "configuration") {
        setErrorKey("configuration");
      } else {
        setErrorKey(mapFirebaseAuthError(error));
      }
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
        className="w-full"
        disabled={submitting}
        onClick={handleClick}
      >
        {submitting ? t("submitting") : t("continue")}
      </Button>
    </div>
  );
}
