"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { DobInput } from "@/features/onboarding/components/dob-input";
import { OnboardingErrorMessage } from "@/features/onboarding/components/onboarding-error-message";
import { OnboardingStepCard } from "@/features/onboarding/components/onboarding-step-card";
import { writePreAuthOnboardingDraft } from "@/features/onboarding/services/preauth-onboarding-draft";
import {
  mapOnboardingZodIssue,
  type OnboardingErrorKey,
} from "@/features/onboarding/utils/onboarding-error-map";
import { onboardingDobSchema } from "@/features/profile/schemas/onboarding-schema";
import { Button } from "@/components/ui/button";
import type { SupportedLocale } from "@/config/app-config";

type IntroPreAuthDobProps = {
  initialDateOfBirth?: string;
  onContinue: (dateOfBirth: string) => void;
};

export function IntroPreAuthDob({
  initialDateOfBirth = "",
  onContinue,
}: IntroPreAuthDobProps) {
  const t = useTranslations("auth.intro.dob");
  const locale = useLocale() as SupportedLocale;
  const [dateOfBirth, setDateOfBirth] = useState(initialDateOfBirth);
  const [errorKey, setErrorKey] = useState<OnboardingErrorKey | null>(null);

  function handleContinue() {
    const parsed = onboardingDobSchema.safeParse({ dateOfBirth });
    if (!parsed.success) {
      setErrorKey(mapOnboardingZodIssue(parsed.error.issues[0]));
      return;
    }

    writePreAuthOnboardingDraft({
      dateOfBirth: parsed.data.dateOfBirth,
      locale,
    });
    setErrorKey(null);
    onContinue(parsed.data.dateOfBirth);
  }

  return (
    <div className="flex flex-1 flex-col">
      <OnboardingStepCard
        title={t("title")}
        body={t("body")}
        align="start"
        className="flex-1"
      >
        <OnboardingErrorMessage errorKey={errorKey} />
        <DobInput
          key={initialDateOfBirth || "empty-preauth-dob"}
          id="intro-preauth-dob"
          fieldPlaceholder={t("fieldPlaceholder")}
          dayLabel={t("dayLabel")}
          monthLabel={t("monthLabel")}
          yearLabel={t("yearLabel")}
          sheetTitle={t("title")}
          sheetCancelLabel={t("sheetCancel")}
          sheetDoneLabel={t("sheetDone")}
          reassurance={t("reassurance")}
          value={dateOfBirth}
          onChange={setDateOfBirth}
        />
      </OnboardingStepCard>

      <div className="mt-auto flex flex-col gap-3 pt-10">
        <Button type="button" variant="authPrimary" className="w-full" onClick={handleContinue}>
          {t("submit")}
        </Button>
      </div>
    </div>
  );
}
