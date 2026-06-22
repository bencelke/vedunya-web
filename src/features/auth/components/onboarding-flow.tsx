"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { completeUserProfile } from "@/features/profile/services/profile-bootstrap-service";
import {
  formatDateOfBirth,
  onboardingCompleteSchema,
} from "@/features/profile/schemas/onboarding-schema";
import { AuthErrorMessage } from "@/features/auth/components/auth-error-message";
import { mapFirebaseAuthError, type AuthErrorKey } from "@/features/auth/utils/auth-error-map";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import type { SupportedLocale } from "@/config/app-config";
import type { ProfileSnapshot } from "@/features/profile/types/user-profile";

const STORAGE_KEY = "vedunya_onboarding_draft_v1";

function readDraftFromStorage(): Partial<OnboardingDraft> {
  if (typeof window === "undefined") {
    return {};
  }

  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as OnboardingDraft;
  } catch {
    window.sessionStorage.removeItem(STORAGE_KEY);
    return {};
  }
}

type OnboardingDraft = {
  step: number;
  displayName: string;
  dateOfBirth: string;
  language: SupportedLocale;
};

type OnboardingFlowProps = {
  locale: SupportedLocale;
  initialProfile: ProfileSnapshot | null;
};

export function OnboardingFlow({ locale, initialProfile }: OnboardingFlowProps) {
  const initialDraft = readDraftFromStorage();
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
        : ""),
  );
  const [language, setLanguage] = useState<SupportedLocale>(
    initialDraft.language ?? initialProfile?.language ?? locale,
  );
  const [submitting, setSubmitting] = useState(false);
  const [errorKey, setErrorKey] = useState<AuthErrorKey | null>(null);

  const persistDraft = useCallback(
    (next: Partial<OnboardingDraft>) => {
      const draft: OnboardingDraft = {
        step,
        displayName,
        dateOfBirth,
        language,
        ...next,
      };
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    },
    [dateOfBirth, displayName, language, step],
  );

  const steps = useMemo(
    () => [
      { title: t("steps.welcome.title"), body: t("steps.welcome.body") },
      { title: t("steps.name.title"), body: t("steps.name.body") },
      { title: t("steps.dob.title"), body: t("steps.dob.body") },
      { title: t("steps.language.title"), body: t("steps.language.body") },
      { title: t("steps.ready.title"), body: t("steps.ready.body") },
    ],
    [t],
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
      setErrorKey("generic");
      return;
    }

    setSubmitting(true);
    setErrorKey(null);

    try {
      await completeUserProfile(user, parsed.data);
      window.sessionStorage.removeItem(STORAGE_KEY);
      router.replace("/today", { locale: parsed.data.language });
      router.refresh();
    } catch (error) {
      setErrorKey(mapFirebaseAuthError(error));
    } finally {
      setSubmitting(false);
    }
  }

  function goNext() {
    if (step === 1 && displayName.trim().length === 0) {
      setErrorKey("generic");
      return;
    }

    if (step === 2) {
      const parsed = onboardingCompleteSchema.safeParse({
        displayName,
        dateOfBirth,
        language,
      });
      if (!parsed.success) {
        setErrorKey("generic");
        return;
      }
    }

    setErrorKey(null);
    const nextStep = Math.min(step + 1, steps.length - 1);
    setStep(nextStep);
    persistDraft({ step: nextStep });
  }

  function goBack() {
    setErrorKey(null);
    const nextStep = Math.max(step - 1, 0);
    setStep(nextStep);
    persistDraft({ step: nextStep });
  }

  return (
    <Container narrow className="py-8">
      <div className="space-y-6">
        <header className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent-gold">
            {t("eyebrow")}
          </p>
          <h1 className="text-2xl font-medium text-text-primary">
            {steps[step]?.title}
          </h1>
          <p className="text-sm leading-relaxed text-text-muted">
            {steps[step]?.body}
          </p>
        </header>

        <AuthErrorMessage errorKey={errorKey} />

        {step === 1 ? (
          <div className="space-y-2">
            <label htmlFor="onboarding-name" className="text-sm text-text-muted">
              {t("steps.name.fieldLabel")}
            </label>
            <input
              id="onboarding-name"
              value={displayName}
              onChange={(event) => {
                setDisplayName(event.target.value);
                persistDraft({ displayName: event.target.value });
              }}
              className="min-h-12 w-full rounded-[var(--radius-card)] border border-border-subtle bg-surface-primary px-4 text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            />
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-2">
            <label htmlFor="onboarding-dob" className="text-sm text-text-muted">
              {t("steps.dob.fieldLabel")}
            </label>
            <input
              id="onboarding-dob"
              type="date"
              value={dateOfBirth}
              onChange={(event) => {
                setDateOfBirth(event.target.value);
                persistDraft({ dateOfBirth: event.target.value });
              }}
              className="min-h-12 w-full rounded-[var(--radius-card)] border border-border-subtle bg-surface-primary px-4 text-sm text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
            />
            <p className="text-xs leading-relaxed text-text-subtle">
              {t("steps.dob.helper")}
            </p>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid grid-cols-2 gap-3">
            {(["en", "ru"] as SupportedLocale[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setLanguage(option);
                  persistDraft({ language: option });
                }}
                className={`min-h-12 rounded-[var(--radius-card)] border px-4 text-sm font-medium transition-colors ${
                  language === option
                    ? "border-accent-gold bg-accent-gold-muted text-accent-gold"
                    : "border-border-subtle bg-surface-primary text-text-muted"
                }`}
              >
                {option === "en" ? t("steps.language.english") : t("steps.language.russian")}
              </button>
            ))}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 pt-2">
          {step < steps.length - 1 ? (
            <Button type="button" className="w-full" onClick={goNext}>
              {t("continue")}
            </Button>
          ) : (
            <Button
              type="button"
              className="w-full"
              disabled={submitting || !sessionReady}
              onClick={finishOnboarding}
            >
              {submitting ? t("saving") : t("finish")}
            </Button>
          )}
          {step > 0 && step < steps.length - 1 ? (
            <Button type="button" variant="ghost" className="w-full" onClick={goBack}>
              {t("back")}
            </Button>
          ) : null}
        </div>
      </div>
    </Container>
  );
}
