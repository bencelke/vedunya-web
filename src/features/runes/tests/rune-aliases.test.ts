import { describe, expect, it } from "vitest";

import { RUNE_ALIASES } from "@/features/runes/constants/rune-aliases";
import {
  isKnownRuneKey,
  normalizeRuneKey,
  resolveRuneId,
} from "@/features/runes/engine/resolve-rune-id";

describe("rune aliases", () => {
  it.each([
    ["raido", "raido"],
    ["raidho", "raido"],
    ["kano", "kenaz"],
    ["berkana", "berkano"],
    ["turisaz", "thurisaz"],
    ["nautiz", "nauthiz"],
    ["sowulo", "sowilo"],
    ["eiwaz", "eihwaz"],
    ["pertha", "perthro"],
  ] as const)("resolves %s to %s", (input, expected) => {
    expect(resolveRuneId(input)).toBe(expected);
    expect(normalizeRuneKey(input)).toBe(expected);
  });

  it("returns null for unknown IDs", () => {
    expect(resolveRuneId("not-a-rune")).toBeNull();
    expect(isKnownRuneKey("not-a-rune")).toBe(false);
  });

  it("does not treat raidho as canonical key", () => {
    expect(RUNE_ALIASES.raidho).toBe("raido");
    expect(resolveRuneId("RAIDHO")).toBe("raido");
  });
});
