"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { buildPersonalDayResult } from "@/features/numerology/services/personal-day-service";
import type { SupportedLocale } from "@/config/app-config";
import { resolveSpiritualContentLocale } from "@/i18n/resolve-spiritual-content-locale";

type OnboardingNumerologyPreviewProps = {
  dateOfBirth: string;
  locale: SupportedLocale;
};

function todayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function OnboardingNumerologyPreview({
  dateOfBirth,
  locale,
}: OnboardingNumerologyPreviewProps) {
  const t = useTranslations("auth.onboarding.steps.preview");

  const preview = useMemo(() => {
    return buildPersonalDayResult({
      birthDate: dateOfBirth,
      calculationDate: todayIsoDate(),
      locale: resolveSpiritualContentLocale(locale),
    });
  }, [dateOfBirth, locale]);

  if (!preview) {
    return (
      <p className="text-sm leading-relaxed text-auth-text-muted">
        {t("loadError")}
      </p>
    );
  }

  const personalDayNumber = preview.calculation.personalDayNumber;

  return (
    <div className="space-y-7">
      <div className="flex flex-col items-center text-center">
        <div
          className="flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full border border-auth-accent-gold/35 bg-auth-accent-gold/10"
          aria-label={t("numberA11y", { number: personalDayNumber })}
        >
          <span className="text-[2.75rem] font-extralight tabular-nums leading-none text-auth-text-primary">
            {personalDayNumber}
          </span>
        </div>
        <p className="mt-6 text-[clamp(1.125rem,3.8vw,1.375rem)] font-medium leading-snug text-auth-text-primary">
          {t("rhythmHeadline", { number: personalDayNumber })}
        </p>
        <p className="mt-2 text-lg text-auth-text-primary">{preview.content.title}</p>
      </div>

      <p className="text-sm leading-[1.72] text-auth-text-muted">
        {preview.content.summary}
      </p>

      <div className="rounded-[var(--radius-lg)] border border-auth-border bg-auth-surface-muted/70 px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-auth-text-subtle">
          {t("focusLabel")}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-auth-text-primary">
          {preview.content.doAdvice}
        </p>
      </div>
    </div>
  );
}
