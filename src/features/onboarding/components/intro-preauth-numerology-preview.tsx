"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { buildPersonalDayResult } from "@/features/numerology/services/personal-day-service";
import { Button } from "@/components/ui/button";
import type { SupportedLocale } from "@/config/app-config";

type IntroPreAuthNumerologyPreviewProps = {
  dateOfBirth: string;
  locale: SupportedLocale;
  onLogin: () => void;
  onRegister: () => void;
};

function todayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function IntroPreAuthNumerologyPreview({
  dateOfBirth,
  locale,
  onLogin,
  onRegister,
}: IntroPreAuthNumerologyPreviewProps) {
  const t = useTranslations("auth.intro.preview");

  const preview = useMemo(() => {
    return buildPersonalDayResult({
      birthDate: dateOfBirth,
      calculationDate: todayIsoDate(),
      locale,
    });
  }, [dateOfBirth, locale]);

  if (!preview) {
    return (
      <div className="flex flex-1 flex-col">
        <p className="text-sm leading-relaxed text-auth-text-muted">{t("loadError")}</p>
      </div>
    );
  }

  const personalDayNumber = preview.calculation.personalDayNumber;

  return (
    <div className="flex flex-1 flex-col">
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

        <p className="text-center text-xs leading-relaxed text-auth-text-subtle">
          {t("saveNote")}
        </p>
      </div>

      <div className="mt-auto flex flex-col gap-3 pt-10">
        <Button type="button" variant="authPrimary" className="w-full" onClick={onRegister}>
          {t("createAccount")}
        </Button>
        <Button type="button" variant="authOutline" className="w-full" onClick={onLogin}>
          {t("login")}
        </Button>
      </div>
    </div>
  );
}
