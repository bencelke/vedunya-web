"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft } from "lucide-react";

import { MysticLogo } from "@/components/brand/mystic-logo";
import { AuthLanguageBar } from "@/features/auth/components/auth-language-bar";
import {
  IntroOnboardingHighlights,
  introHighlightIcons,
} from "@/features/onboarding/components/intro-onboarding-highlights";
import { OnboardingProgress } from "@/features/onboarding/components/onboarding-progress";
import { OnboardingStepCard } from "@/features/onboarding/components/onboarding-step-card";
import { markIntroOnboardingSeen } from "@/features/onboarding/utils/intro-onboarding-storage";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";

const INTRO_STEP_COUNT = 4;

const PAGE_KEYS = ["guidance", "universe", "reminders", "courses"] as const;

const PAGE_HIGHLIGHTS: ReadonlyArray<
  ReadonlyArray<{ key: string; icon: keyof typeof introHighlightIcons }>
> = [
  [
    { key: "moon", icon: "moon" },
    { key: "rune", icon: "sparkles" },
    { key: "number", icon: "hash" },
  ],
  [
    { key: "request", icon: "sparkles" },
    { key: "return", icon: "refresh" },
    { key: "focus", icon: "moon" },
  ],
  [
    { key: "gentle", icon: "bell" },
    { key: "practice", icon: "refresh" },
    { key: "rhythm", icon: "moon" },
  ],
  [
    { key: "runes", icon: "book" },
    { key: "depth", icon: "sparkles" },
    { key: "pace", icon: "refresh" },
  ],
];

export function IntroOnboardingFlow() {
  const t = useTranslations("auth.intro");
  const tAuth = useTranslations("auth");
  const router = useRouter();
  const [step, setStep] = useState(0);

  const steps = useMemo(
    () =>
      PAGE_KEYS.map((key) => ({
        title: t(`pages.${key}.title`),
        body: t(`pages.${key}.body`),
      })),
    [t],
  );

  const highlights = useMemo(
    () =>
      PAGE_HIGHLIGHTS.map((items, index) =>
        items.map((item) => ({
          icon: introHighlightIcons[item.icon],
          label: t(`pages.${PAGE_KEYS[index]}.highlights.${item.key}`),
        })),
      ),
    [t],
  );

  function finishIntro(destination: "login" | "register") {
    markIntroOnboardingSeen();
    router.replace(destination === "register" ? "/login?mode=register" : "/login");
  }

  const currentStep = steps[step];
  const currentHighlights = highlights[step] ?? [];

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
            <div className="flex flex-col items-center text-center">
              <p
                className={
                  step === 0
                    ? "mystic-auth-wordmark"
                    : "text-[0.6875rem] font-medium uppercase tracking-[0.28em] text-auth-accent-gold"
                }
                aria-hidden="true"
              >
                {tAuth("brandWordmark")}
              </p>
              <div className={step === 0 ? "mt-5" : "mt-3"}>
                <MysticLogo showWordmark={false} size={step === 0 ? "lg" : "md"} />
              </div>
              {step === 0 ? <div className="mystic-auth-divider mt-6" aria-hidden="true" /> : null}
            </div>

            <div className="mt-8 flex flex-1 flex-col sm:mt-10">
              <OnboardingStepCard
                title={currentStep?.title ?? ""}
                body={currentStep?.body ?? ""}
                align="center"
                className="flex-1"
              />

              <IntroOnboardingHighlights
                items={currentHighlights}
                className="mt-8"
              />

              <div className="mt-auto flex flex-col gap-3 pt-10">
                {step < INTRO_STEP_COUNT - 1 ? (
                  <Button
                    type="button"
                    variant="authPrimary"
                    className="w-full"
                    onClick={() =>
                      setStep((value) => Math.min(value + 1, INTRO_STEP_COUNT - 1))
                    }
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
        </div>

        <footer className="mt-6 space-y-3 pb-6 text-center">
          {step < INTRO_STEP_COUNT - 1 ? (
            <p className="text-sm">
              <button
                type="button"
                onClick={() => finishIntro("login")}
                className="text-auth-text-muted underline-offset-4 hover:text-auth-text-primary hover:underline"
              >
                {t("skipToLogin")}
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
