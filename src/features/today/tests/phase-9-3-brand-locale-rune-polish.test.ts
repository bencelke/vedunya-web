import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { resolvePersonalDayContent } from "@/features/numerology/content/personal-day-content";
import { calculatePersonalDay } from "@/features/numerology/engine/calculate-personal-day";
import { buildDailyRuneResult } from "@/features/runes/services/daily-rune-service";
import { parseDateKey } from "@/features/runes/engine/date-key";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";

const WEB_ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(resolve(WEB_ROOT, relativePath), "utf8");
}

describe("Phase 9.3 brand wordmark", () => {
  it("uses Vedunya Maria brand wordmark in Today header", () => {
    const header = readSource(
      "src/features/daily-guidance/components/daily-guidance-header.tsx",
    );
    expect(header).toContain("brandWordmark");
    expect(header).not.toContain(">Mystic<");
    expect(en.dailyGuidance.brandWordmark).toBe("Vedunya Maria");
    expect(ru.dailyGuidance.brandWordmark).toBe("Vedunya Maria");
  });
});

describe("Phase 9.3 Russian Today content", () => {
  it("loads Today content from route locale instead of profile language", () => {
    const loader = readSource(
      "src/features/daily-guidance/services/load-daily-guidance.ts",
    );
    expect(loader).toContain("const contentLocale = locale");
    expect(loader).not.toContain("profile.language");
  });

  it("provides polished Russian personal day 3 fallback", () => {
    const resolved = resolvePersonalDayContent({
      personalDayNumber: 3,
      locale: "ru",
      dateKey: "2026-06-23",
      userSeed: "test-user",
    });

    expect(resolved?.content.title).toBe("Самовыражение");
    expect(resolved?.content.summary).toContain("простыми словами");
    expect(resolved?.content.doAdvice).toContain("черновик");
    expect(resolved?.content.title).not.toBe("Expression");
    expect(resolved?.content.summary).not.toContain("Say the thing");
    expect(resolved?.content.doAdvice).not.toContain("Share a draft");
  });

  it("keeps English personal day content on EN locale", () => {
    const resolved = resolvePersonalDayContent({
      personalDayNumber: 3,
      locale: "en",
      dateKey: "2026-06-23",
      userSeed: "test-user",
    });

    expect(resolved?.content.title).toBe("Expression");
    expect(resolved?.content.summary).toContain("Say the thing");
  });
});

describe("Phase 9.3 rune visual polish", () => {
  it("renders premium MysticRuneSigil with gold glyph styling", () => {
    const sigil = readSource("src/features/runes/components/mystic-rune-sigil.tsx");
    const theme = readSource("src/styles/mystic-theme.css");
    expect(sigil).toContain("mystic-rune-sigil-glyph");
    expect(theme).toContain(".mystic-rune-sigil");
    expect(theme).toContain("#f3ede3");
  });

  it("uses MysticRuneSigil on Today and Rune detail heroes", () => {
    const today = readSource("src/features/today/components/today-rune-anchor.tsx");
    const hero = readSource("src/features/runes/components/rune-hero.tsx");
    expect(today).toContain("MysticRuneSigil");
    expect(hero).toContain("MysticRuneSigil");
  });

  it("keeps rune SVG asset paths available", () => {
    const canonical = readSource("src/features/runes/constants/canonical-runes.ts");
    const sigil = readSource("src/features/runes/components/mystic-rune-sigil.tsx");
    expect(sigil).toContain("definition.assetPath");
    expect(canonical).toContain(".svg");
  });
});

describe("Phase 9.3 deterministic engines unchanged", () => {
  it("keeps personal day calculation unchanged", () => {
    const result = calculatePersonalDay({
      birthDate: "1990-03-15",
      calculationDate: "2026-06-23",
      locale: "en",
    });
    expect(result.personalDayNumber).toBe(3);
  });

  it("keeps daily rune selection unchanged", () => {
    const rune = buildDailyRuneResult({
      personalDayNumber: 3,
      forDate: parseDateKey("2026-06-23"),
      locale: "ru",
    });
    expect(rune.selection.runeId).toBe("thurisaz");
    expect(rune.content.title).not.toBe("Thurisaz");
  });
});
