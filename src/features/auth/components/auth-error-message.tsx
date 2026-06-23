"use client";

import { useTranslations } from "next-intl";

import type { AuthErrorKey } from "@/features/auth/utils/auth-error-map";

type AuthErrorMessageProps = {
  errorKey: AuthErrorKey | null;
  tone?: "app" | "auth";
};

export function AuthErrorMessage({
  errorKey,
  tone = "app",
}: AuthErrorMessageProps) {
  const t = useTranslations("auth.errors");

  if (!errorKey) {
    return null;
  }

  return (
    <p
      role="alert"
      className={
        tone === "auth"
          ? "rounded-[var(--auth-radius-card)] border border-destructive/35 bg-destructive/8 px-4 py-3 text-sm text-auth-text-primary"
          : "rounded-[var(--radius-card)] border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-text-primary"
      }
    >
      {t(errorKey)}
    </p>
  );
}
