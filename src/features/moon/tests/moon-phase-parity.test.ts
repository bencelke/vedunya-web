import { describe, expect, it } from "vitest";

import { mapPhase8ToPhase4 } from "@/features/moon/engine/phase-asset-map";
import { resolvePhase8FromProgress } from "@/features/moon/engine/resolve-moon-phase";

describe("four-phase mapping parity", () => {
  it.each([
    ["new_moon", "new_moon"],
    ["waxing_crescent", "waxing"],
    ["first_quarter", "waxing"],
    ["waxing_gibbous", "waxing"],
    ["full_moon", "full_moon"],
    ["waning_gibbous", "waning"],
    ["last_quarter", "waning"],
    ["waning_crescent", "waning"],
  ] as const)("maps phase8 $0 to phase4 $1", (phase8, phase4) => {
    expect(mapPhase8ToPhase4(phase8)).toBe(phase4);
  });

  it("covers all four Firestore phase IDs", () => {
    const phase4 = new Set<string>();
    for (let i = 0; i < 256; i += 1) {
      const progress = i / 256;
      const phase8 = resolvePhase8FromProgress(progress);
      phase4.add(mapPhase8ToPhase4(phase8));
    }
    expect([...phase4].sort()).toEqual([
      "full_moon",
      "new_moon",
      "waning",
      "waxing",
    ]);
  });
});
