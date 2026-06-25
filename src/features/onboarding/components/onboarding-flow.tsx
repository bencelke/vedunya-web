"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft } from "lucide-react";

import { AuthLanguageBar } from "@/features/auth/components/auth-language-bar";
import { DobInput } from "@/features/onboarding/components/dob-input";
import { OnboardingErrorMessage } from "@/features/onboarding/components/onboarding-error-message";
import { OnboardingNumerologyPreview } from "@/features/onboarding/components/onboarding-numerology-preview";
import { OnboardingProgress } from "@/features/onboarding/components/onboarding-progress";
import { OnboardingShell } from "@/features/onboarding/components/onboarding-shell";
import { OnboardingStepCard } from "@/features/onboarding/components/onboarding-step-card";
import {
  clearOnboardingDraft,
  defaultDateOfBirthString,
  readOnboardingDraft,
  writeOnboardingDraft,
  type OnboardingDraft,
} from "@/features/onboarding/utils/onboarding-draft";
import {
  mapOnboardingZodIssue,
  type OnboardingErrorKey,
} from "@/features/onboarding/utils/onboarding-error-map";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { completeUserProfile } from "@/features/profile/services/profile-bootstrap-service";
import {
  formatDateOfBirth,
  onboardingCompleteSchema,
  onboardingDobSchema,
  onboardingNameSchema,
} from "@/features/profile/schemas/onboarding-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SupportedLocale } from "@/config/app-config";
import type { ProfileSnapshot } from "@/features/profile/types/user-profile";

const STEP_COUNT = 4;

type OnboardingFlowProps = {
  locale: SupportedLocale;
  initialProfile: ProfileSnapshot | null;
};

export function OnboardingFlow({ locale, initialProfile }: OnboardingFlowProps) {
  const initialDraft = readOnboardingDraft();
  const t = useTranslations("auth.onboarding");
  const router = useRouter();
  const { user, sessionReady } = useAuth();
  const [step, setStep] = useState(initialDraft.step ?? 0);
  const [displayName, setDisplayName] = useState(
    initialDraft.displayName ?? initialProfile?.displayName ?? "",
  );
  const [dateOfBirth, setDateOfBirth] = useState(
    initialDraft.dateOfBirth ??
      (initialProfile?.dateOfBirth
        ? formatDateOfBirth(initialProfile.dateOfBirth)
        : defaultDateOfBirthString()),
  );
  const [language, setLanguage] = useState<SupportedLocale>(
    initialDraft.language ?? initialProfile?.language ?? locale,
  );
  const [submitting, setSubmitting] = useState(false);
  const [errorKey, setErrorKey] = useState<OnboardingErrorKey | null>(null);

  const steps = useMemo(
    () => [
      { title: t("steps.name.title"), body: t("steps.name.body") },
      { title: t("steps.dob.title"), body: t("steps.dob.body") },
      { title: t("steps.language.title"), body: t("steps.language.body") },
      { title: t("steps.preview.title"), body: t("steps.preview.body") },
    ],
    [t],
  );

  const persistDraft = useCallback(
    (next: Partial<OnboardingDraft>) => {
      writeOnboardingDraft({
        step,
        displayName,
        dateOfBirth,
        language,
        ...next,
      });
    },
    [dateOfBirth, displayName, language, step],
  );

  async function finishOnboarding() {
    if (!user) {
      setErrorKey("generic");
      return;
    }

    const parsed = onboardingCompleteSchema.safeParse({
      displayName,
      dateOfBirth,
      language,
    });

    if (!parsed.success) {
      setErrorKey(mapOnboardingZodIssue(parsed.error.issues[0]));
      return;
    }

    setSubmitting(true);
    setErrorKey(null);

    try {
      await completeUserProfile(user, parsed.data);
      clearOnboardingDraft();
      router.replace("/today", { locale: parsed.data.language });
      router.refresh();
    } catch {
      setErrorKey("generic");
    } finally {
      setSubmitting(false);
    }
  }

  function validateCurrentStep(): boolean {
    if (step === 0) {
      const parsed = onboardingNameSchema.safeParse({ displayName });
      if (!parsed.success) {
        setErrorKey(mapOnboardingZodIssue(parsed.error.issues[0]));
        return false;
      }
    }

    if (step === 1) {
      const parsed = onboardingDobSchema.safeParse({ dateOfBirth });
      if (!parsed.success) {
        setErrorKey(mapOnboardingZodIssue(parsed.error.issues[0]));
        return false;
      }
    }

    return true;
  }

  function goNext() {
    if (!validateCurrentStep()) {
      return;
    }

    setErrorKey(null);
    const nextStep = Math.min(step + 1, STEP_COUNT - 1);
    setStep(nextStep);
    persistDraft({ step: nextStep });
  }

  function goBack() {
    setErrorKey(null);
    const nextStep = Math.max(step - 1, 0);
    setStep(nextStep);
    persistDraft({ step: nextStep });
  }

  const currentStep = steps[step];

  return (
    <OnboardingShell
      topBar={
        <div className="flex items-center justify-between gap-3">
          {step > 0 ? (
            <button
              type="button"
              onClick={goBack}
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
      }
      progress={
        <OnboardingProgress currentStep={step} totalSteps={STEP_COUNT} />
      }
    >
      <div className="flex flex-1 flex-col">
        <OnboardingStepCard
          title={currentStep?.title ?? ""}
          body={currentStep?.body ?? ""}
          align="start"
        >
          <OnboardingErrorMessage errorKey={errorKey} />

          {step === 0 ? (
            <div className="space-y-2">
              <Label htmlFor="onboarding-name" tone="auth">
                {t("steps.name.fieldLabel")}
              </Label>
              <Input
                id="onboarding-name"
                tone="auth"
                variant="underline"
                autoComplete="given-name"
                placeholder={t("steps.name.placeholder")}
                value={displayName}
                onChange={(event) => {
                  setDisplayName(event.target.value);
                  persistDraft({ displayName: event.target.value });
                }}
              />
            </div>
          ) : null}

          {step === 1 ? (
            <DobInput
              id="onboarding-dob"
              label={t("steps.dob.fieldLabel")}
              helper={t("steps.dob.helper")}
              value={dateOfBirth}
              onChange={(value) => {
                setDateOfBirth(value);
                persistDraft({ dateOfBirth: value });
              }}
            />
          ) : null}

          {step === 2 ? (
            <div className="grid grid-cols-2 gap-3">
              {(["en", "ru"] as SupportedLocale[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setLanguage(option);
                    persistDraft({ language: option });
                  }}
                  className={`min-h-12 rounded-[var(--radius-pill)] border px-4 text-sm font-medium transition-colors ${
                    language === option
                      ? "border-auth-accent-gold bg-auth-accent-gold text-auth-bg"
                      : "border-auth-border bg-auth-surface-muted text-auth-text-muted hover:text-auth-text-primary"
                  }`}
                >
                  {option === "en"
                    ? t("steps.language.english")
                    : t("steps.language.russian")}
                </button>
              ))}
            </div>
          ) : null}

          {step === 3 ? (
            <OnboardingNumerologyPreview
              dateOfBirth={dateOfBirth}
              locale={language}
            />
          ) : null}
        </OnboardingStepCard>

        <div className="mt-auto flex flex-col gap-3 pt-10">
          {step < STEP_COUNT - 1 ? (
            <Button
              type="button"
              variant="authPrimary"
              className="w-full"
              onClick={goNext}
            >
              {t("continue")}
            </Button>
          ) : (
            <Button
              type="button"
              variant="authPrimary"
              className="w-full"
              disabled={submitting || !sessionReady}
              onClick={finishOnboarding}
            >
              {submitting ? t("saving") : t("finish")}
            </Button>
          )}
        </div>
      </div>
    </OnboardingShell>
  );
}
