import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { CANONICAL_RUNES } from "@/features/runes/constants/canonical-runes";

describe("rune assets", () => {
  it("has all 24 canonical SVG assets on disk", () => {
    for (const rune of CANONICAL_RUNES) {
      const relative = rune.assetPath.replace(/^\//, "");
      const filePath = path.join(process.cwd(), "public", relative);
      expect(fs.existsSync(filePath), `${rune.id} asset missing`).toBe(true);
    }
  });

  it("does not require a raidho asset filename", () => {
    const raidhoPath = path.join(
      process.cwd(),
      "public/assets/runes/symbols/raidho.svg",
    );
    expect(fs.existsSync(raidhoPath)).toBe(false);
    expect(CANONICAL_RUNES.some((rune) => rune.id === "raido")).toBe(true);
  });
});
