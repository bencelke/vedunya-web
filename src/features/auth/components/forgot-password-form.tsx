"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { AuthErrorMessage } from "@/features/auth/components/auth-error-message";
import { AuthFormCard } from "@/features/auth/components/auth-form-card";
import { sendPasswordReset } from "@/features/auth/services/auth-service";
import { forgotPasswordSchema } from "@/features/auth/schemas/auth-schema";
import {
  mapFirebaseAuthError,
  mapZodIssueToAuthError,
  type AuthErrorKey,
} from "@/features/auth/utils/auth-error-map";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <AuthFormCard>
      <form onSubmit={handleSubmit} className="space-y-6">
        <AuthErrorMessage errorKey={errorKey} tone="auth" />
        {sent ? (
          <p
            role="status"
            className="rounded-[var(--radius-md)] border border-auth-border bg-auth-surface-muted px-4 py-3 text-sm leading-relaxed text-auth-text-muted"
          >
            {t("success")}
          </p>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="forgot-email" tone="auth">
            {t("emailLabel")}
          </Label>
          <Input
            id="forgot-email"
            type="email"
            autoComplete="email"
            tone="auth"
            variant="underline"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <Button
          type="submit"
          variant="authPrimary"
          className="w-full"
          disabled={submitting || sent}
        >
          {submitting ? t("submitting") : t("submit")}
        </Button>
      </form>
    </AuthFormCard>
  );
}
