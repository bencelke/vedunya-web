"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { AuthErrorMessage } from "@/features/auth/components/auth-error-message";
import { sendPasswordReset } from "@/features/auth/services/auth-service";
import { forgotPasswordSchema } from "@/features/auth/schemas/auth-schema";
import {
  mapFirebaseAuthError,
  mapZodIssueToAuthError,
  type AuthErrorKey,
} from "@/features/auth/utils/auth-error-map";
import { Button } from "@/components/ui/button";

export function ForgotPasswordForm() {
  const t = useTranslations("auth.forgotPasswordForm");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorKey, setErrorKey] = useState<AuthErrorKey | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorKey(null);
    setSent(false);

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setErrorKey(
        mapZodIssueToAuthError(parsed.error.issues[0]?.message ?? "generic"),
      );
      return;
    }

    setSubmitting(true);
    try {
      await sendPasswordReset(parsed.data.email);
      setSent(true);
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
      {sent ? (
        <p className="rounded-[var(--radius-card)] border border-border-subtle bg-surface-primary px-4 py-3 text-sm text-text-muted">
          {t("success")}
        </p>
      ) : null}
      <div className="space-y-2">
        <label htmlFor="forgot-email" className="text-sm text-text-muted">
          {t("emailLabel")}
        </label>
        <input
          id="forgot-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="min-h-12 w-full rounded-[var(--radius-card)] border border-border-subtle bg-surface-primary px-4 text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
        />
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
