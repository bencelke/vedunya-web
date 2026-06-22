import { describe, expect, it } from "vitest";

import { calculateMoonContext } from "@/features/moon/engine/calculate-moon-context";
import {
  calculateIlluminationPercent,
  calculateMoonAgeDays,
} from "@/features/moon/engine/calculate-moon-age";
import { calculateJulianDateUtc } from "@/features/moon/engine/calculate-julian-date";
import { calculateLunarDayClamped } from "@/features/moon/engine/calculate-lunar-day";
import { mapPhase8ToPhase4 } from "@/features/moon/engine/phase-asset-map";
import { resolvePhase8FromProgress } from "@/features/moon/engine/resolve-moon-phase";
import {
  REFERENCE_NEW_MOON_JD,
  SYNODIC_MONTH_DAYS,
} from "@/features/moon/constants";

/** Hardcoded from Flutter-equivalent synodic engine (generated once via scripts/generate-moon-fixtures.ts). */
const ENGINE_FIXTURES = [
  {
    iso: "2000-01-06T18:14:00.000Z",
    phase8Id: "new_moon",
    phaseId: "new_moon",
    lunarDay: 1,
    moonAgeDays: 0.159722,
    julianDate: 2451550.259722,
  },
  {
    iso: "2026-06-13T12:00:00.000Z",
    phase8Id: "new_moon",
    phaseId: "new_moon",
    lunarDay: 28,
    moonAgeDays: 27.928094,
    julianDate: 2461205,
  },
  {
    iso: "2026-01-01T00:00:00.000Z",
    phase8Id: "waxing_gibbous",
    phaseId: "waxing",
    lunarDay: 13,
    moonAgeDays: 12.081037,
    julianDate: 2461041.5,
  },
  {
    iso: "2024-02-29T12:00:00.000Z",
    phase8Id: "waning_gibbous",
    phaseId: "waning",
    lunarDay: 20,
    moonAgeDays: 19.784576,
    julianDate: 2460370,
  },
  {
    iso: "2026-03-29T01:00:00.000Z",
    phase8Id: "waxing_gibbous",
    phaseId: "waxing",
    lunarDay: 11,
    moonAgeDays: 10.530938,
    julianDate: 2461128.541667,
  },
  {
    iso: "1999-12-31T12:00:00.000Z",
    phase8Id: "last_quarter",
    phaseId: "waning",
    lunarDay: 24,
    moonAgeDays: 23.430589,
    julianDate: 2451544,
  },
  {
    iso: "2026-06-14T00:00:00.000Z",
    phase8Id: "new_moon",
    phaseId: "new_moon",
    lunarDay: 29,
    moonAgeDays: 28.428094,
  },
  {
    iso: "2026-07-01T12:00:00.000Z",
    phase8Id: "full_moon",
    phaseId: "full_moon",
    lunarDay: 17,
    moonAgeDays: 16.397505,
  },
  {
    iso: "2025-03-30T02:00:00.000Z",
    phase8Id: "new_moon",
    phaseId: "new_moon",
    lunarDay: 1,
    moonAgeDays: 0.939668,
  },
  {
    iso: "2024-01-01T00:00:00.000Z",
    phase8Id: "waning_gibbous",
    phaseId: "waning",
    lunarDay: 20,
    moonAgeDays: 19.345754,
  },
  {
    iso: "2016-02-29T12:00:00.000Z",
    phase8Id: "last_quarter",
    phaseId: "waning",
    lunarDay: 22,
    moonAgeDays: 21.312855,
  },
  {
    iso: "1970-01-01T00:00:00.000Z",
    phase8Id: "last_quarter",
    phaseId: "waning",
    lunarDay: 23,
    moonAgeDays: 22.778985,
  },
  {
    iso: "2026-06-14T23:59:00.000Z",
    phase8Id: "new_moon",
    phaseId: "new_moon",
    lunarDay: 30,
    moonAgeDays: 29.427399,
  },
  {
    iso: "2025-10-26T01:00:00.000Z",
    phase8Id: "waxing_crescent",
    phaseId: "waxing",
    lunarDay: 5,
    moonAgeDays: 4.183881,
  },
  {
    iso: "2030-12-31T12:00:00.000Z",
    phase8Id: "first_quarter",
    phaseId: "waxing",
    lunarDay: 7,
    moonAgeDays: 6.684539,
  },
  {
    iso: "2023-12-31T23:00:00.000Z",
    phase8Id: "waning_gibbous",
    phaseId: "waning",
    lunarDay: 20,
    moonAgeDays: 19.304087,
  },
] as const;

describe("moon engine parity fixtures", () => {
  it.each(ENGINE_FIXTURES)(
    "matches audited output for $iso",
    ({ iso, phase8Id, phaseId, lunarDay, moonAgeDays, julianDate }) => {
      const result = calculateMoonContext({
        calculationInstant: new Date(iso),
        timezone: "UTC",
      });

      expect(result.phase8Id).toBe(phase8Id);
      expect(result.phaseId).toBe(phaseId);
      expect(result.lunarDay).toBe(lunarDay);
      expect(result.moonAgeDays).toBeCloseTo(moonAgeDays, 4);
      if (julianDate !== undefined) {
        expect(result.julianDate).toBeCloseTo(julianDate, 4);
      }
    },
  );
});

describe("synodic constants", () => {
  it("uses audited Flutter constants", () => {
    expect(SYNODIC_MONTH_DAYS).toBe(29.53058867);
    expect(REFERENCE_NEW_MOON_JD).toBe(2451550.1);
  });
});

describe("Julian date conversion", () => {
  it("matches UTC millis formula", () => {
    const instant = new Date("2000-01-06T18:14:00.000Z");
    expect(calculateJulianDateUtc(instant)).toBeCloseTo(2451550.259722, 4);
  });
});

describe("deterministic repeatability", () => {
  it("returns identical output for repeated calls", () => {
    const input = {
      calculationInstant: new Date("2026-03-30T12:00:00.000Z"),
      timezone: "UTC",
    };
    expect(calculateMoonContext(input)).toEqual(calculateMoonContext(input));
  });
});

describe("invalid instant", () => {
  it("throws for invalid dates", () => {
    expect(() =>
      calculateMoonContext({
        calculationInstant: new Date("invalid"),
        timezone: "UTC",
      }),
    ).toThrow();
  });
});

describe("phase8 boundary mapping", () => {
  it("maps sector edges to canonical phase IDs", () => {
    expect(resolvePhase8FromProgress(0)).toBe("new_moon");
    expect(resolvePhase8FromProgress(0.06)).toBe("new_moon");
    expect(resolvePhase8FromProgress(0.0625)).toBe("waxing_crescent");
    expect(resolvePhase8FromProgress(0.5)).toBe("full_moon");
    expect(resolvePhase8FromProgress(0.75)).toBe("last_quarter");
    expect(resolvePhase8FromProgress(0.94)).toBe("new_moon");
    expect(mapPhase8ToPhase4("waxing_crescent")).toBe("waxing");
    expect(mapPhase8ToPhase4("last_quarter")).toBe("waning");
  });
});

describe("lunar day clamp parity", () => {
  it("clamps like Flutter LunarDayService", () => {
    expect(calculateLunarDayClamped(0)).toBe(1);
    expect(calculateLunarDayClamped(29.9)).toBe(30);
    expect(calculateLunarDayClamped(12.2)).toBe(13);
  });
});

describe("illumination", () => {
  it("peaks near full moon angle", () => {
    expect(calculateIlluminationPercent(180)).toBeCloseTo(100, 0);
    expect(calculateIlluminationPercent(0)).toBeCloseTo(0, 0);
  });
});

describe("moon age progression", () => {
  it("increases with later instants", () => {
    const earlier = calculateMoonAgeDays(new Date("2026-01-01T00:00:00.000Z"));
    const later = calculateMoonAgeDays(new Date("2026-01-15T00:00:00.000Z"));
    expect(later.moonAgeDays).toBeGreaterThan(earlier.moonAgeDays);
  });
});
