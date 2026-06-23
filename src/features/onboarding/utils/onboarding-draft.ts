import type { SupportedLocale } from "@/config/app-config";

export const ONBOARDING_DRAFT_STORAGE_KEY = "vedunya_onboarding_draft_v1";

export type OnboardingDraft = {
  step: number;
  displayName: string;
  dateOfBirth: string;
  language: SupportedLocale;
};

export function readOnboardingDraft(): Partial<OnboardingDraft> {
  if (typeof window === "undefined") {
    return {};
  }

  const raw = window.sessionStorage.getItem(ONBOARDING_DRAFT_STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as OnboardingDraft;
  } catch {
    window.sessionStorage.removeItem(ONBOARDING_DRAFT_STORAGE_KEY);
    return {};
  }
}

export function writeOnboardingDraft(draft: OnboardingDraft): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    ONBOARDING_DRAFT_STORAGE_KEY,
    JSON.stringify(draft),
  );
}

export function clearOnboardingDraft(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(ONBOARDING_DRAFT_STORAGE_KEY);
}

export function defaultDateOfBirthString(): string {
  const now = new Date();
  const year = now.getFullYear() - 28;
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
