import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  dateOfBirthSchema,
  onboardingCompleteSchema,
} from "@/features/profile/schemas/onboarding-schema";
import {
  deriveProfileComplete,
  isProfileComplete,
} from "@/features/profile/utils/profile-complete";
import type { ProfileSnapshot } from "@/features/profile/types/user-profile";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";

const WEB_ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(resolve(WEB_ROOT, relativePath), "utf8");
}

describe("Phase 18B — profileComplete contract", () => {
  it("is false when DOB is missing", () => {
    expect(
      deriveProfileComplete({
        displayName: "Maria",
        dateOfBirth: null,
        language: "en",
      }),
    ).toBe(false);
  });

  it("is false when name is missing", () => {
    expect(
      deriveProfileComplete({
        displayName: "",
        dateOfBirth: new Date(1990, 2, 15),
        language: "en",
      }),
    ).toBe(false);
  });

  it("is false when language is missing", () => {
    expect(
      deriveProfileComplete({
        displayName: "Maria",
        dateOfBirth: new Date(1990, 2, 15),
        language: null,
      }),
    ).toBe(false);
  });

  it("is false for shell placeholder display names", () => {
    expect(
      deriveProfileComplete({
        displayName: "Mystic member",
        dateOfBirth: new Date(1990, 2, 15),
        language: "en",
      }),
    ).toBe(false);
  });

  it("is true with name, DOB, and language", () => {
    expect(
      deriveProfileComplete({
        displayName: "Maria",
        dateOfBirth: new Date(1990, 2, 15),
        language: "ru",
      }),
    ).toBe(true);
  });
});

describe("Phase 18B — auth handoff", () => {
  it("routes register success to onboarding", () => {
    const source = readSource("src/features/auth/components/auth-screen.tsx");
    expect(source).toContain("handleRegisterSuccess");
    expect(source).toContain("redirectAfterAuth(true)");
    expect(source).toContain("onSuccess={handleRegisterSuccess}");
  });

  it("routes login incomplete profile to onboarding", () => {
    const source = readSource("src/features/auth/components/auth-screen.tsx");
    expect(source).toContain('? "/today"');
    expect(source).toContain('"/onboarding"');
    expect(source).toContain("fetchProfileComplete");
  });

  it("routes login complete profile to Today", () => {
    const source = readSource("src/features/auth/components/auth-screen.tsx");
    expect(source).toContain("fetchProfileComplete");
    expect(source).toContain('? "/today"');
    expect(source).toContain('"/onboarding"');
  });
});

describe("Phase 18B — route protection", () => {
  it("redirects incomplete signed-in users from Today to onboarding", () => {
    const today = readSource("src/app/[locale]/today/page.tsx");
    expect(today).toContain("isProfileComplete");
    expect(today).toContain("getOnboardingRedirectPath");
    expect(today).not.toContain("router.replace");
  });

  it("redirects incomplete signed-in users from root to onboarding", () => {
    const root = readSource("src/app/[locale]/page.tsx");
    expect(root).toContain("isProfileComplete");
    expect(root).toContain("getOnboardingRedirectPath");
  });

  it("redirects complete users away from onboarding", () => {
    const onboarding = readSource("src/app/[locale]/onboarding/page.tsx");
    expect(onboarding).toContain("isProfileComplete");
    expect(onboarding).toContain("getTodayRedirectPath");
  });

  it("avoids client redirect loops on Today", () => {
    const today = readSource("src/app/[locale]/today/page.tsx");
    expect(today).not.toContain("router.replace");
  });

  it("avoids client redirect loops on onboarding flow", () => {
    const flow = readSource(
      "src/features/onboarding/components/onboarding-flow.tsx",
    );
    expect(flow).not.toMatch(/router\.replace\("\/onboarding"/);
  });
});

describe("Phase 18B — signed-in onboarding steps", () => {
  it("renders DOB step in signed-in onboarding", () => {
    const flow = readSource(
      "src/features/onboarding/components/onboarding-flow.tsx",
    );
    expect(flow).toContain("steps.dob");
    expect(flow).toContain("DobInput");
    expect(flow).not.toContain("defaultDateOfBirthString");
  });

  it("blocks invalid DOB values", () => {
    const futureYear = new Date().getFullYear() + 1;
    expect(dateOfBirthSchema.safeParse(`${futureYear}-01-01`).success).toBe(
      false,
    );
    expect(dateOfBirthSchema.safeParse("1899-12-31").success).toBe(false);
    expect(dateOfBirthSchema.safeParse("not-a-date").success).toBe(false);
  });

  it("allows valid DOB for numerology preview", () => {
    const parsed = onboardingCompleteSchema.safeParse({
      displayName: "Maria",
      dateOfBirth: "1990-03-15",
      language: "en",
    });
    expect(parsed.success).toBe(true);
  });

  it("uses numerology preview with DOB and locale", () => {
    const preview = readSource(
      "src/features/onboarding/components/onboarding-numerology-preview.tsx",
    );
    expect(preview).toContain("buildPersonalDayResult");
    expect(preview).toContain("birthDate: dateOfBirth");
    expect(preview).toContain("rhythmHeadline");
  });

  it("does not route to Today when profile save fails", () => {
    const flow = readSource(
      "src/features/onboarding/components/onboarding-flow.tsx",
    );
    expect(flow).toContain("await completeUserProfile");
    expect(flow).toMatch(/catch \{[\s\S]*setErrorKey\("saveFailed"\)/);
    expect(flow).toMatch(
      /await completeUserProfile[\s\S]*router\.replace\("\/today"/,
    );
  });
});

describe("Phase 18B — profile DOB display", () => {
  it("shows DOB missing CTA in profile personal details", () => {
    const source = readSource(
      "src/features/profile/components/profile-personal-details-section.tsx",
    );
    expect(source).toContain("missingBirthDate");
    expect(source).toContain('href="/onboarding"');
  });
});

describe("Phase 18B — profile-status API", () => {
  it("derives profileComplete from fields, not stale flags", () => {
    const source = readSource("src/app/api/auth/profile-status/route.ts");
    expect(source).toContain("isProfileComplete");
  });
});

describe("Phase 18B — RU/EN copy", () => {
  it("renders EN DOB and preview copy", () => {
    expect(en.auth.onboarding.steps.dob.title).toBe("Date of birth");
    expect(en.auth.onboarding.steps.dob.body).toContain(
      "personal numerology rhythm",
    );
    expect(en.auth.onboarding.steps.preview.rhythmHeadline).toContain(
      "{number}",
    );
    expect(en.profile.personalDetails.missingBirthDate).toContain(
      "numerology rhythm",
    );
  });

  it("renders RU DOB and preview copy", () => {
    expect(ru.auth.onboarding.steps.dob.title).toBe("Дата рождения");
    expect(ru.auth.onboarding.steps.dob.body).toContain("нумерологического ритма");
    expect(ru.auth.onboarding.steps.preview.rhythmHeadline).toContain(
      "{number}",
    );
    expect(ru.profile.personalDetails.missingBirthDate).toContain(
      "нумерологический ритм",
    );
  });
});

describe("Phase 18B — stale profile flags", () => {
  it("treats profileComplete flag without DOB as incomplete", () => {
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
