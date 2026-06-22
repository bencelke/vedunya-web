import { describe, expect, it } from "vitest";

import { resolveTodayRuneContent } from "@/features/runes/content/today-rune-content";
import { buildDailyRuneResult } from "@/features/runes/services/daily-rune-service";
import { selectDailyRune } from "@/features/runes/engine/select-daily-rune";

describe("rune determinism", () => {
  it("returns the same selection for repeated calls", () => {
    const input = {
      personalDayNumber: 2,
      forDate: { year: 2026, month: 6, day: 13 },
      locale: "en" as const,
    };
    expect(selectDailyRune(input)).toEqual(selectDailyRune(input));
    expect(buildDailyRuneResult(input)).toEqual(buildDailyRuneResult(input));
  });

  it("does not change selection when locale changes", () => {
    const base = {
      personalDayNumber: 7,
      forDate: { year: 2026, month: 6, day: 13 },
    };
    expect(selectDailyRune({ ...base, locale: "en" }).runeId).toBe(
      selectDailyRune({ ...base, locale: "ru" }).runeId,
    );
  });

  it("selects deterministic content variants by day of month", () => {
    const day13 = resolveTodayRuneContent("fehu", "en", 13);
    const day14 = resolveTodayRuneContent("fehu", "en", 14);
    expect(day13?.summary).toBeTruthy();
    expect(day14?.summary).toBeTruthy();
    expect(day13).toEqual(resolveTodayRuneContent("fehu", "en", 13));
  });
});
