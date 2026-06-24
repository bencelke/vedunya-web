const INTRO_ONBOARDING_SEEN_KEY = "mystic_onboarding_seen";

export function isIntroOnboardingSeen(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.localStorage.getItem(INTRO_ONBOARDING_SEEN_KEY) === "true";
  } catch {
    return false;
  }
}

export function markIntroOnboardingSeen(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(INTRO_ONBOARDING_SEEN_KEY, "true");
  } catch {
    // Ignore storage failures; user can see intro again next visit.
  }
}
