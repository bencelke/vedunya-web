"use client";

import { useTranslations } from "next-intl";

import type { AuthErrorKey } from "@/features/auth/utils/auth-error-map";

type AuthErrorMessageProps = {
  errorKey: AuthErrorKey | null;
};

export function AuthErrorMessage({ errorKey }: AuthErrorMessageProps) {
  const t = useTranslations("auth.errors");

  if (!errorKey) {
    return null;
  }

  return (
    <p
      role="alert"
      className="rounded-[var(--radius-card)] border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-text-primary"
    >
      {t(errorKey)}
    </p>
  );
}
