import { describe, expect, it } from "vitest";

import {
  buildContentKey,
  buildDeterministicSeedParts,
  selectDeterministicVariantIndex,
} from "@/features/numerology/engine/deterministic-variant";

describe("deterministic variant helpers", () => {
  it("builds stable content keys", () => {
    expect(buildContentKey(7, "en")).toBe("personal-day:7:en");
    expect(buildContentKey(7, "ru")).toBe("personal-day:7:ru");
  });

  it("builds deterministic seed parts without exposing uid in UI helpers", () => {
    expect(
      buildDeterministicSeedParts({
        userSeed: "uid-hidden",
        dateKey: "2026-06-13",
        personalDayNumber: 4,
        locale: "en",
      }),
    ).toEqual(["uid-hidden", "2026-06-13", "4", "en"]);
  });

  it("always selects the first variant for audited single-string content", () => {
    const seed = buildDeterministicSeedParts({
      dateKey: "2026-06-13",
      personalDayNumber: 1,
      locale: "ru",
    });

    expect(selectDeterministicVariantIndex("doAdvice", 3, seed)).toBe(0);
    expect(selectDeterministicVariantIndex("avoidAdvice", 3, seed)).toBe(0);
  });
});
