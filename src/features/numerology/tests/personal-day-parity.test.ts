import { describe, expect, it } from "vitest";

import { calculatePersonalDay } from "@/features/numerology/engine/calculate-personal-day";
import {
  buildContentKey,
  buildDeterministicSeedParts,
  selectDeterministicVariantIndex,
} from "@/features/numerology/engine/deterministic-variant";
import { reduceToSingleDigit } from "@/features/numerology/engine/reduce-to-single-digit";
import { resolvePersonalDayContent } from "@/features/numerology/content/personal-day-content";
import { buildPersonalDayResult } from "@/features/numerology/services/personal-day-service";

const SUJOK_FIXTURES = [
  { dob: "1990-03-15", date: "2026-06-13", expected: 2, raw: 2063 },
  { dob: "1985-11-29", date: "2026-01-01", expected: 7, raw: 2068 },
  { dob: "1977-07-07", date: "2026-06-13", expected: 7, raw: 2059 },
  { dob: "2000-02-29", date: "2026-03-01", expected: 9, raw: 2061 },
  { dob: "1999-12-31", date: "2026-12-31", expected: 6, raw: 2112 },
  { dob: "1988-08-08", date: "2026-08-08", expected: 6, raw: 2058 },
  { dob: "1995-05-05", date: "2026-05-05", expected: 3, raw: 2046 },
  { dob: "1992-02-02", date: "2026-02-02", expected: 9, raw: 2034 },
  { dob: "1980-01-01", date: "2026-01-01", expected: 5, raw: 2030 },
  { dob: "2005-09-09", date: "2026-09-09", expected: 1, raw: 2062 },
  { dob: "1993-06-06", date: "2026-06-06", expected: 7, raw: 2050 },
  { dob: "1970-04-04", date: "2026-04-04", expected: 8, raw: 2042 },
] as const;

describe("Sujok personal day parity fixtures", () => {
  it.each(SUJOK_FIXTURES)(
    "matches Flutter for DOB $dob on $date",
    ({ dob, date, expected, raw }) => {
      const result = calculatePersonalDay({
        birthDate: dob,
        calculationDate: date,
        locale: "en",
      });

      expect(result.rawValue).toBe(raw);
      expect(result.personalDayNumber).toBe(expected);
    },
  );
});

describe("reduceToSingleDigit", () => {
  it("reduces large totals and preserves zero-to-one rule", () => {
    expect(reduceToSingleDigit(2063)).toBe(2);
    expect(reduceToSingleDigit(0)).toBe(1);
    expect(reduceToSingleDigit(-18)).toBe(9);
  });

  it("covers every result from 1 through 9", () => {
    const seen = new Set<number>();
    for (let value = 1; value <= 5000; value += 1) {
      seen.add(reduceToSingleDigit(value));
    }
    expect([...seen].sort()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
});

describe("deterministic content selection", () => {
  it("returns stable EN content for repeated calls", () => {
    const first = resolvePersonalDayContent({
      personalDayNumber: 2,
      locale: "en",
      dateKey: "2026-06-13",
      userSeed: "user-abc",
    });
    const second = resolvePersonalDayContent({
      personalDayNumber: 2,
      locale: "en",
      dateKey: "2026-06-13",
      userSeed: "user-abc",
    });

    expect(first?.content).toEqual(second?.content);
    expect(first?.contentKey).toBe("personal-day:2:en");
  });

  it("returns stable RU content for repeated calls", () => {
    const result = resolvePersonalDayContent({
      personalDayNumber: 5,
      locale: "ru",
      dateKey: "2026-06-13",
    });

    expect(result?.content.title).toBe("Изменение");
    expect(buildContentKey(5, "ru")).toBe("personal-day:5:ru");
  });

  it("uses index zero because Flutter dataset has single variants", () => {
    const seed = buildDeterministicSeedParts({
      dateKey: "2026-06-13",
      personalDayNumber: 3,
      locale: "en",
      userSeed: "seed",
    });

    expect(selectDeterministicVariantIndex("summary", 1, seed)).toBe(0);
  });
});

describe("personal day service stability", () => {
  it("returns the same result for identical inputs", () => {
    const input = {
      birthDate: "1990-03-15",
      calculationDate: "2026-06-13",
      locale: "en" as const,
    };

    expect(buildPersonalDayResult(input)).toEqual(buildPersonalDayResult(input));
  });

  it("returns null for invalid DOB", () => {
    expect(
      buildPersonalDayResult({
        birthDate: "1990-13-40",
        calculationDate: "2026-06-13",
        locale: "en",
      }),
    ).toBeNull();
  });
});

describe("missing DOB handling", () => {
  it("does not calculate when birth date is invalid", () => {
    expect(() =>
      calculatePersonalDay({
        birthDate: "",
        calculationDate: "2026-06-13",
        locale: "en",
      }),
    ).toThrow();
  });
});

describe("future DOB rejection at profile boundary", () => {
  it("is enforced by onboarding schema, not numerology engine", async () => {
    const { dateOfBirthSchema } = await import(
      "@/features/profile/schemas/onboarding-schema"
    );
    const futureYear = new Date().getFullYear() + 2;
    expect(dateOfBirthSchema.safeParse(`${futureYear}-01-01`).success).toBe(
      false,
    );
  });
});
