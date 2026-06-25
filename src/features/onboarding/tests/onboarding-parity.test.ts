import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { shouldShowBottomNav } from "@/config/navigation";
import {
  formatDateOfBirth,
  parseDateOfBirth,
} from "@/features/profile/schemas/onboarding-schema";
import { sanitizePublicProfilePatch } from "@/features/profile/utils/profile-merge";
import {
  mapOnboardingZodIssue,
} from "@/features/onboarding/utils/onboarding-error-map";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";

const WEB_ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(resolve(WEB_ROOT, relativePath), "utf8");
}

describe("Onboarding UI parity — shell and navigation", () => {
  it("renders branded Mystic onboarding shell", () => {
    const flow = readSource(
      "src/features/onboarding/components/onboarding-flow.tsx",
    );
    const shell = readSource(
      "src/features/onboarding/components/onboarding-shell.tsx",
    );
    expect(flow).toContain("OnboardingShell");
    expect(shell).toContain("mystic-auth-page");
  });

  it("does not show bottom navigation on onboarding route", () => {
    expect(shouldShowBottomNav("/onboarding")).toBe(false);
  });

  it("uses Flutter-style progress dots", () => {
    const source = readSource(
      "src/features/onboarding/components/onboarding-progress.tsx",
    );
    expect(source).toContain("OnboardingProgress");
    expect(source).toContain('role="progressbar"');
  });
});

describe("Onboarding flow steps", () => {
  it("implements four-step name → preview flow for signed-in users", () => {
    const source = readSource(
      "src/features/onboarding/components/onboarding-flow.tsx",
    );
    expect(source).toContain("STEP_COUNT = 4");
    expect(source).toContain("steps.name");
    expect(source).toContain("steps.dob");
    expect(source).toContain("steps.language");
    expect(source).toContain("steps.preview");
    expect(source).toContain("OnboardingNumerologyPreview");
    expect(source).not.toContain("steps.welcome");
    expect(source).not.toContain("OnboardingReview");
  });

  it("validates name on step 1", () => {
    expect(mapOnboardingZodIssue({ message: "nameRequired", code: "custom", path: [] })).toBe(
      "nameRequired",
    );
  });

  it("validates DOB with friendly error keys", () => {
    expect(mapOnboardingZodIssue({ message: "dobFuture", code: "custom", path: [] })).toBe(
      "dobFuture",
    );
    expect(mapOnboardingZodIssue({ message: "dobInvalid", code: "custom", path: [] })).toBe(
      "dobInvalid",
    );
  });

  it("renders EN/RU language choices", () => {
    const source = readSource(
      "src/features/onboarding/components/onboarding-flow.tsx",
    );
    expect(source).toContain('"en"');
    expect(source).toContain('"ru"');
    expect(source).toContain("steps.language.english");
    expect(source).toContain("steps.language.russian");
  });
});

describe("Onboarding DOB handling", () => {
  it("round-trips ISO date strings without calendar drift", () => {
    const iso = "1990-03-15";
    const parsed = parseDateOfBirth(iso);
    expect(formatDateOfBirth(parsed)).toBe(iso);
    expect(parsed.getFullYear()).toBe(1990);
    expect(parsed.getMonth()).toBe(2);
    expect(parsed.getDate()).toBe(15);
  });

  it("uses date-only parts in DobInput constraints", () => {
    const source = readSource("src/features/onboarding/components/dob-input.tsx");
    expect(source).toContain('type="date"');
    expect(source).toContain('min="1900-01-01"');
    expect(source).toContain("max={maxDate}");
  });

  it("persists draft in session storage for refresh resilience", () => {
    const source = readSource(
      "src/features/onboarding/utils/onboarding-draft.ts",
    );
    expect(source).toContain("sessionStorage");
    expect(source).toContain("vedunya_onboarding_draft_v1");
  });
});

describe("Onboarding profile completion contract", () => {
  it("uses merge-safe completeUserProfile with sanitizePublicProfilePatch", () => {
    const source = readSource(
      "src/features/profile/services/profile-bootstrap-service.ts",
    );
    expect(source).toContain("sanitizePublicProfilePatch");
    expect(source).toContain("merge: true");
    expect(source).toContain("profileComplete: true");
    expect(source).toContain("Timestamp.fromDate(parsed)");
  });

  it("does not expose premium/admin fields in onboarding UI", () => {
    const source = readSource(
      "src/features/onboarding/components/onboarding-flow.tsx",
    );
    expect(source).not.toContain("isPremium");
    expect(source).not.toContain("isAdmin");
    expect(source).not.toContain("premiumOverride");
    expect(source).not.toContain("isOwner");
  });

  it("preserves protected public fields during sanitize", () => {
    const sanitized = sanitizePublicProfilePatch({
      displayName: "Maria",
      language: "en",
      profileComplete: true,
      isPremium: true,
      isAdmin: true,
      premiumOverride: true,
      role: "admin",
    });

    expect(sanitized.displayName).toBe("Maria");
    expect(sanitized.profileComplete).toBe(true);
    expect(sanitized.isPremium).toBeUndefined();
    expect(sanitized.isAdmin).toBeUndefined();
    expect(sanitized.premiumOverride).toBeUndefined();
    expect(sanitized.role).toBeUndefined();
  });

  it("redirects to Today after completion", () => {
    const source = readSource(
      "src/features/onboarding/components/onboarding-flow.tsx",
    );
    expect(source).toContain('router.replace("/today"');
    expect(source).toContain("completeUserProfile");
  });

  it("redirects completed users away from onboarding page", () => {
    const source = readSource("src/lib/auth/require-user.ts");
    expect(source).toContain("requireIncompleteProfile");
    expect(source).toContain("getTodayRedirectPath");
  });
});

describe("Onboarding localization", () => {
  it("includes polished EN onboarding copy", () => {
    expect(en.auth.onboarding.steps.name.title).toContain("call you");
    expect(en.auth.onboarding.steps.dob.title).toBe("Date of birth");
    expect(en.auth.onboarding.steps.dob.body).toContain("numerology rhythm");
    expect(en.auth.onboarding.steps.preview.rhythmHeadline).toContain("{number}");
    expect(en.auth.onboarding.errors.nameRequired).toBeTruthy();
  });

  it("includes polished RU onboarding copy", () => {
    expect(ru.auth.onboarding.steps.name.title).toContain("обращаться");
    expect(ru.auth.onboarding.steps.dob.title).toBe("Дата рождения");
    expect(ru.auth.onboarding.steps.dob.body).toContain("нумерологического ритма");
    expect(ru.auth.onboarding.steps.preview.rhythmHeadline).toContain("{number}");
    expect(ru.auth.onboarding.errors.dobFuture).toBeTruthy();
  });
});
