"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft } from "lucide-react";

import { MysticLogo } from "@/components/brand/mystic-logo";
import { AuthLanguageBar } from "@/features/auth/components/auth-language-bar";
import { DobInput } from "@/features/onboarding/components/dob-input";
import { OnboardingErrorMessage } from "@/features/onboarding/components/onboarding-error-message";
import { OnboardingLanguagePicker } from "@/features/onboarding/components/onboarding-language-picker";
import { OnboardingNumerologyPreview } from "@/features/onboarding/components/onboarding-numerology-preview";
import { OnboardingProgress } from "@/features/onboarding/components/onboarding-progress";
import { OnboardingShell } from "@/features/onboarding/components/onboarding-shell";
import { OnboardingStepCard } from "@/features/onboarding/components/onboarding-step-card";
import {
  clearOnboardingDraft,
  readOnboardingDraft,
  writeOnboardingDraft,
  type OnboardingDraft,
} from "@/features/onboarding/utils/onboarding-draft";
import { resolveOnboardingStep } from "@/features/onboarding/utils/resolve-onboarding-step";
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
  const tAuth = useTranslations("auth");
  const router = useRouter();
  const { user, sessionReady } = useAuth();
  const [step, setStep] = useState(() =>
    resolveOnboardingStep(initialDraft, initialProfile),
  );
  const [displayName, setDisplayName] = useState(
    initialDraft.displayName ?? initialProfile?.displayName ?? "",
  );
  const [dateOfBirth, setDateOfBirth] = useState(
    initialDraft.dateOfBirth ??
      (initialProfile?.dateOfBirth
        ? formatDateOfBirth(initialProfile.dateOfBirth)
        : ""),
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

  const languageOptions = useMemo(
    () => [
      { locale: "ru" as const, label: t("steps.language.russian") },
      { locale: "en" as const, label: t("steps.language.english") },
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
      displayName: displayName.trim(),
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
      setErrorKey("saveFailed");
    } finally {
      setSubmitting(false);
    }
  }

  function validateCurrentStep(): boolean {
    if (step === 0) {
      const parsed = onboardingNameSchema.safeParse({
        displayName: displayName.trim(),
      });
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

    if (step === 0) {
      setDisplayName(displayName.trim());
      persistDraft({ displayName: displayName.trim() });
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
  const isPreviewStep = step === STEP_COUNT - 1;

  return (
    <OnboardingShell
      variant="profile"
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
      brand={
        <div className="flex flex-col items-center text-center">
          <p
            className="text-[0.6875rem] font-medium uppercase tracking-[0.28em] text-auth-accent-gold"
            aria-hidden="true"
          >
            {tAuth("brandWordmark")}
          </p>
          <div className="mt-3">
            <MysticLogo showWordmark={false} size="md" />
          </div>
        </div>
      }
      footer={
        step === 1 ? (
          <p className="text-[0.6875rem] leading-relaxed tracking-[0.04em] text-auth-text-subtle">
            {t("privacyNote")}
          </p>
        ) : null
      }
    >
      <OnboardingStepCard
        title={currentStep?.title ?? ""}
        body={currentStep?.body ?? ""}
        align={isPreviewStep ? "center" : "start"}
        hideHeader={isPreviewStep}
      >
        <OnboardingErrorMessage errorKey={errorKey} />

        {step === 0 ? (
          <div className="space-y-2">
            <Label htmlFor="onboarding-name" tone="auth" className="sr-only">
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
              onBlur={() => {
                const trimmed = displayName.trim();
                if (trimmed !== displayName) {
                  setDisplayName(trimmed);
                  persistDraft({ displayName: trimmed });
                }
              }}
            />
          </div>
        ) : null}

        {step === 1 ? (
          <DobInput
            key={dateOfBirth || "empty-dob"}
            id="onboarding-dob"
            dayLabel={t("steps.dob.dayLabel")}
            monthLabel={t("steps.dob.monthLabel")}
            yearLabel={t("steps.dob.yearLabel")}
            reassurance={t("steps.dob.reassurance")}
            value={dateOfBirth}
            onChange={(value) => {
              setDateOfBirth(value);
              persistDraft({ dateOfBirth: value });
            }}
          />
        ) : null}

        {step === 2 ? (
          <OnboardingLanguagePicker
            value={language}
            options={languageOptions}
            onChange={(option) => {
              setLanguage(option);
              persistDraft({ language: option });
            }}
          />
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
    </OnboardingShell>
  );
}
