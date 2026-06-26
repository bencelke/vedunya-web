import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  clampDayForMonth,
  getMonthLabels,
  MONTH_LABELS_EN,
  MONTH_LABELS_RU,
  resolveWheelPickerValue,
} from "@/features/onboarding/utils/dob-wheel-picker-utils";
import { dateOfBirthSchema } from "@/features/profile/schemas/onboarding-schema";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("Phase 18E.1 — wheel picker component", () => {
  it("renders day/month/year wheel columns", () => {
    const picker = readSource("src/features/onboarding/components/dob-wheel-picker.tsx");
    expect(picker).toContain("dob-wheel-grid");
    expect(picker).toContain("dob-wheel-column");
    expect(picker).toContain("dob-wheel-item");
    expect(picker).toContain('role="listbox"');
    expect(picker).toContain("dob-wheel-column-scroll");
  });

  it("outputs YYYY-MM-DD for valid selections", () => {
    expect(resolveWheelPickerValue(15, 3, 1990)).toBe("1990-03-15");
    expect(resolveWheelPickerValue(1, 1, 2000)).toBe("2000-01-01");
  });

  it("renders localized EN month labels", () => {
    expect(getMonthLabels("en")).toEqual(MONTH_LABELS_EN);
    expect(MONTH_LABELS_EN[6]).toBe("Jul");
  });

  it("renders localized RU month labels", () => {
    expect(getMonthLabels("ru")).toEqual(MONTH_LABELS_RU);
    expect(MONTH_LABELS_RU[6]).toBe("Июл");
  });

  it("auto-adjusts invalid day/month combinations", () => {
    expect(resolveWheelPickerValue(31, 2, 2024)).toBe("2024-02-29");
    expect(resolveWheelPickerValue(1, 1, 1899)).toBeNull();
    expect(dateOfBirthSchema.safeParse("2024-02-31").success).toBe(false);
  });

  it("blocks future dates", () => {
    const futureYear = new Date().getFullYear() + 1;
    expect(resolveWheelPickerValue(1, 1, futureYear)).toBeNull();
  });

  it("handles leap year day clamping", () => {
    expect(clampDayForMonth(31, 2, 2024)).toBe(29);
    expect(resolveWheelPickerValue(29, 2, 2024)).toBe("2024-02-29");
    expect(clampDayForMonth(31, 2, 2023)).toBe(28);
    expect(resolveWheelPickerValue(28, 2, 2023)).toBe("2023-02-28");
  });
});

describe("Phase 18E.1 — DOB integration", () => {
  it("uses tap-to-open picker on pre-auth rhythm screen", () => {
    const rhythm = readSource("src/features/onboarding/components/intro-rhythm-screen.tsx");
    expect(rhythm).toContain("DobInput");
    const dob = readSource("src/features/onboarding/components/dob-input.tsx");
    expect(dob).toContain("DobDateField");
    expect(dob).toContain("DobPickerSheet");
    expect(dob).not.toContain("<select");
  });

  it("uses tap-to-open picker on signed-in compact onboarding", () => {
    const flow = readSource("src/features/onboarding/components/onboarding-flow.tsx");
    expect(flow).toContain("DobInput");
    const dob = readSource("src/features/onboarding/components/dob-input.tsx");
    expect(dob).toContain("DobPickerSheet");
  });

  it("does not use plain select layout in active DOB input", () => {
    const dob = readSource("src/features/onboarding/components/dob-input.tsx");
    expect(dob).not.toContain("<select");
    expect(dob).not.toContain("DobPickerFields");
  });

  it("keeps overflow-safe wheel grid styles", () => {
    const theme = readSource("src/styles/mystic-theme.css");
    expect(theme).toContain(".dob-wheel-grid");
    expect(theme).toContain("grid-template-columns: repeat(3, minmax(0, 1fr))");
    expect(theme).toContain("min-width: 0");
    expect(theme).toContain("scroll-snap-type: y mandatory");
  });
});

describe("Phase 18E.1 — picker copy", () => {
  it("uses concise EN birth date copy", () => {
    expect(en.auth.intro.rhythm.title).toBe("Birth date");
    expect(en.auth.intro.rhythm.body).toContain("personal rhythm");
    expect(en.auth.intro.rhythm.reassurance).toContain(
      "until you create an account or log in",
    );
  });

  it("uses concise RU birth date copy", () => {
    expect(ru.auth.intro.rhythm.title).toBe("Дата рождения");
    expect(ru.auth.intro.rhythm.body).toContain("личный ритм дня");
    expect(ru.auth.intro.rhythm.reassurance).toContain("до входа или создания аккаунта");
  });
});
