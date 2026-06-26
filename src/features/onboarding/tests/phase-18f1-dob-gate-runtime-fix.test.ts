import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { resolveProfileStatus } from "@/features/profile/utils/resolve-profile-status";
import type { ProfileSnapshot } from "@/features/profile/types/user-profile";

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

function profileFixture(
  overrides: Partial<ProfileSnapshot> = {},
): ProfileSnapshot {
  return {
    uid: "u1",
    displayName: "Maria",
    email: "maria@example.com",
    dateOfBirth: null,
    language: "en",
    profileComplete: false,
    authProviders: ["password"],
    publicProfile: {
      uid: "u1",
      displayName: "Maria",
      profileComplete: true,
    },
    privateProfile: {
      uid: "u1",
      profileComplete: true,
    },
    ...overrides,
  };
}

describe("Phase 18F1 — profile-status contract", () => {
  it("returns incomplete when displayName and language exist but DOB is missing", () => {
    const status = resolveProfileStatus(
      profileFixture({ dateOfBirth: null }),
      true,
    );

    expect(status.authenticated).toBe(true);
    expect(status.profileComplete).toBe(false);
    expect(status.missing).toContain("dob");
  });

  it("treats legacy users.profileComplete=true without user_private DOB as incomplete", () => {
    const status = resolveProfileStatus(
      profileFixture({
        dateOfBirth: null,
        profileComplete: true,
        publicProfile: {
          uid: "u1",
          displayName: "Maria",
          profileComplete: true,
        },
        privateProfile: {
          uid: "u1",
          profileComplete: true,
        },
      }),
      true,
    );

    expect(status.profileComplete).toBe(false);
    expect(status.missing).toEqual(["dob"]);
  });

  it("exposes safe booleans only in profile-status route", () => {
    const route = readSource("src/app/api/auth/profile-status/route.ts");
    const resolver = readSource("src/features/profile/utils/resolve-profile-status.ts");
    expect(route).toContain("resolveProfileStatus");
    expect(resolver).toContain("missing");
    expect(route).not.toContain("dateOfBirth");
    expect(route).not.toContain("email");
  });
});

describe("Phase 18F1 — post-login routing", () => {
  it("routes incomplete profile to onboarding after login", () => {
    const screen = readSource("src/features/auth/components/auth-screen.tsx");
    expect(screen).toContain("fetchProfileStatus");
    expect(screen).toContain('? "/today"');
    expect(screen).toContain(': "/onboarding"');
    expect(screen).toContain('pendingRedirectRef.current = "login"');
  });

  it("routes complete profile to Today after login", () => {
    const screen = readSource("src/features/auth/components/auth-screen.tsx");
    expect(screen).toContain("status.profileComplete");
  });

  it("forces register to onboarding", () => {
    const screen = readSource("src/features/auth/components/auth-screen.tsx");
    expect(screen).toContain('pendingRedirectRef.current = "register"');
    expect(screen).toContain("redirectAfterAuth(true)");
  });

  it("avoids redirect race before login handoff completes", () => {
    const screen = readSource("src/features/auth/components/auth-screen.tsx");
    expect(screen).toContain("hadUserOnMountRef");
    expect(screen).not.toMatch(
      /if \(pendingRedirectRef\.current === "login"\)[\s\S]*void redirectAfterAuth\(\);[\s\S]*void redirectAfterAuth\(\);/,
    );
  });
});

describe("Phase 18F1 — route protection and onboarding", () => {
  it("redirects incomplete profile from Today to onboarding", () => {
    const today = readSource("src/app/[locale]/today/page.tsx");
    expect(today).toContain("isProfileComplete");
    expect(today).toContain("getOnboardingRedirectPath");
  });

  it("shows profile onboarding for signed-in incomplete users", () => {
    const route = readSource("src/features/onboarding/components/onboarding-route.tsx");
    expect(route).toContain("OnboardingFlow");
    expect(route).toContain("IntroOnboardingGate");
    expect(route).toContain("signedIn");
  });

  it("reads DOB only from user_private in profile repository", () => {
    const repo = readSource("src/features/profile/services/profile-repository.ts");
    expect(repo).toContain("timestampToDate(privateData.dob)");
    expect(repo).not.toContain("timestampToDate(publicData.dob)");
  });

  it("includes DOB in compact profile completion when missing", () => {
    const flow = readSource("src/features/onboarding/components/onboarding-flow.tsx");
    expect(flow).toContain("DobInput");
    expect(flow).toContain('missing.includes("dateOfBirth")');
  });

  it("requires DOB before numerology preview in rhythm screen", () => {
    const rhythm = readSource("src/features/onboarding/components/intro-rhythm-screen.tsx");
    expect(rhythm).toContain("onboardingDobSchema");
    expect(rhythm).toContain("OnboardingNumerologyPreview");
  });
});

describe("Phase 18F1 — redirect loop safety", () => {
  it("avoids redirect loops on onboarding", () => {
    const route = readSource("src/features/onboarding/components/onboarding-route.tsx");
    expect(route).toContain("completeRedirectRef");
    expect(route).toContain('pathname !== "/today"');
  });

  it("avoids client redirect loops on Today", () => {
    const today = readSource("src/app/[locale]/today/page.tsx");
    expect(today).not.toContain("router.replace");
  });
});
