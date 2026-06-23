import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  applyRuneContentAccess,
  hasRunePremiumContent,
} from "@/features/runes/services/apply-rune-content-access";
import { resolvePremiumAccess } from "@/features/profile/utils/premium-access";
import { hasMoonPremiumContent } from "@/features/moon/utils/moon-premium-content";
import {
  localizeMoonPhaseContent,
} from "@/features/moon/services/moon-content-service";
import { fallbackMoonPhaseById } from "@/features/moon/content/moon-phase-fallback.en";
import { resolveRuneId } from "@/features/runes/constants/rune-aliases";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";

const WEB_ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(resolve(WEB_ROOT, relativePath), "utf8");
}

const sampleRuneContent = {
  runeId: "raido" as const,
  title: "Raido",
  short: "Movement and direction.",
  deep: "Deep meaning",
  action: "Take one step",
  warning: "Avoid rushing",
  affirmation: "I move with purpose",
  reflection: "Where am I headed?",
};

describe("Moon UI parity", () => {
  it("uses mystic today column on Moon page", () => {
    const page = readSource("src/app/[locale]/moon/page.tsx");
    const screen = readSource("src/features/moon/components/moon-screen.tsx");
    expect(screen).toContain("mystic-today-column");
    expect(screen).toContain("AppShell");
    expect(page).toContain("MoonScreen");
  });

  it("shows large phase visual in Moon hero", () => {
    const source = readSource("src/features/moon/components/moon-hero.tsx");
    expect(source).toContain("MoonPhaseVisual");
    expect(source).toContain("200");
  });

  it("gates premium moon fields at load layer", () => {
    const source = readSource(
      "src/features/moon/services/load-current-moon-guidance.ts",
    );
    expect(source).toContain("resolvePremiumAccess");
    expect(source).toContain("showPremiumLock");
  });

  it("shows premium lock card for free users in Moon UI", () => {
    const source = readSource(
      "src/features/moon/components/moon-guidance-section.tsx",
    );
    expect(source).toContain("MoonPremiumLockCard");
    expect(source).toContain("showPremiumLock");
  });

  it("does not expose Feed or Admin in Moon screen", () => {
    const source = readSource("src/features/moon/components/moon-screen.tsx");
    expect(source).not.toContain("/feed");
    expect(source).not.toContain("/admin");
  });
});

describe("Moon premium gating", () => {
  const phaseFull = localizeMoonPhaseContent(
    fallbackMoonPhaseById("waning"),
    "en",
    true,
  );

  it("detects premium moon content from full localization", () => {
    expect(
      hasMoonPremiumContent({
        phase: phaseFull,
        lunarDayContent: null,
      }),
    ).toBe(true);
  });

  it("strips premium fields for free users in localized phase", () => {
    const freePhase = localizeMoonPhaseContent(
      fallbackMoonPhaseById("waning"),
      "en",
      false,
    );
    expect(freePhase.action).toBeUndefined();
    expect(freePhase.reflection).toBeUndefined();
  });
});

describe("Rune UI parity", () => {
  it("uses mystic today column and large rune hero", () => {
    const page = readSource("src/app/[locale]/runes/[runeId]/page.tsx");
    const hero = readSource("src/features/runes/components/rune-hero.tsx");
    expect(page).toContain("mystic-today-column");
    expect(hero).toContain("13.5rem");
    expect(hero).toContain("MysticRuneSigil");
  });

  it("links back to Today from rune detail", () => {
    const source = readSource(
      "src/features/runes/components/rune-detail-screen.tsx",
    );
    expect(source).toContain('href="/today"');
  });

  it("does not expose premium fields in rune detail UI source", () => {
    const source = readSource(
      "src/features/runes/components/rune-detail-content.tsx",
    );
    expect(source).toContain("showPremiumLock");
    expect(source).not.toContain("premiumOverride");
  });
});

describe("Rune aliases and gating", () => {
  it("resolves raidho to canonical raido", () => {
    expect(resolveRuneId("raidho")).toBe("raido");
    expect(resolveRuneId("RAIDHO")).toBe("raido");
  });

  it("strips premium rune fields for free users", () => {
    const stripped = applyRuneContentAccess(sampleRuneContent, {
      premiumActive: false,
      freeFields: ["title", "short"],
      premiumFields: ["deep", "action", "warning", "affirmation", "reflection"],
    });
    expect(stripped.deep).toBe("");
    expect(stripped.short).toBe("Movement and direction.");
    expect(hasRunePremiumContent(sampleRuneContent)).toBe(true);
  });

  it("keeps premium fields for premium users", () => {
    expect(
      resolvePremiumAccess({
        uid: "u1",
        displayName: "Maria",
        email: null,
        dateOfBirth: null,
        language: "en",
        profileComplete: true,
        authProviders: [],
        publicProfile: {
          uid: "u1",
          displayName: "Maria",
          isPremium: true,
          premiumOverride: false,
          isOwner: false,
        },
        privateProfile: null,
      }),
    ).toBe(true);
  });
});

describe("Moon/Rune localization", () => {
  it("includes polished EN Moon/Rune labels", () => {
    expect(en.moon.practiceLabel).toContain("Today's practice");
    expect(en.moon.premiumLockTitle).toContain("Mystic Plus");
    expect(en.runes.meaningLabel).toContain("Rune meaning");
  });

  it("includes polished RU Moon/Rune labels", () => {
    expect(ru.moon.heading).toContain("Лунный ритм");
    expect(ru.moon.practiceLabel).toContain("Практика дня");
    expect(ru.runes.meaningLabel).toContain("Значение руны");
  });
});

describe("Today → rune detail link", () => {
  it("preserves rune detail href in Today anchor", () => {
    const source = readSource("src/features/today/components/today-rune-anchor.tsx");
    expect(source).toContain("data.href");
    expect(source).toContain("viewDetailsLabel");
  });
});
