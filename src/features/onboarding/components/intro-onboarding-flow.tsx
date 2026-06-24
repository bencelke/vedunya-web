"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft } from "lucide-react";

import { MysticLogo } from "@/components/brand/mystic-logo";
import { AuthLanguageBar } from "@/features/auth/components/auth-language-bar";
import { OnboardingProgress } from "@/features/onboarding/components/onboarding-progress";
import { OnboardingStepCard } from "@/features/onboarding/components/onboarding-step-card";
import { markIntroOnboardingSeen } from "@/features/onboarding/utils/intro-onboarding-storage";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";

const INTRO_STEP_COUNT = 4;

export function IntroOnboardingFlow() {
  const t = useTranslations("auth.intro");
  const tAuth = useTranslations("auth");
  const router = useRouter();
  const [step, setStep] = useState(0);

  const steps = useMemo(
    () => [
      { title: t("pages.guidance.title"), body: t("pages.guidance.body") },
      { title: t("pages.universe.title"), body: t("pages.universe.body") },
      { title: t("pages.reminders.title"), body: t("pages.reminders.body") },
      { title: t("pages.courses.title"), body: t("pages.courses.body") },
    ],
    [t],
  );

  function finishIntro(destination: "login" | "register") {
    markIntroOnboardingSeen();
    router.replace(destination === "register" ? "/login?mode=register" : "/login");
  }

  const currentStep = steps[step];

  return (
    <div className="mystic-auth-page">
      <div className="mystic-shell space-y-5 px-[var(--spacing-page)] pb-10 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between gap-3">
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
        </div>

        <OnboardingProgress currentStep={step} totalSteps={INTRO_STEP_COUNT} />

        <div className="mystic-auth-card p-6 sm:p-8">
          <div className="flex flex-1 flex-col">
            {step === 0 ? (
              <div className="mb-8 flex flex-col items-center gap-4">
                <p className="mystic-auth-wordmark text-center" aria-hidden="true">
                  {tAuth("brandWordmark")}
                </p>
                <MysticLogo showWordmark={false} size="lg" />
              </div>
            ) : null}

            <OnboardingStepCard
              title={currentStep?.title ?? ""}
              body={currentStep?.body ?? ""}
              align={step === 0 ? "center" : "start"}
            />

            <div className="mt-auto flex flex-col gap-3 pt-10">
              {step < INTRO_STEP_COUNT - 1 ? (
                <Button
                  type="button"
                  variant="authPrimary"
                  className="w-full"
                  onClick={() => setStep((value) => Math.min(value + 1, INTRO_STEP_COUNT - 1))}
                >
                  {step === 0 ? t("start") : t("continue")}
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="authPrimary"
                    className="w-full"
                    onClick={() => finishIntro("login")}
                  >
                    {t("login")}
                  </Button>
                  <Button
                    type="button"
                    variant="authOutline"
                    className="w-full"
                    onClick={() => finishIntro("register")}
                  >
                    {t("createAccount")}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {step < INTRO_STEP_COUNT - 1 ? (
          <p className="text-center text-sm">
            <button
              type="button"
              onClick={() => finishIntro("login")}
              className="text-auth-text-muted underline-offset-4 hover:text-auth-text-primary hover:underline"
            >
              {t("skipToLogin")}
            </button>
          </p>
        ) : null}
      </div>
    </div>
  );
}
