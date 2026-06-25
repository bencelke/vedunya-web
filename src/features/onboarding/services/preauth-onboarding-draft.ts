import type { SupportedLocale } from "@/config/app-config";

export const PREAUTH_ONBOARDING_DRAFT_STORAGE_KEY =
  "vedunya_preauth_onboarding_draft";

export type PreAuthOnboardingDraft = {
  dateOfBirth?: string;
  locale?: SupportedLocale;
  createdAt?: string;
};

function isSupportedLocale(value: unknown): value is SupportedLocale {
  return value === "en" || value === "ru";
}

export function readPreAuthOnboardingDraft(): PreAuthOnboardingDraft {
  if (typeof window === "undefined") {
    return {};
  }

  const raw = window.sessionStorage.getItem(PREAUTH_ONBOARDING_DRAFT_STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as PreAuthOnboardingDraft;
    const draft: PreAuthOnboardingDraft = {};

    if (
      typeof parsed.dateOfBirth === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(parsed.dateOfBirth)
    ) {
      draft.dateOfBirth = parsed.dateOfBirth;
    }

    if (isSupportedLocale(parsed.locale)) {
      draft.locale = parsed.locale;
    }

    if (typeof parsed.createdAt === "string") {
      draft.createdAt = parsed.createdAt;
    }

    return draft;
  } catch {
    window.sessionStorage.removeItem(PREAUTH_ONBOARDING_DRAFT_STORAGE_KEY);
    return {};
  }
}

export function writePreAuthOnboardingDraft(
  patch: Partial<PreAuthOnboardingDraft>,
): void {
  if (typeof window === "undefined") {
    return;
  }

  const current = readPreAuthOnboardingDraft();
  const next: PreAuthOnboardingDraft = {
    ...current,
    ...patch,
    createdAt: patch.createdAt ?? current.createdAt ?? new Date().toISOString(),
  };

  window.sessionStorage.setItem(
    PREAUTH_ONBOARDING_DRAFT_STORAGE_KEY,
    JSON.stringify(next),
  );
}

export function clearPreAuthOnboardingDraft(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(PREAUTH_ONBOARDING_DRAFT_STORAGE_KEY);
}
