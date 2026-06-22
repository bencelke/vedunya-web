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
import { bootstrapUserProfile } from "@/features/profile/services/profile-bootstrap-service";
import { Button } from "@/components/ui/button";
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <AuthErrorMessage errorKey={errorKey} />
      <div className="space-y-2">
        <label htmlFor="register-email" className="text-sm text-text-muted">
          {t("emailLabel")}
        </label>
        <input
          id="register-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="min-h-12 w-full rounded-[var(--radius-card)] border border-border-subtle bg-surface-primary px-4 text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="register-password" className="text-sm text-text-muted">
          {t("passwordLabel")}
        </label>
        <input
          id="register-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="min-h-12 w-full rounded-[var(--radius-card)] border border-border-subtle bg-surface-primary px-4 text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        />
      </div>
      <div className="space-y-2">
        <label
          htmlFor="register-confirm-password"
          className="text-sm text-text-muted"
        >
          {t("confirmPasswordLabel")}
        </label>
        <input
          id="register-confirm-password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          className="min-h-12 w-full rounded-[var(--radius-card)] border border-border-subtle bg-surface-primary px-4 text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        />
      </div>
      <label className="flex items-start gap-3 text-sm text-text-muted">
        <input
          type="checkbox"
          checked={acceptTerms}
          onChange={(event) => setAcceptTerms(event.target.checked)}
          className="mt-1 h-4 w-4 rounded border-border-subtle"
        />
        <span>{t("termsLabel")}</span>
      </label>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
