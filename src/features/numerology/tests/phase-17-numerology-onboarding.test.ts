import { describe, expect, it } from "vitest";

import {
  buildNumerologyReading,
  lifePathFromIsoDate,
  sujokPersonalDayFromIsoDates,
} from "@/features/numerology/services/numerology-engine";
import { getPersonalDayMeaning, numerologyMeanings } from "@/features/numerology/services/numerology-content";
import { calculatePersonalDay } from "@/features/numerology/engine/calculate-personal-day";
import {
  deriveProfileComplete,
  isProfileComplete,
} from "@/features/profile/utils/profile-complete";
import type { ProfileSnapshot } from "@/features/profile/types/user-profile";

describe("Phase 17 — profile completion contract", () => {
  it("is false when DOB is missing", () => {
    expect(
      deriveProfileComplete({
        displayName: "Maria",
        dateOfBirth: null,
        language: "en",
      }),
    ).toBe(false);
  });

  it("is true when name, DOB, and language exist", () => {
    expect(
      deriveProfileComplete({
        displayName: "Maria",
        dateOfBirth: new Date(1990, 2, 15),
        language: "ru",
      }),
    ).toBe(true);
  });

  it("ignores stale Firestore profileComplete flags without fields", () => {
    const profile = {
      uid: "u1",
      displayName: "Maria",
      email: null,
      dateOfBirth: null,
      language: "en",
      profileComplete: true,
      authProviders: [],
      publicProfile: null,
      privateProfile: null,
    } satisfies ProfileSnapshot;

    expect(isProfileComplete(profile)).toBe(false);
  });
});

describe("Phase 17 — numerology engine parity", () => {
  it("matches Sujok personal day fixtures used on Today", () => {
    expect(
      sujokPersonalDayFromIsoDates("1990-03-15", "2026-06-13"),
    ).toBe(
      calculatePersonalDay({
        birthDate: "1990-03-15",
        calculationDate: "2026-06-13",
        locale: "en",
      }).personalDayNumber,
    );
  });

  it("computes deterministic life path from DOB", () => {
    expect(lifePathFromIsoDate("1990-05-15")).toBe(
      buildNumerologyReading("1990-05-15", "2026-06-13").lifePath,
    );
  });
});

describe("Phase 17 — numerology content RU/EN", () => {
  it("includes personal day copy for digits 1–9 in both locales", () => {
    for (const digit of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
      expect(numerologyMeanings.en.personalDay[digit]?.title).toBeTruthy();
      expect(numerologyMeanings.ru.personalDay[digit]?.title).toBeTruthy();
      expect(getPersonalDayMeaning("en", digit)?.onboardingPreview).toBeTruthy();
      expect(getPersonalDayMeaning("ru", digit)?.onboardingPreview).toBeTruthy();
    }
  });
});

describe("Phase 17 — signed-in onboarding flow", () => {
  it("renders DOB step and numerology preview", async () => {
    const { readFileSync } = await import("node:fs");
    const { resolve } = await import("node:path");
    const flow = readFileSync(
      resolve(process.cwd(), "src/features/onboarding/components/onboarding-flow.tsx"),
      "utf8",
    );

    expect(flow).toContain("compact.title");
    expect(flow).toContain("DobInput");
    expect(flow).toContain("resolveProfileCompletionState");
    expect(flow).not.toContain("steps.welcome");
    expect(flow).not.toContain("OnboardingReview");
  });

  it("redirects incomplete signed-in users from Today to onboarding", async () => {
    const { readFileSync } = await import("node:fs");
    const { resolve } = await import("node:path");
    const today = readFileSync(
      resolve(process.cwd(), "src/app/[locale]/today/page.tsx"),
      "utf8",
    );

    expect(today).toContain("isProfileComplete");
    expect(today).toContain("getOnboardingRedirectPath");
  });
});
