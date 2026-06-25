import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { getFirstGlimpseNote } from "@/features/onboarding/services/first-glimpse-content";
import { deriveProfileComplete } from "@/features/profile/utils/profile-complete";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("Phase 18F — signed-out first glimpse", () => {
  it("includes first glimpse then DOB before login CTAs", () => {
    const flow = readSource("src/features/onboarding/components/intro-onboarding-flow.tsx");
    expect(flow).toContain("IntroFirstGlimpse");
    expect(flow).toContain("IntroPreAuthDob");
    expect(flow).toContain("IntroPreAuthNumerologyPreview");
    expect(flow).toContain("DOB_STEP");
    expect(flow).toContain("PREVIEW_STEP");
  });

  it("renders RU/EN first glimpse copy", () => {
    expect(en.auth.intro.glimpse.title).toContain("first glimpse");
    expect(en.auth.intro.glimpse.subtitle).toContain("personal rhythm");
    expect(ru.auth.intro.glimpse.title).toBe("Первый взгляд на день");
    expect(ru.auth.intro.glimpse.subtitle).toContain("личный ритм");
  });

  it("does not claim personalization on first glimpse", () => {
    expect(en.auth.intro.glimpse.disclaimer.toLowerCase()).toContain("not your personal");
    expect(ru.auth.intro.glimpse.disclaimer).toContain("не ваша личная");
    const glimpse = readSource("src/features/onboarding/components/intro-first-glimpse.tsx");
    expect(glimpse).not.toContain("personalDay");
    expect(glimpse).not.toContain("buildPersonalDayResult");
  });

  it("routes Create account to register mode from preview", () => {
    const flow = readSource("src/features/onboarding/components/intro-onboarding-flow.tsx");
    expect(flow).toContain('finishIntro("register")');
    expect(flow).toContain('"/login?mode=register"');
    expect(en.auth.intro.preview.createAccount).toBe("Create account");
  });

  it("routes Log in to login mode from preview", () => {
    const flow = readSource("src/features/onboarding/components/intro-onboarding-flow.tsx");
    expect(flow).toContain('finishIntro("login")');
    expect(flow).toMatch(/destination === "register" \? "\/login\?mode=register" : "\/login"/);
  });

  it("uses deterministic date-based glimpse notes", () => {
    const date = new Date(2026, 5, 13);
    const first = getFirstGlimpseNote("en", date);
    const second = getFirstGlimpseNote("en", date);
    expect(first).toBeTruthy();
    expect(first).toBe(second);
    expect(getFirstGlimpseNote("ru", date)).toBeTruthy();
  });
});

describe("Phase 18F — DOB gate and profile onboarding", () => {
  it("treats legacy profileComplete without DOB as incomplete", () => {
    expect(
      deriveProfileComplete({
        displayName: "Maria",
        dateOfBirth: null,
        language: "en",
      }),
    ).toBe(false);
  });

  it("shows profile onboarding for signed-in users on onboarding route", () => {
    const route = readSource("src/features/onboarding/components/onboarding-route.tsx");
    expect(route).toContain("OnboardingFlow");
    expect(route).toContain("IntroOnboardingGate");
    expect(route).toContain("signedIn");
  });

  it("redirects Today when DOB is missing", () => {
    const today = readSource("src/app/[locale]/today/page.tsx");
    expect(today).toContain("isProfileComplete");
    expect(today).toContain("getOnboardingRedirectPath");
  });

  it("includes DOB step after Name in profile onboarding", () => {
    const flow = readSource("src/features/onboarding/components/onboarding-flow.tsx");
    expect(flow).toContain("steps.name");
    expect(flow).toContain("steps.dob");
    expect(flow).toContain("DobInput");
    expect(flow).toMatch(/step === 0[\s\S]*onboarding-name/);
    expect(flow).toMatch(/step === 1[\s\S]*DobInput/);
  });

  it("shows numerology preview only on final profile step after DOB", () => {
    const flow = readSource("src/features/onboarding/components/onboarding-flow.tsx");
    expect(flow).toContain("OnboardingNumerologyPreview");
    expect(flow).toMatch(/step === 3[\s\S]*OnboardingNumerologyPreview/);
    const resolveStep = readSource(
      "src/features/onboarding/utils/resolve-onboarding-step.ts",
    );
    expect(resolveStep).toContain("onboardingDobSchema");
  });
});

describe("Phase 18F — auth handoff", () => {
  it("forces register to onboarding", () => {
    const screen = readSource("src/features/auth/components/auth-screen.tsx");
    expect(screen).toContain('pendingRedirectRef.current = "register"');
    expect(screen).toContain("redirectAfterAuth(true)");
  });

  it("routes login without DOB to onboarding via profile status", () => {
    const screen = readSource("src/features/auth/components/auth-screen.tsx");
    expect(screen).toContain("fetchProfileStatus");
    expect(screen).toContain('"/onboarding"');
  });

  it("routes complete profile to Today", () => {
    const screen = readSource("src/features/auth/components/auth-screen.tsx");
    expect(screen).toContain('? "/today"');
  });
});

describe("Phase 18F — redirect loop safety", () => {
  it("avoids redirect loops on onboarding", () => {
    const route = readSource("src/features/onboarding/components/onboarding-route.tsx");
    expect(route).toContain("completeRedirectRef");
    expect(route).toContain('pathname !== "/today"');
    const flow = readSource("src/features/onboarding/components/onboarding-flow.tsx");
    expect(flow).not.toMatch(/router\.replace\("\/onboarding"/);
  });

  it("avoids client redirect loops on Today", () => {
    const today = readSource("src/app/[locale]/today/page.tsx");
    expect(today).not.toContain("router.replace");
  });
});
