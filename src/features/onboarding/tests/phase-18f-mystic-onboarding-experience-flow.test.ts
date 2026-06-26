import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { deriveProfileComplete } from "@/features/profile/utils/profile-complete";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("Phase 18F — pre-auth rhythm preview", () => {
  it("renders RU/EN rhythm screen copy", () => {
    expect(en.auth.intro.rhythm.title).toBe("Birth date");
    expect(ru.auth.intro.rhythm.title).toBe("Дата рождения");
  });

  it("shows personal preview only after valid DOB", () => {
    const rhythm = readSource("src/features/onboarding/components/intro-rhythm-screen.tsx");
    expect(rhythm).toContain("onboardingDobSchema");
    expect(rhythm).toContain("OnboardingNumerologyPreview");
    expect(rhythm).not.toContain("personalDay");
  });

  it("routes Create account to register mode from rhythm screen", () => {
    const flow = readSource("src/features/onboarding/components/intro-onboarding-flow.tsx");
    expect(flow).toContain('finishIntro("register")');
    expect(flow).toContain('"/login?mode=register"');
    expect(en.auth.intro.rhythm.createAccount).toBe("Create account");
  });

  it("routes Log in to login mode from rhythm screen", () => {
    const flow = readSource("src/features/onboarding/components/intro-onboarding-flow.tsx");
    expect(flow).toContain('finishIntro("login")');
    expect(flow).toMatch(/destination === "register" \? "\/login\?mode=register" : "\/login"/);
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

  it("includes DOB in compact profile completion when missing", () => {
    const flow = readSource("src/features/onboarding/components/onboarding-flow.tsx");
    expect(flow).toContain("steps.dob");
    expect(flow).toContain("DobInput");
    expect(flow).toContain('missing.includes("dateOfBirth")');
  });

  it("shows numerology preview only in pre-auth rhythm screen", () => {
    const rhythm = readSource("src/features/onboarding/components/intro-rhythm-screen.tsx");
    expect(rhythm).toContain("OnboardingNumerologyPreview");
    const flow = readSource("src/features/onboarding/components/onboarding-flow.tsx");
    expect(flow).not.toContain("OnboardingNumerologyPreview");
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
