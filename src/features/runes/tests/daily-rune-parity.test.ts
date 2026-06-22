import { describe, expect, it } from "vitest";

import { selectDailyRune } from "@/features/runes/engine/select-daily-rune";
import { computeDailyRuneSeed, runeIndexFromSeed } from "@/features/runes/engine/rune-seed";

/** Hardcoded from docs/migration/parity-test-cases.md rune selection table. */
const PARITY_FIXTURES = [
  { dob: "1990-03-15", date: "2026-06-13", pd: 2, seed: 2367, index: 15, runeId: "sowilo" },
  { dob: "1985-11-29", date: "2026-01-01", pd: 7, seed: 7094, index: 14, runeId: "algiz" },
  { dob: "1977-07-07", date: "2026-06-13", pd: 7, seed: 7412, index: 20, runeId: "laguz" },
  { dob: "2000-02-29", date: "2026-03-01", pd: 9, seed: 9233, index: 17, runeId: "berkano" },
  { dob: "1999-12-31", date: "2026-12-31", pd: 6, seed: 6790, index: 22, runeId: "dagaz" },
  { dob: "1988-08-08", date: "2026-08-08", pd: 6, seed: 6521, index: 17, runeId: "berkano" },
  { dob: "1995-05-05", date: "2026-05-05", pd: 3, seed: 3306, index: 18, runeId: "ehwaz" },
  { dob: "1992-02-02", date: "2026-02-02", pd: 9, seed: 9175, index: 7, runeId: "wunjo" },
  { dob: "1980-01-01", date: "2026-01-01", pd: 5, seed: 5076, index: 12, runeId: "eihwaz" },
  { dob: "2005-09-09", date: "2026-09-09", pd: 1, seed: 1539, index: 3, runeId: "ansuz" },
  { dob: "1993-06-06", date: "2026-06-06", pd: 7, seed: 7405, index: 13, runeId: "perthro" },
  { dob: "1970-04-04", date: "2026-04-04", pd: 8, seed: 8289, index: 9, runeId: "nauthiz" },
  // Extended synthetic fixtures (seed/index verified via audited formula)
  { pd: 1, date: "2026-02-14", seed: 1115, index: 11, runeId: "jera" },
  { pd: 3, date: "2026-04-15", seed: 3255, index: 15, runeId: "sowilo" },
  { pd: 4, date: "2026-07-04", seed: 4437, index: 21, runeId: "ingwaz" },
  { pd: 5, date: "2026-10-31", seed: 5658, index: 18, runeId: "ehwaz" },
  { pd: 6, date: "2026-11-11", seed: 6709, index: 13, runeId: "perthro" },
  { pd: 7, date: "2026-03-20", seed: 7234, index: 10, runeId: "isa" },
  { pd: 8, date: "2026-05-20", seed: 8366, index: 14, runeId: "algiz" },
  { pd: 9, date: "2026-09-21", seed: 9623, index: 23, runeId: "othala" },
  { pd: 1, date: "2024-02-29", seed: 1130, index: 2, runeId: "thurisaz" },
  { pd: 2, date: "2026-12-25", seed: 2748, index: 12, runeId: "eihwaz" },
  { pd: 3, date: "2026-01-15", seed: 3072, index: 0, runeId: "fehu" },
  { pd: 4, date: "2026-06-21", seed: 4393, index: 1, runeId: "uruz" },
  { pd: 5, date: "2026-08-15", seed: 5519, index: 23, runeId: "othala" },
  { pd: 6, date: "2026-02-28", seed: 6174, index: 6, runeId: "gebo" },
  { pd: 7, date: "2026-07-07", seed: 7467, index: 3, runeId: "ansuz" },
  { pd: 8, date: "2026-11-01", seed: 8717, index: 5, runeId: "kenaz" },
  { pd: 9, date: "2026-03-15", seed: 9247, index: 7, runeId: "wunjo" },
  { pd: 1, date: "2026-06-01", seed: 1346, index: 2, runeId: "thurisaz" },
  { pd: 2, date: "2026-06-30", seed: 2384, index: 8, runeId: "hagalaz" },
  { pd: 3, date: "2026-12-01", seed: 3733, index: 13, runeId: "perthro" },
  { pd: 4, date: "2026-01-31", seed: 4097, index: 17, runeId: "berkano" },
  { pd: 5, date: "2026-05-01", seed: 5320, index: 16, runeId: "tiwaz" },
  { pd: 6, date: "2026-09-01", seed: 6576, index: 0, runeId: "fehu" },
  { pd: 7, date: "2026-04-01", seed: 7277, index: 5, runeId: "kenaz" },
  { pd: 8, date: "2026-08-01", seed: 8532, index: 12, runeId: "eihwaz" },
  { pd: 9, date: "2026-10-01", seed: 9664, index: 16, runeId: "tiwaz" },
  { pd: 1, date: "2026-01-10", seed: 1049, index: 17, runeId: "berkano" },
  { pd: 2, date: "2026-02-10", seed: 2120, index: 8, runeId: "hagalaz" },
  { pd: 3, date: "2026-03-10", seed: 3188, index: 20, runeId: "laguz" },
  { pd: 4, date: "2026-04-10", seed: 4259, index: 11, runeId: "jera" },
] as const;

function dateParts(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return { year, month, day };
}

describe("daily rune parity fixtures", () => {
  it.each(PARITY_FIXTURES)(
    "selects $runeId for PD=$pd on $date",
    ({ date, pd, seed, index, runeId }) => {
      const forDate = dateParts(date);
      expect(
        computeDailyRuneSeed({ personalDayNumber: pd, forDate }),
      ).toBe(seed);
      expect(runeIndexFromSeed(seed)).toBe(index);

      const selection = selectDailyRune({
        personalDayNumber: pd,
        forDate,
        locale: "en",
      });
      expect(selection.runeIndex).toBe(index);
      expect(selection.runeId).toBe(runeId);
      expect(selection.seed).toBe(seed);
    },
  );
});

describe("seed edge cases", () => {
  it("handles negative seeds with positive modulo", () => {
    expect(runeIndexFromSeed(-1)).toBe(23);
    expect(runeIndexFromSeed(-24)).toBe(0);
  });

  it("uses month and day-of-year in seed", () => {
    const jan = computeDailyRuneSeed({
      personalDayNumber: 5,
      forDate: { year: 2026, month: 1, day: 1 },
    });
    const dec = computeDailyRuneSeed({
      personalDayNumber: 5,
      forDate: { year: 2026, month: 12, day: 31 },
    });
    expect(jan).not.toBe(dec);
  });
});
