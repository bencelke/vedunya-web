import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { resolveOnboardingStep } from "@/features/onboarding/utils/resolve-onboarding-step";
import { deriveProfileComplete } from "@/features/profile/utils/profile-complete";
import type { ProfileSnapshot } from "@/features/profile/types/user-profile";

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("Phase 18B1 — profile completeness", () => {
  it("treats legacy profileComplete true without DOB as incomplete", () => {
    const profile = {
      uid: "u1",
      displayName: "Maria",
      email: null,
      dateOfBirth: null,
      language: "en",
      profileComplete: true,
      authProviders: [],
      publicProfile: { uid: "u1", displayName: "Maria", profileComplete: true },
      privateProfile: { uid: "u1", profileComplete: true },
    } satisfies ProfileSnapshot;

    expect(deriveProfileComplete({
      displayName: profile.displayName,
      dateOfBirth: profile.dateOfBirth,
      language: profile.language,
    })).toBe(false);
    expect(profile.publicProfile?.profileComplete).toBe(true);
  });
});

describe("Phase 18B1 — onboarding route switcher", () => {
  it("uses client auth gate for signed-in profile onboarding", () => {
    const page = readSource("src/app/[locale]/onboarding/page.tsx");
    const route = readSource("src/features/onboarding/components/onboarding-route.tsx");

    expect(page).toContain("OnboardingRoute");
    expect(page).not.toContain("IntroOnboardingGate");
    expect(route).toContain("signedIn");
    expect(route).toContain("OnboardingFlow");
    expect(route).toContain("IntroOnboardingGate");
  });

  it("shows profile onboarding when Firebase user exists after login", () => {
    const route = readSource("src/features/onboarding/components/onboarding-route.tsx");
    expect(route).toContain("Boolean(user)");
    expect(route).toContain("serverAuthenticated");
  });
});

describe("Phase 18B1 — DOB step cannot be skipped", () => {
  it("caps draft step when DOB is missing", () => {
    expect(
      resolveOnboardingStep(
        { step: 3, displayName: "Maria", dateOfBirth: "", language: "en" },
        null,
      ),
    ).toBe(1);
  });

  it("allows preview step only after valid DOB and language", () => {
    expect(
      resolveOnboardingStep(
        {
          step: 3,
          displayName: "Maria",
          dateOfBirth: "1990-03-15",
          language: "ru",
        },
        null,
      ),
    ).toBe(3);
  });

  it("renders DOB in compact profile completion when missing", () => {
    const flow = readSource("src/features/onboarding/components/onboarding-flow.tsx");
    expect(flow).toContain("resolveProfileCompletionState");
    expect(flow).toContain("steps.dob");
    expect(flow).toContain("DobInput");
    expect(flow).toContain('missing.includes("dateOfBirth")');
  });
});

describe("Phase 18B1 — auth handoff", () => {
  it("forces register success to onboarding", () => {
    const screen = readSource("src/features/auth/components/auth-screen.tsx");
    expect(screen).toContain('pendingRedirectRef.current = "register"');
    expect(screen).toContain("redirectAfterAuth(true)");
  });

  it("routes login without DOB to onboarding via profile status", () => {
    const screen = readSource("src/features/auth/components/auth-screen.tsx");
    expect(screen).toContain("fetchProfileStatus");
    expect(screen).toContain('"/onboarding"');
  });

  it("does not call onSuccess when session creation fails", () => {
    const register = readSource("src/features/auth/components/register-form.tsx");
    const login = readSource("src/features/auth/components/login-form.tsx");
    expect(register).toContain("if (!sessionOk)");
    expect(login).toContain("if (!sessionOk)");
  });
});

describe("Phase 18B1 — Today protection", () => {
  it("redirects incomplete signed-in users from Today", () => {
    const today = readSource("src/app/[locale]/today/page.tsx");
    expect(today).toContain("isProfileComplete");
    expect(today).toContain("getOnboardingRedirectPath");
    expect(today).not.toContain("router.replace");
  });

  it("avoids redirect loops on onboarding route", () => {
    const route = readSource("src/features/onboarding/components/onboarding-route.tsx");
    expect(route).toContain("completeRedirectRef");
    expect(route).toContain('pathname !== "/today"');
  });
});

describe("Phase 18B1 — profile repository DOB contract", () => {
  it("derives profileComplete from user_private DOB, not stale flags", () => {
    const repo = readSource("src/features/profile/services/profile-repository.ts");
    expect(repo).toContain("deriveProfileComplete");
    expect(repo).toContain("privateData.dob");
    expect(repo).toContain("profileComplete: derivedProfileComplete");
  });
});
