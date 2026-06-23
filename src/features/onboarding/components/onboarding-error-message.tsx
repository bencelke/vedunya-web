"use client";

import { useTranslations } from "next-intl";

import type { OnboardingErrorKey } from "@/features/onboarding/utils/onboarding-error-map";

type OnboardingErrorMessageProps = {
  errorKey: OnboardingErrorKey | null;
};

export function OnboardingErrorMessage({ errorKey }: OnboardingErrorMessageProps) {
  const t = useTranslations("auth.onboarding.errors");

  if (!errorKey) {
    return null;
  }

  return (
    <p
      role="alert"
      className="rounded-[var(--radius-md)] border border-destructive/35 bg-destructive/8 px-4 py-3 text-sm text-auth-text-primary"
    >
      {t(errorKey)}
    </p>
  );
}
