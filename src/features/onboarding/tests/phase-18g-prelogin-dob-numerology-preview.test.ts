import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  combineIsoParts,
  daysInMonth,
  parseIsoParts,
} from "@/features/onboarding/utils/dob-input-utils";
import { dateOfBirthSchema } from "@/features/profile/schemas/onboarding-schema";
import { buildPersonalDayResult } from "@/features/numerology/services/personal-day-service";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("Phase 18G — signed-out DOB before login", () => {
  it("shows DOB page after first glimpse", () => {
    const flow = readSource("src/features/onboarding/components/intro-onboarding-flow.tsx");
    expect(flow).toContain("IntroFirstGlimpse");
    expect(flow).toContain("IntroPreAuthDob");
    expect(flow).toContain("IntroPreAuthNumerologyPreview");
    expect(flow).toContain("DOB_STEP");
    expect(flow).toContain("PREVIEW_STEP");
    expect(flow).toContain("INTRO_STEP_COUNT = INTRO_PAGE_COUNT + 3");
  });

  it("stores pre-auth DOB draft in sessionStorage", () => {
    const draft = readSource(
      "src/features/onboarding/services/preauth-onboarding-draft.ts",
    );
    expect(draft).toContain("vedunya_preauth_onboarding_draft");
    expect(draft).toContain("sessionStorage");
    expect(draft).not.toContain("localStorage");

    const dobStep = readSource("src/features/onboarding/components/intro-preauth-dob.tsx");
    expect(dobStep).toContain("writePreAuthOnboardingDraft");
  });

  it("renders RU/EN pre-auth DOB copy", () => {
    expect(en.auth.intro.dob.title).toBe("Date of birth");
    expect(en.auth.intro.dob.submit).toBe("Show my rhythm");
    expect(ru.auth.intro.dob.title).toBe("Дата рождения");
    expect(ru.auth.intro.dob.submit).toBe("Показать мой ритм");
  });
});

describe("Phase 18G — DOB picker", () => {
  it("outputs YYYY-MM-DD from select parts", () => {
    expect(combineIsoParts("15", "3", "1990")).toBe("1990-03-15");
    expect(parseIsoParts("1990-03-15")).toEqual({
      day: "15",
      month: "3",
      year: "1990",
    });
  });

  it("uses native select controls with overflow-safe layout", () => {
    const dob = readSource("src/features/onboarding/components/dob-input.tsx");
    expect(dob).toContain("<select");
    expect(dob).toContain("dob-picker-grid");
    expect(dob).toContain("min-w-0");
    expect(dob).toContain("grid-cols-3");
  });

  it("blocks invalid dates", () => {
    expect(dateOfBirthSchema.safeParse("2024-02-31").success).toBe(false);
    expect(dateOfBirthSchema.safeParse("1899-01-01").success).toBe(false);
  });

  it("blocks future dates", () => {
    const futureYear = new Date().getFullYear() + 1;
    expect(
      dateOfBirthSchema.safeParse(`${futureYear}-01-01`).success,
    ).toBe(false);
  });

  it("limits days by month", () => {
    expect(daysInMonth(2, 2024)).toBe(29);
    expect(daysInMonth(2, 2023)).toBe(28);
  });
});

describe("Phase 18G — pre-login numerology preview", () => {
  it("uses selected DOB for deterministic preview", () => {
    const preview = buildPersonalDayResult({
      birthDate: "1990-03-15",
      calculationDate: "2026-06-23",
      locale: "en",
    });
    expect(preview).toBeTruthy();
    expect(preview?.calculation.personalDayNumber).toBeGreaterThan(0);
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
    expect(en.auth.intro.preview.login).toBe("Log in");
  });

  it("keeps first glimpse non-personalized with Continue CTA", () => {
    const glimpse = readSource("src/features/onboarding/components/intro-first-glimpse.tsx");
    expect(glimpse).toContain("getFirstGlimpseNote");
    expect(glimpse).toContain("onContinue");
    expect(glimpse).not.toContain("onRegister");
  });
});

describe("Phase 18G — post-login profile handoff", () => {
  it("prefills signed-in onboarding from pre-auth DOB draft", () => {
    const flow = readSource("src/features/onboarding/components/onboarding-flow.tsx");
    expect(flow).toContain("readPreAuthOnboardingDraft");
    expect(flow).toContain("prefilledFromPreAuth");
    expect(flow).toContain("steps.dob.confirmNote");
    expect(flow).toContain("clearPreAuthOnboardingDraft");
  });

  it("does not overwrite existing profile DOB with draft", () => {
    const flow = readSource("src/features/onboarding/components/onboarding-flow.tsx");
    expect(flow).toMatch(
      /if \(initialProfile\?\.dateOfBirth\)[\s\S]*formatDateOfBirth\(initialProfile\.dateOfBirth\)/,
    );
  });
});

describe("Phase 18G — route protection", () => {
  it("redirects Today when DOB is missing", () => {
    const today = readSource("src/app/[locale]/today/page.tsx");
    expect(today).toContain("isProfileComplete");
    expect(today).toContain("getOnboardingRedirectPath");
  });

  it("routes signed-in incomplete users to profile onboarding", () => {
    const route = readSource("src/features/onboarding/components/onboarding-route.tsx");
    expect(route).toContain("OnboardingFlow");
    expect(route).toContain("IntroOnboardingGate");
  });

  it("avoids redirect loops on onboarding and today", () => {
    const route = readSource("src/features/onboarding/components/onboarding-route.tsx");
    expect(route).toContain('pathname !== "/today"');
    const today = readSource("src/app/[locale]/today/page.tsx");
    expect(today).not.toContain("router.replace");
  });
});
