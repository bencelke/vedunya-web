import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { resolveProfileCompletionState } from "@/features/onboarding/utils/resolve-profile-completion";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("Phase 18E — three-screen intro flow", () => {
  it("shows exactly three onboarding screens before auth", () => {
    const flow = readSource("src/features/onboarding/components/intro-onboarding-flow.tsx");
    expect(flow).toContain("INTRO_STEP_COUNT = 3");
    expect(flow).toContain('t("screens.guidance.title")');
    expect(flow).toContain('t("screens.practice.title")');
    expect(flow).toContain("IntroRhythmScreen");
    expect(flow).not.toContain("IntroFirstGlimpse");
    expect(flow).not.toContain("IntroPreAuthDob");
    expect(flow).not.toContain("IntroPreAuthNumerologyPreview");
  });

  it("removes old multi-card intro pages from active flow", () => {
    const flow = readSource("src/features/onboarding/components/intro-onboarding-flow.tsx");
    expect(flow).not.toContain("PAGE_KEYS");
    expect(flow).not.toContain("GLIMPSE_STEP");
    expect(flow).not.toContain("isGlimpseStep");
  });
});

describe("Phase 18E — pre-auth DOB and auth handoff", () => {
  it("preserves pre-auth DOB through sessionStorage draft", () => {
    const rhythm = readSource("src/features/onboarding/components/intro-rhythm-screen.tsx");
    expect(rhythm).toContain("writePreAuthOnboardingDraft");
    expect(rhythm).toContain("onboardingDobSchema");
  });

  it("uses compact signed-in completion instead of four-step chain", () => {
    const flow = readSource("src/features/onboarding/components/onboarding-flow.tsx");
    expect(flow).toContain("compact.title");
    expect(flow).toContain("resolveProfileCompletionState");
    expect(flow).toContain("canAutoComplete");
    expect(flow).not.toContain("STEP_COUNT = 4");
    expect(flow).not.toContain("OnboardingNumerologyPreview");
    expect(flow).not.toContain("OnboardingProgress");
  });

  it("clears temp DOB after successful profile migration", () => {
    const flow = readSource("src/features/onboarding/components/onboarding-flow.tsx");
    expect(flow).toContain("clearPreAuthOnboardingDraft");
  });
});

describe("Phase 18E — profile completion contract", () => {
  it("treats missing DOB as incomplete even with legacy flags", () => {
    const state = resolveProfileCompletionState({
      profile: {
        uid: "u1",
        displayName: "Maria",
        email: null,
        dateOfBirth: null,
        language: "en",
        profileComplete: true,
        authProviders: [],
        publicProfile: null,
        privateProfile: null,
      },
      routeLocale: "en",
    });
    expect(state.missing).toContain("dateOfBirth");
    expect(state.canAutoComplete).toBe(false);
  });

  it("can auto-complete when name, DOB draft, and language are available", () => {
    const state = resolveProfileCompletionState({
      profile: null,
      draftDisplayName: "Maria",
      preAuthDateOfBirth: "1990-03-15",
      preAuthLocale: "en",
      routeLocale: "en",
    });
    expect(state.canAutoComplete).toBe(true);
    expect(state.parsed?.dateOfBirth).toBe("1990-03-15");
  });
});

describe("Phase 18E — brand unification", () => {
  it("uses MYSTIC by Vedunya Maria on onboarding and auth", () => {
    expect(en.auth.brandWordmark).toBe("MYSTIC by Vedunya Maria");
    expect(ru.auth.brandWordmark).toBe("MYSTIC by Vedunya Maria");
    const intro = readSource("src/features/onboarding/components/intro-onboarding-flow.tsx");
    const auth = readSource("src/features/auth/components/auth-brand-header.tsx");
    expect(intro).toContain("brandWordmark");
    expect(auth).toContain("brandWordmark");
  });
});

describe("Phase 18E — auth providers and redirect safety", () => {
  it("keeps conditional social provider buttons", () => {
    const buttons = readSource("src/features/auth/components/auth-provider-buttons.tsx");
    expect(buttons).toContain("getSocialAuthProviderAvailability");
    expect(buttons).toContain("social-auth-providers");
  });

  it("avoids redirect loops on onboarding and today", () => {
    const route = readSource("src/features/onboarding/components/onboarding-route.tsx");
    expect(route).toContain('pathname !== "/today"');
    const today = readSource("src/app/[locale]/today/page.tsx");
    expect(today).not.toContain("router.replace");
  });
});
