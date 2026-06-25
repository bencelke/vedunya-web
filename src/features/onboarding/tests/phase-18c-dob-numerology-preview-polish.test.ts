import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  mapOnboardingZodIssue,
} from "@/features/onboarding/utils/onboarding-error-map";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";

const WEB_ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(resolve(WEB_ROOT, relativePath), "utf8");
}

describe("Phase 18C — Name screen polish", () => {
  it("renders polished RU/EN name copy", () => {
    expect(en.auth.onboarding.steps.name.body).toContain("daily practice");
    expect(en.auth.onboarding.steps.name.placeholder).toBe("Your name");
    expect(ru.auth.onboarding.steps.name.body).toContain("ежедневной практике");
    expect(ru.auth.onboarding.steps.name.placeholder).toBe("Ваше имя");
  });

  it("trims name before validation in flow", () => {
    const flow = readSource("src/features/onboarding/components/onboarding-flow.tsx");
    expect(flow).toContain("displayName.trim()");
  });
});

describe("Phase 18C — DOB screen polish", () => {
  it("renders polished RU/EN DOB copy", () => {
    expect(en.auth.onboarding.steps.dob.title).toBe("Date of birth");
    expect(en.auth.onboarding.steps.dob.body).toContain("numerology rhythm");
    expect(en.auth.onboarding.steps.dob.reassurance).toContain("not public");
    expect(ru.auth.onboarding.steps.dob.title).toBe("Дата рождения");
    expect(ru.auth.onboarding.steps.dob.reassurance).toContain("не публикуется");
    expect(ru.auth.onboarding.steps.dob.dayLabel).toBe("День");
    expect(en.auth.onboarding.steps.dob.dayLabel).toBe("Day");
  });

  it("uses three native select DOB controls for mobile reliability", () => {
    const dob = readSource("src/features/onboarding/components/dob-input.tsx");
    expect(dob).toContain("dayLabel");
    expect(dob).toContain("monthLabel");
    expect(dob).toContain("yearLabel");
    expect(dob).toContain("<select");
    expect(dob).toContain("dob-picker-grid");
  });

  it("maps DOB validation to friendly errors", () => {
    expect(mapOnboardingZodIssue({ message: "dobInvalid", code: "custom", path: [] })).toBe(
      "dobInvalid",
    );
    expect(en.auth.onboarding.errors.dobInvalid).toContain("valid birth date");
    expect(ru.auth.onboarding.errors.dobInvalid).toContain("корректную дату рождения");
  });
});

describe("Phase 18C — Language screen polish", () => {
  it("renders language options and selected state", () => {
    const picker = readSource(
      "src/features/onboarding/components/onboarding-language-picker.tsx",
    );
    expect(picker).toContain("OnboardingLanguagePicker");
    expect(picker).toContain("Check");
    expect(picker).toContain("aria-pressed");

    expect(en.auth.onboarding.steps.language.title).toBe("Practice language");
    expect(ru.auth.onboarding.steps.language.title).toBe("Язык практики");
    expect(en.auth.onboarding.steps.language.russian).toBe("Русский");
  });
});

describe("Phase 18C — Numerology preview polish", () => {
  it("renders number badge, title, and focus card", () => {
    const preview = readSource(
      "src/features/onboarding/components/onboarding-numerology-preview.tsx",
    );
    expect(preview).toContain("buildPersonalDayResult");
    expect(preview).toContain("rounded-full");
    expect(preview).toContain("rhythmHeadline");
    expect(preview).toContain("focusLabel");
    expect(preview).toContain("doAdvice");
  });

  it("uses existing numerology content service", () => {
    const preview = readSource(
      "src/features/onboarding/components/onboarding-numerology-preview.tsx",
    );
    expect(preview).not.toContain("placeholder");
    expect(preview).not.toContain("prediction");
    expect(preview).toContain("preview.content.summary");
  });
});

describe("Phase 18C — loading and error states", () => {
  it("renders saving state copy", () => {
    expect(en.auth.onboarding.saving).toBe("Saving…");
    expect(ru.auth.onboarding.saving).toBe("Сохраняем…");
  });

  it("renders friendly save failure copy", () => {
    const flow = readSource("src/features/onboarding/components/onboarding-flow.tsx");
    expect(flow).toContain('setErrorKey("saveFailed")');
    expect(en.auth.onboarding.errors.saveFailed).toContain("connection");
    expect(ru.auth.onboarding.errors.saveFailed).toContain("соединение");
  });

  it("does not expose raw Firebase errors", () => {
    const error = readSource(
      "src/features/onboarding/components/onboarding-error-message.tsx",
    );
    expect(error).not.toContain("Firebase");
    expect(error).not.toContain("auth/");
  });
});

describe("Phase 18C — shell and routing", () => {
  it("uses premium profile onboarding shell", () => {
    const shell = readSource("src/features/onboarding/components/onboarding-shell.tsx");
    const flow = readSource("src/features/onboarding/components/onboarding-flow.tsx");
    expect(shell).toContain('variant === "profile"');
    expect(flow).toContain('variant="profile"');
    expect(shell).toContain("mystic-profile-onboarding-panel");
    expect(flow).toContain("MysticLogo");
    expect(flow).toContain("brandWordmark");
  });

  it("routes to Today after successful save", () => {
    const flow = readSource("src/features/onboarding/components/onboarding-flow.tsx");
    expect(flow).toContain('router.replace("/today"');
    expect(en.auth.onboarding.finish).toContain("guidance");
    expect(ru.auth.onboarding.finish).toContain("подсказке");
  });

  it("avoids redirect loops on onboarding and today", () => {
    const flow = readSource("src/features/onboarding/components/onboarding-flow.tsx");
    const today = readSource("src/app/[locale]/today/page.tsx");
    expect(flow).not.toMatch(/router\.replace\("\/onboarding"/);
    expect(today).not.toContain("router.replace");
  });
});
