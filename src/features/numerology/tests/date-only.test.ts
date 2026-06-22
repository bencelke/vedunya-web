import { describe, expect, it, vi } from "vitest";

import {
  dateOnlyFromLocalDate,
  dateOnlyFromUtcTimestamp,
  formatIsoDateOnly,
  getTodayDateKeyInTimeZone,
  parseIsoDateOnly,
  resolveTimeZone,
} from "@/features/numerology/engine/date-only";

describe("parseIsoDateOnly", () => {
  it("preserves calendar parts without timezone shift", () => {
    expect(parseIsoDateOnly("1990-03-15")).toEqual({
      year: 1990,
      month: 3,
      day: 15,
    });
  });

  it("accepts leap day dates", () => {
    expect(parseIsoDateOnly("2000-02-29")).toEqual({
      year: 2000,
      month: 2,
      day: 29,
    });
  });

  it("rejects invalid calendar dates", () => {
    expect(() => parseIsoDateOnly("2026-02-30")).toThrow();
  });
});

describe("dateOnlyFromUtcTimestamp", () => {
  it("reads UTC date parts without local offset drift", () => {
    const parts = dateOnlyFromUtcTimestamp(Date.UTC(1990, 2, 15) / 1000);
    expect(parts).toEqual({ year: 1990, month: 3, day: 15 });
  });
});

describe("dateOnlyFromLocalDate", () => {
  it("uses local calendar fields from a Date object", () => {
    const local = new Date(2026, 5, 13);
    expect(dateOnlyFromLocalDate(local)).toEqual({
      year: 2026,
      month: 6,
      day: 13,
    });
  });
});

describe("getTodayDateKeyInTimeZone", () => {
  it("returns a stable ISO key for a fixed instant in UTC", () => {
    vi.useFakeTimers();
    vi.setSystemTime(Date.UTC(2026, 5, 13, 23, 30, 0));

    try {
      expect(getTodayDateKeyInTimeZone("UTC")).toBe("2026-06-13");
      expect(getTodayDateKeyInTimeZone("Pacific/Kiritimati")).toBe("2026-06-14");
      expect(getTodayDateKeyInTimeZone("Pacific/Midway")).toBe("2026-06-13");
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("resolveTimeZone", () => {
  it("falls back when cookie timezone is invalid", () => {
    expect(resolveTimeZone("Not/A_Timezone", "UTC")).toBe("UTC");
    expect(resolveTimeZone("Europe/Moscow", "UTC")).toBe("Europe/Moscow");
  });
});

describe("formatIsoDateOnly round trip", () => {
  it("formats parsed values back to ISO", () => {
    const parts = parseIsoDateOnly("2026-12-31");
    expect(formatIsoDateOnly(parts)).toBe("2026-12-31");
  });
});
