"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";

import { mysticAssets } from "@/config/mysticAssets";
import { AuthErrorMessage } from "@/features/auth/components/auth-error-message";
import { loginWithGoogle } from "@/features/auth/services/auth-service";
import { createServerSession } from "@/features/auth/services/session-service";
import {
  mapFirebaseAuthError,
  type AuthErrorKey,
} from "@/features/auth/utils/auth-error-map";
import { bootstrapUserProfile } from "@/features/profile/services/profile-bootstrap-service";
import { Button } from "@/components/ui/button";
import type { SupportedLocale } from "@/config/app-config";

type GoogleSignInButtonProps = {
  locale: SupportedLocale;
  onSuccess: () => void;
};

export function GoogleSignInButton({ locale, onSuccess }: GoogleSignInButtonProps) {
  const t = useTranslations("auth.google");
  const [submitting, setSubmitting] = useState(false);
  const [errorKey, setErrorKey] = useState<AuthErrorKey | null>(null);

  async function handleClick() {
    setErrorKey(null);
    setSubmitting(true);

    try {
      const credential = await loginWithGoogle();
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
        <Image
          src={mysticAssets.brand.googleIcon}
          alt=""
          aria-hidden="true"
          width={18}
          height={18}
        />
        {submitting ? t("submitting") : t("continue")}
      </Button>
    </div>
  );
}
