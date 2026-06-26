"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";

import { DobInput } from "@/features/onboarding/components/dob-input";
import { OnboardingNumerologyPreview } from "@/features/onboarding/components/onboarding-numerology-preview";
import { OnboardingStepCard } from "@/features/onboarding/components/onboarding-step-card";
import { writePreAuthOnboardingDraft } from "@/features/onboarding/services/preauth-onboarding-draft";
import { onboardingDobSchema } from "@/features/profile/schemas/onboarding-schema";
import { Button } from "@/components/ui/button";
import type { SupportedLocale } from "@/config/app-config";

type IntroRhythmScreenProps = {
  dateOfBirth: string;
  onDateOfBirthChange: (value: string) => void;
  onLogin: () => void;
  onRegister: () => void;
};

export function IntroRhythmScreen({
  dateOfBirth,
  onDateOfBirthChange,
  onLogin,
  onRegister,
}: IntroRhythmScreenProps) {
  const t = useTranslations("auth.intro.rhythm");
  const locale = useLocale() as SupportedLocale;

  const isValidDob = useMemo(
    () => onboardingDobSchema.safeParse({ dateOfBirth }).success,
    [dateOfBirth],
  );

  function handleDateChange(value: string) {
    onDateOfBirthChange(value);
    if (onboardingDobSchema.safeParse({ dateOfBirth: value }).success) {
      writePreAuthOnboardingDraft({ dateOfBirth: value, locale });
    }
  }

  function handleAuth(destination: "login" | "register") {
    if (isValidDob) {
      writePreAuthOnboardingDraft({ dateOfBirth, locale, introCompleted: true });
    }
    if (destination === "login") {
      onLogin();
      return;
    }
    onRegister();
  }

  return (
    <div className="flex flex-1 flex-col">
      <OnboardingStepCard title={t("title")} body={t("body")} align="start" className="flex-1">
        <DobInput
          key={dateOfBirth || "empty-rhythm-dob"}
          id="intro-rhythm-dob"
          fieldPlaceholder={t("fieldPlaceholder")}
          dayLabel={t("dayLabel")}
          monthLabel={t("monthLabel")}
          yearLabel={t("yearLabel")}
          sheetTitle={t("sheetTitle")}
          sheetCancelLabel={t("sheetCancel")}
          sheetDoneLabel={t("sheetDone")}
          reassurance={t("reassurance")}
          value={dateOfBirth}
          onChange={handleDateChange}
          variant="premium"
        />

        {isValidDob ? (
          <div className="mt-8 rounded-[var(--radius-lg)] border border-auth-border/80 bg-auth-surface-muted/40 p-4 sm:p-5">
            <OnboardingNumerologyPreview dateOfBirth={dateOfBirth} locale={locale} />
          </div>
        ) : (
          <p className="mt-6 text-xs leading-relaxed text-auth-text-subtle">{t("pickerHint")}</p>
        )}
      </OnboardingStepCard>

      <div className="mt-auto flex flex-col gap-3 pt-10">
        <Button
          type="button"
          variant="authPrimary"
          className="w-full"
          disabled={!isValidDob}
          onClick={() => handleAuth("register")}
        >
          {t("createAccount")}
        </Button>
        <Button
          type="button"
          variant="authOutline"
          className="w-full"
          disabled={!isValidDob}
          onClick={() => handleAuth("login")}
        >
          {t("login")}
        </Button>
      </div>
    </div>
  );
}
