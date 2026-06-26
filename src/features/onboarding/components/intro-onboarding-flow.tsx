"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft } from "lucide-react";

import { AuthLanguageBar } from "@/features/auth/components/auth-language-bar";
import { IntroBrandHeader } from "@/features/onboarding/components/intro-brand-header";
import {
  IntroOnboardingHighlights,
  introHighlightIcons,
} from "@/features/onboarding/components/intro-onboarding-highlights";
import { IntroPracticeFeatures } from "@/features/onboarding/components/intro-practice-features";
import { IntroRhythmScreen } from "@/features/onboarding/components/intro-rhythm-screen";
import { OnboardingProgress } from "@/features/onboarding/components/onboarding-progress";
import { OnboardingStepCard } from "@/features/onboarding/components/onboarding-step-card";
import { readPreAuthOnboardingDraft } from "@/features/onboarding/services/preauth-onboarding-draft";
import { markIntroOnboardingSeen } from "@/features/onboarding/utils/intro-onboarding-storage";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";

const INTRO_STEP_COUNT = 3;
const PRACTICE_STEP = 1;
const RHYTHM_STEP = 2;

export function IntroOnboardingFlow() {
  const t = useTranslations("auth.intro");
  const tAuth = useTranslations("auth");
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [preAuthDateOfBirth, setPreAuthDateOfBirth] = useState(
    () => readPreAuthOnboardingDraft().dateOfBirth ?? "",
  );

  const guidanceHighlights = useMemo(
    () => [
      { icon: introHighlightIcons.moon, label: t("screens.guidance.chips.moon") },
      { icon: introHighlightIcons.sparkles, label: t("screens.guidance.chips.rune") },
      { icon: introHighlightIcons.hash, label: t("screens.guidance.chips.number") },
    ],
    [t],
  );

  const practiceFeatures = useMemo(
    () => [
      {
        title: t("screens.practice.features.universe.title"),
        body: t("screens.practice.features.universe.body"),
      },
      {
        title: t("screens.practice.features.reminders.title"),
        body: t("screens.practice.features.reminders.body"),
      },
      {
        title: t("screens.practice.features.courses.title"),
        body: t("screens.practice.features.courses.body"),
      },
    ],
    [t],
  );

  function finishIntro(destination: "login" | "register") {
    markIntroOnboardingSeen();
    router.replace(destination === "register" ? "/login?mode=register" : "/login");
  }

  return (
    <div className="mystic-auth-page mystic-intro-page">
      <div className="mystic-intro-frame">
        <header className="flex items-center justify-between gap-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((value) => Math.max(value - 1, 0))}
              className="inline-flex min-h-10 min-w-10 items-center justify-center text-auth-text-primary"
              aria-label={t("back")}
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            </button>
          ) : (
            <span className="min-w-10" aria-hidden="true" />
          )}
          <AuthLanguageBar tone="auth" />
        </header>

        <div className="pt-5">
          <OnboardingProgress currentStep={step} totalSteps={INTRO_STEP_COUNT} />
        </div>

        <div className="mystic-intro-stage">
          <div className="mystic-auth-card mystic-intro-panel">
            <IntroBrandHeader
              wordmark={tAuth("brandWordmark")}
              size={step === 0 ? "lg" : "md"}
              showDivider={step === 0}
              className={step === 0 ? undefined : "mb-2"}
            />

            <div className="mt-8 flex flex-1 flex-col sm:mt-10">
              {step === 0 ? (
                <>
                  <OnboardingStepCard
                    title={t("screens.guidance.title")}
                    body={t("screens.guidance.body")}
                    align="center"
                    className="flex-1"
                  />
                  <IntroOnboardingHighlights items={guidanceHighlights} className="mt-8" />
                  <div className="mt-auto flex flex-col gap-3 pt-10">
                    <Button
                      type="button"
                      variant="authPrimary"
                      className="w-full"
                      onClick={() => setStep(1)}
                    >
                      {t("continue")}
                    </Button>
                  </div>
                </>
              ) : null}

              {step === PRACTICE_STEP ? (
                <>
                  <OnboardingStepCard
                    title={t("screens.practice.title")}
                    body={t("screens.practice.body")}
                    align="center"
                    className="flex-1"
                  />
                  <IntroPracticeFeatures items={practiceFeatures} className="mt-8" />
                  <div className="mt-auto flex flex-col gap-3 pt-10">
                    <Button
                      type="button"
                      variant="authPrimary"
                      className="w-full"
                      onClick={() => setStep(RHYTHM_STEP)}
                    >
                      {t("continue")}
                    </Button>
                  </div>
                </>
              ) : null}

              {step === RHYTHM_STEP ? (
                <IntroRhythmScreen
                  dateOfBirth={preAuthDateOfBirth}
                  onDateOfBirthChange={setPreAuthDateOfBirth}
                  onLogin={() => finishIntro("login")}
                  onRegister={() => finishIntro("register")}
                />
              ) : null}
            </div>
          </div>
        </div>

        <footer className="mt-6 space-y-3 pb-6 text-center">
          {step === 0 ? (
            <p className="text-sm">
              <button
                type="button"
                onClick={() => finishIntro("login")}
                className="text-auth-text-muted underline-offset-4 hover:text-auth-text-primary hover:underline"
              >
                {t("alreadyHaveAccount")}
              </button>
            </p>
          ) : null}
          <p className="text-[0.6875rem] leading-relaxed tracking-[0.04em] text-auth-text-subtle">
            {t("brandNote")}
          </p>
        </footer>
      </div>
    </div>
  );
}
