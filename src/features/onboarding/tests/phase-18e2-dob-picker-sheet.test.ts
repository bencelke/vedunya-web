import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  DEFAULT_WHEEL_YEAR,
  formatDisplayDate,
  getDefaultWheelParts,
  parseWheelValue,
  resolveWheelPickerValue,
} from "@/features/onboarding/utils/dob-wheel-picker-utils";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("Phase 18E.2 — closed field + picker sheet", () => {
  it("renders compact DOB field closed by default", () => {
    const input = readSource("src/features/onboarding/components/dob-input.tsx");
    expect(input).toContain("DobDateField");
    expect(input).toContain('useState(false)');
    expect(input).not.toContain('open={true}');
    const field = readSource("src/features/onboarding/components/dob-date-field.tsx");
    expect(field).toContain('data-testid="dob-date-field"');
    expect(field).toContain("ChevronDown");
  });

  it("opens picker sheet from field tap", () => {
    const input = readSource("src/features/onboarding/components/dob-input.tsx");
    expect(input).toContain("setSheetOpen(true)");
    expect(input).toContain("DobPickerSheet");
    const sheet = readSource("src/features/onboarding/components/dob-picker-sheet.tsx");
    expect(sheet).toContain('data-testid="dob-picker-sheet"');
    expect(sheet).toContain("DobWheelPicker");
  });

  it("shows Day / Month / Year wheels only inside the sheet", () => {
    const sheet = readSource("src/features/onboarding/components/dob-picker-sheet.tsx");
    expect(sheet).toContain("dob-picker-sheet-body");
    expect(sheet).toContain("DobWheelPicker");
    const input = readSource("src/features/onboarding/components/dob-input.tsx");
    expect(input).not.toContain("DobWheelPicker");
  });

  it("applies selected date on Done", () => {
    const sheet = readSource("src/features/onboarding/components/dob-picker-sheet.tsx");
    expect(sheet).toContain("handleDone");
    expect(sheet).toContain("resolveWheelPickerValue");
    expect(sheet).toContain("onDone(resolved");
  });

  it("discards draft changes on Cancel", () => {
    const input = readSource("src/features/onboarding/components/dob-input.tsx");
    expect(input).toContain("onCancel={() => setSheetOpen(false)}");
    const sheet = readSource("src/features/onboarding/components/dob-picker-sheet.tsx");
    expect(sheet).toContain("onCancel");
    expect(sheet).toContain("Escape");
  });
});

describe("Phase 18E.2 — formatted display + defaults", () => {
  it("formats selected EN date", () => {
    expect(formatDisplayDate("1984-07-20", "en")).toBe("July 20, 1984");
  });

  it("formats selected RU date", () => {
    expect(formatDisplayDate("1984-07-20", "ru")).toContain("20");
    expect(formatDisplayDate("1984-07-20", "ru")).toContain("1984");
    expect(formatDisplayDate("1984-07-20", "ru").toLowerCase()).toContain("июл");
  });

  it("defaults wheel year to 1990 instead of current year", () => {
    expect(DEFAULT_WHEEL_YEAR).toBe(1990);
    expect(getDefaultWheelParts().year).toBe(1990);
    expect(parseWheelValue("").year).toBe(1990);
  });

  it("blocks future dates", () => {
    const futureYear = new Date().getFullYear() + 1;
    expect(resolveWheelPickerValue(1, 1, futureYear)).toBeNull();
  });

  it("auto-adjusts invalid month/day combinations", () => {
    expect(resolveWheelPickerValue(31, 4, 1990)).toBe("1990-04-30");
    expect(resolveWheelPickerValue(31, 2, 2024)).toBe("2024-02-29");
  });
});

describe("Phase 18E.2 — preview and auth CTA gating", () => {
  it("shows preview only after valid DOB", () => {
    const rhythm = readSource("src/features/onboarding/components/intro-rhythm-screen.tsx");
    expect(rhythm).toContain("isValidDob");
    expect(rhythm).toContain("OnboardingNumerologyPreview");
    expect(rhythm).toContain("pickerHint");
  });

  it("keeps Create account / Log in disabled before DOB", () => {
    const rhythm = readSource("src/features/onboarding/components/intro-rhythm-screen.tsx");
    expect(rhythm).toContain("disabled={!isValidDob}");
  });

  it("preserves pre-auth DOB draft as YYYY-MM-DD", () => {
    const rhythm = readSource("src/features/onboarding/components/intro-rhythm-screen.tsx");
    expect(rhythm).toContain("writePreAuthOnboardingDraft");
    expect(rhythm).toContain("onboardingDobSchema");
  });
});

describe("Phase 18E.2 — copy and layout", () => {
  it("uses EN closed-field placeholder", () => {
    expect(en.auth.intro.rhythm.fieldPlaceholder).toBe("Select your birth date");
    expect(en.auth.intro.rhythm.sheetCancel).toBe("Cancel");
  });

  it("uses RU closed-field placeholder", () => {
    expect(ru.auth.intro.rhythm.fieldPlaceholder).toBe("Выберите дату рождения");
    expect(ru.auth.intro.rhythm.sheetCancel).toBe("Отмена");
  });

  it("does not expose always-visible wheel on initial screen", () => {
    const input = readSource("src/features/onboarding/components/dob-input.tsx");
    expect(input).not.toContain("<DobWheelPicker");
    const theme = readSource("src/styles/mystic-theme.css");
    expect(theme).toContain(".dob-picker-sheet-panel");
    expect(theme).toContain("min-width: 0");
  });
});
