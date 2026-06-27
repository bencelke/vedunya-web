"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { MysticBrandHeader } from "@/components/brand/mystic-brand-header";
import { AuthLanguageBar } from "@/features/auth/components/auth-language-bar";
import { DobInput } from "@/features/onboarding/components/dob-input";
import { OnboardingErrorMessage } from "@/features/onboarding/components/onboarding-error-message";
import { OnboardingLanguagePicker } from "@/features/onboarding/components/onboarding-language-picker";
import { OnboardingShell } from "@/features/onboarding/components/onboarding-shell";
import { OnboardingStepCard } from "@/features/onboarding/components/onboarding-step-card";
import {
  clearOnboardingDraft,
  readOnboardingDraft,
  writeOnboardingDraft,
} from "@/features/onboarding/utils/onboarding-draft";
import {
  clearPreAuthOnboardingDraft,
  readPreAuthOnboardingDraft,
} from "@/features/onboarding/services/preauth-onboarding-draft";
import { resolveProfileCompletionState } from "@/features/onboarding/utils/resolve-profile-completion";
import {
  mapOnboardingZodIssue,
  type OnboardingErrorKey,
} from "@/features/onboarding/utils/onboarding-error-map";
import { invalidateProfileStatusCache } from "@/features/auth/services/profile-status-cache";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { completeUserProfile } from "@/features/profile/services/profile-bootstrap-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SupportedLocale } from "@/config/app-config";
import type { ProfileSnapshot } from "@/features/profile/types/user-profile";

type OnboardingFlowProps = {
  locale: SupportedLocale;
  initialProfile: ProfileSnapshot | null;
};

export function OnboardingFlow({ locale, initialProfile }: OnboardingFlowProps) {
  const initialDraft = readOnboardingDraft();
  const preAuthDraft = readPreAuthOnboardingDraft();
  const t = useTranslations("auth.onboarding");
  const tAuth = useTranslations("auth");
  const router = useRouter();
  const { user, sessionReady } = useAuth();
  const autoCompleteAttemptedRef = useRef(false);

  const initialCompletion = useMemo(
    () =>
      resolveProfileCompletionState({
        profile: initialProfile,
        draftDisplayName: initialDraft.displayName,
        draftDateOfBirth: initialDraft.dateOfBirth,
        draftLanguage: initialDraft.language,
        preAuthDateOfBirth: preAuthDraft.dateOfBirth,
        preAuthLocale: preAuthDraft.locale,
        firebaseDisplayName: user?.displayName,
        routeLocale: locale,
      }),
    [
      initialDraft.dateOfBirth,
      initialDraft.displayName,
      initialDraft.language,
      initialProfile,
      locale,
      preAuthDraft.dateOfBirth,
      preAuthDraft.locale,
      user?.displayName,
    ],
  );

  const [displayName, setDisplayName] = useState(initialCompletion.displayName);
  const [dateOfBirth, setDateOfBirth] = useState(initialCompletion.dateOfBirth);
  const [language, setLanguage] = useState<SupportedLocale>(initialCompletion.language);
  const [submitting, setSubmitting] = useState(false);
  const [errorKey, setErrorKey] = useState<OnboardingErrorKey | null>(null);

  const missing = useMemo(
    () =>
      resolveProfileCompletionState({
        profile: initialProfile,
        draftDisplayName: displayName,
        draftDateOfBirth: dateOfBirth,
        draftLanguage: language,
        preAuthDateOfBirth: preAuthDraft.dateOfBirth,
        preAuthLocale: preAuthDraft.locale,
        firebaseDisplayName: user?.displayName,
        routeLocale: locale,
      }).missing,
    [
      dateOfBirth,
      displayName,
      initialProfile,
      language,
      locale,
      preAuthDraft.dateOfBirth,
      preAuthDraft.locale,
      user?.displayName,
    ],
  );

  const languageOptions = useMemo(
    () => [
      { locale: "ru" as const, label: t("steps.language.russian") },
      { locale: "en" as const, label: t("steps.language.english") },
    ],
    [t],
  );

  const finishOnboarding = useCallback(
    async (input = resolveProfileCompletionState({
      profile: initialProfile,
      draftDisplayName: displayName,
      draftDateOfBirth: dateOfBirth,
      draftLanguage: language,
      preAuthDateOfBirth: preAuthDraft.dateOfBirth,
      preAuthLocale: preAuthDraft.locale,
      firebaseDisplayName: user?.displayName,
      routeLocale: locale,
    }).parsed) => {
      if (!user || !input) {
        setErrorKey("generic");
        return;
      }

      setSubmitting(true);
      setErrorKey(null);

      try {
        await completeUserProfile(user, input);
        clearOnboardingDraft();
        clearPreAuthOnboardingDraft();
        invalidateProfileStatusCache();
        router.replace("/today", { locale: input.language });
      } catch {
        setErrorKey("saveFailed");
      } finally {
        setSubmitting(false);
      }
    },
    [
      dateOfBirth,
      displayName,
      initialProfile,
      language,
      locale,
      preAuthDraft.dateOfBirth,
      preAuthDraft.locale,
      router,
      user,
    ],
  );

  useEffect(() => {
    if (!user || !sessionReady || autoCompleteAttemptedRef.current || submitting) {
      return;
    }

    const state = resolveProfileCompletionState({
      profile: initialProfile,
      draftDisplayName: displayName,
      draftDateOfBirth: dateOfBirth,
      draftLanguage: language,
      preAuthDateOfBirth: preAuthDraft.dateOfBirth,
      preAuthLocale: preAuthDraft.locale,
      firebaseDisplayName: user.displayName,
      routeLocale: locale,
    });

    if (!state.canAutoComplete || !state.parsed) {
      return;
    }

    autoCompleteAttemptedRef.current = true;
    queueMicrotask(() => {
      void finishOnboarding(state.parsed);
    });
  }, [
    dateOfBirth,
    displayName,
    finishOnboarding,
    initialProfile,
    language,
    locale,
    preAuthDraft.dateOfBirth,
    preAuthDraft.locale,
    sessionReady,
    submitting,
    user,
  ]);

  function handleSubmit() {
    const state = resolveProfileCompletionState({
      profile: initialProfile,
      draftDisplayName: displayName,
      draftDateOfBirth: dateOfBirth,
      draftLanguage: language,
      preAuthDateOfBirth: preAuthDraft.dateOfBirth,
      preAuthLocale: preAuthDraft.locale,
      firebaseDisplayName: user?.displayName,
      routeLocale: locale,
    });

    if (!state.parsed) {
      const issue =
        !displayName.trim() ? "nameRequired" :
        !dateOfBirth ? "dobRequired" :
        "generic";
      setErrorKey(mapOnboardingZodIssue({ message: issue, code: "custom", path: [] }));
      return;
    }

    void finishOnboarding(state.parsed);
  }

  const showName = missing.includes("displayName");
  const showDob = missing.includes("dateOfBirth");
  const showLanguage = missing.includes("language");
  const prefilledFromPreAuth =
    showDob && !initialProfile?.dateOfBirth && Boolean(preAuthDraft.dateOfBirth);

  return (
    <OnboardingShell
      variant="profile"
      topBar={
        <div className="flex items-center justify-end gap-3">
          <AuthLanguageBar tone="auth" />
        </div>
      }
      brand={
        <MysticBrandHeader wordmark={tAuth("brandWordmark")} size="md" />
      }
      footer={
        <p className="text-[0.6875rem] leading-relaxed tracking-[0.04em] text-auth-text-subtle">
          {t("privacyNote")}
        </p>
      }
    >
      <OnboardingStepCard
        title={t("compact.title")}
        body={t("compact.body")}
        align="start"
      >
        <OnboardingErrorMessage errorKey={errorKey} />

        {showName ? (
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
                writeOnboardingDraft({
                  step: 0,
                  displayName: event.target.value,
                  dateOfBirth,
                  language,
                });
              }}
            />
          </div>
        ) : null}

        {showDob ? (
          <div className={showName ? "mt-6" : undefined}>
            <DobInput
              key={dateOfBirth || "empty-dob"}
              id="onboarding-dob"
              fieldLabel={t("steps.dob.fieldLabel")}
              fieldPlaceholder={t("steps.dob.fieldPlaceholder")}
              dayLabel={t("steps.dob.dayLabel")}
              monthLabel={t("steps.dob.monthLabel")}
              yearLabel={t("steps.dob.yearLabel")}
              sheetTitle={t("steps.dob.fieldLabel")}
              sheetCancelLabel={t("steps.dob.sheetCancel")}
              sheetDoneLabel={t("continue")}
              reassurance={
                prefilledFromPreAuth
                  ? t("steps.dob.confirmNote")
                  : t("steps.dob.reassurance")
              }
              value={dateOfBirth}
              onChange={(value) => {
                setDateOfBirth(value);
                writeOnboardingDraft({
                  step: 0,
                  displayName,
                  dateOfBirth: value,
                  language,
                });
              }}
              variant="premium"
            />
          </div>
        ) : null}

        {showLanguage ? (
          <div className={showName || showDob ? "mt-6" : undefined}>
            <OnboardingLanguagePicker
              value={language}
              options={languageOptions}
              onChange={(option) => {
                setLanguage(option);
                writeOnboardingDraft({
                  step: 0,
                  displayName,
                  dateOfBirth,
                  language: option,
                });
              }}
            />
          </div>
        ) : null}
      </OnboardingStepCard>

      <div className="mt-auto flex flex-col gap-3 pt-10">
        <Button
          type="button"
          variant="authPrimary"
          className="w-full"
          disabled={submitting || !sessionReady}
          onClick={handleSubmit}
        >
          {submitting ? t("saving") : t("compact.finish")}
        </Button>
      </div>
    </OnboardingShell>
  );
}
