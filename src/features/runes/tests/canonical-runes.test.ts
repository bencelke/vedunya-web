import { describe, expect, it } from "vitest";

import {
  CANONICAL_RUNE_ORDER,
  CANONICAL_RUNES,
  RUNE_COUNT,
} from "@/features/runes/constants/canonical-runes";
import { TODAY_RUNE_MODULES } from "@/features/runes/content/today-rune-content";

describe("canonical rune registry", () => {
  it("defines exactly 24 runes", () => {
    expect(RUNE_COUNT).toBe(24);
    expect(CANONICAL_RUNES).toHaveLength(24);
  });

  it("uses unique IDs and indexes", () => {
    const ids = new Set(CANONICAL_RUNE_ORDER);
    const indexes = new Set(CANONICAL_RUNES.map((rune) => rune.index));
    expect(ids.size).toBe(24);
    expect(indexes.size).toBe(24);
  });

  it("includes raido and not raidho as canonical", () => {
    expect(CANONICAL_RUNE_ORDER).toContain("raido");
    expect(CANONICAL_RUNE_ORDER).not.toContain("raidho");
  });

  it("maps every canonical rune to Today content and assets", () => {
    for (const rune of CANONICAL_RUNES) {
      expect(TODAY_RUNE_MODULES[rune.id]).toBeDefined();
      expect(rune.assetPath).toContain(`${rune.id}.svg`);
      expect(rune.assetPath).not.toContain("\\");
      expect(rune.assetPath).not.toContain(" ");
    }
  });
});
