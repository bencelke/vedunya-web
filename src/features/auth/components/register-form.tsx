"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { AuthErrorMessage } from "@/features/auth/components/auth-error-message";
import { registerWithEmail } from "@/features/auth/services/auth-service";
import { createServerSession } from "@/features/auth/services/session-service";
import { registerSchema } from "@/features/auth/schemas/auth-schema";
import {
  mapFirebaseAuthError,
  mapZodIssueToAuthError,
  type AuthErrorKey,
} from "@/features/auth/utils/auth-error-map";
import { AuthFormCard } from "@/features/auth/components/auth-form-card";
import { bootstrapUserProfile } from "@/features/profile/services/profile-bootstrap-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SupportedLocale } from "@/config/app-config";

type RegisterFormProps = {
  locale: SupportedLocale;
  onSuccess: () => void;
};

export function RegisterForm({ locale, onSuccess }: RegisterFormProps) {
  const t = useTranslations("auth.registerForm");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorKey, setErrorKey] = useState<AuthErrorKey | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorKey(null);

    const parsed = registerSchema.safeParse({
      email,
      password,
      confirmPassword,
      acceptTerms,
    });

    if (!parsed.success) {
      setErrorKey(
        mapZodIssueToAuthError(parsed.error.issues[0]?.message ?? "generic"),
      );
      return;
    }

    setSubmitting(true);
    try {
      const credential = await registerWithEmail(
        parsed.data.email,
        parsed.data.password,
      );
      await bootstrapUserProfile(credential.user, locale);
      const token = await credential.user.getIdToken(true);
      const sessionOk = await createServerSession(token);
      if (!sessionOk) {
        setErrorKey("generic");
        return;
      }
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
    <AuthFormCard>
      <form onSubmit={handleSubmit} className="space-y-6">
        <AuthErrorMessage errorKey={errorKey} tone="auth" />
        <div className="space-y-2">
          <Label htmlFor="register-email" tone="auth">
            {t("emailLabel")}
          </Label>
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            tone="auth"
            variant="underline"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-password" tone="auth">
            {t("passwordLabel")}
          </Label>
          <Input
            id="register-password"
            type="password"
            autoComplete="new-password"
            tone="auth"
            variant="underline"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="register-confirm-password" tone="auth">
            {t("confirmPasswordLabel")}
          </Label>
          <Input
            id="register-confirm-password"
            type="password"
            autoComplete="new-password"
            tone="auth"
            variant="underline"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>
        <label className="flex items-start gap-3 text-sm leading-relaxed text-auth-text-muted">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(event) => setAcceptTerms(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-auth-border accent-auth-accent-gold"
          />
          <span>{t("termsLabel")}</span>
        </label>
        <Button
          type="submit"
          variant="authPrimary"
          className="w-full"
          disabled={submitting}
        >
          {submitting ? t("submitting") : t("submit")}
        </Button>
      </form>
    </AuthFormCard>
  );
}
