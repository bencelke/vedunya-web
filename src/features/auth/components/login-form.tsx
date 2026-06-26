"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { AuthErrorMessage } from "@/features/auth/components/auth-error-message";
import { loginWithEmail } from "@/features/auth/services/auth-service";
import { createServerSession } from "@/features/auth/services/session-service";
import { loginSchema } from "@/features/auth/schemas/auth-schema";
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
import { resolveProfileBootstrapLocale } from "@/i18n/resolve-profile-bootstrap-locale";

type LoginFormProps = {
  locale: SupportedLocale;
  onSuccess: () => void;
};

export function LoginForm({ locale, onSuccess }: LoginFormProps) {
  const t = useTranslations("auth.loginForm");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorKey, setErrorKey] = useState<AuthErrorKey | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorKey(null);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrorKey(
        mapZodIssueToAuthError(parsed.error.issues[0]?.message ?? "generic"),
      );
      return;
    }

    setSubmitting(true);
    try {
      const credential = await loginWithEmail(
        parsed.data.email,
        parsed.data.password,
      );
      await bootstrapUserProfile(
        credential.user,
        resolveProfileBootstrapLocale(locale),
      );
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
          <Label htmlFor="login-email" tone="auth">
            {t("emailLabel")}
          </Label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            tone="auth"
            variant="underline"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="login-password" tone="auth">
            {t("passwordLabel")}
          </Label>
          <Input
            id="login-password"
            type="password"
            autoComplete="current-password"
            tone="auth"
            variant="underline"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
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
