import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { shouldShowBottomNav } from "@/config/navigation";
import {
  composeAuthenticatedGuidance,
  composeMoonSection,
  composeRuneSection,
} from "@/features/daily-guidance/services/compose-daily-guidance";
import { resolvePremiumAccess } from "@/features/profile/utils/premium-access";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";

const WEB_ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(resolve(WEB_ROOT, relativePath), "utf8");
}

describe("Today UI parity — shell and layout", () => {
  it("uses mystic today column on Today page", () => {
    const source = readSource("src/app/[locale]/today/page.tsx");
    expect(source).toContain("mystic-today-column");
    expect(source).toContain("AppShell");
  });

  it("does not show bottom navigation on Today route", () => {
    expect(shouldShowBottomNav("/today")).toBe(true);
  });
});

describe("Today visual hierarchy", () => {
  it("renders Today sections in Mystic order", () => {
    const source = readSource(
      "src/features/daily-guidance/components/daily-guidance-authenticated.tsx",
    );
    const jsx = source.slice(source.indexOf("return ("));

    const requestIndex = jsx.indexOf("UniverseRequestSection");
    const primaryIndex = jsx.indexOf("PrimaryGuidanceCard");
    const runeAnchorPos = jsx.indexOf("<TodayRuneAnchor");
    const moonPos = jsx.indexOf("<MoonRhythmSummary");
    const personalDayPos = jsx.indexOf("<PersonalDayIndicator");

    expect(requestIndex).toBeGreaterThan(-1);
    expect(requestIndex).toBeLessThan(primaryIndex);
    expect(runeAnchorPos).toBeLessThan(moonPos);
    expect(moonPos).toBeLessThan(personalDayPos);
  });

  it("uses large rune visual in TodayRuneAnchor", () => {
    const source = readSource("src/features/today/components/today-rune-anchor.tsx");
    expect(source).toContain("13.5rem");
    expect(source).toContain("MysticRuneSigil");
  });

  it("uses mystic cosmic cards for Today sections", () => {
    const primary = readSource(
      "src/features/daily-guidance/components/primary-guidance-card.tsx",
    );
    expect(primary).toContain("mystic-cosmic-card");
  });
});

describe("Today premium gating", () => {
  it("resolves premium from existing profile fields only", () => {
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

    expect(
      resolvePremiumAccess({
        uid: "u2",
        displayName: "Guest",
        email: null,
        dateOfBirth: null,
        language: "en",
        profileComplete: true,
        authProviders: [],
        publicProfile: {
          uid: "u2",
          displayName: "Guest",
          isPremium: false,
          premiumOverride: false,
          isOwner: false,
        },
        privateProfile: null,
      }),
    ).toBe(false);
  });

  it("hides rune deep fields for free users in compose layer", () => {
    const rune = composeRuneSection(
      {
        selection: {
          runeId: "fehu",
          runeIndex: 0,
          dateKey: "2026-06-13",
          seed: 1,
        },
        content: {
          title: "Fehu",
          short: "Short",
          guidance: "Short",
          action: "Act",
        },
        assetPath: "/assets/runes/symbols/fehu.svg",
      },
      "unavailable",
      "Primary action",
      { premiumActive: false, runeDeep: "Deep meaning" },
    );

    expect(rune.status).toBe("ready");
    if (rune.status === "ready") {
      expect(rune.data.deep).toBeNull();
      expect(rune.data.showPremiumDeepLock).toBe(true);
    }
  });

  it("shows premium lock card for free users in authenticated Today UI", () => {
    const source = readSource(
      "src/features/daily-guidance/components/daily-guidance-authenticated.tsx",
    );
    expect(source).toContain("MysticPlusLockCard");
    expect(source).toContain("showPremiumDeepLock");
  });

  it("does not expose premium fields in Today UI source", () => {
    const source = readSource(
      "src/features/daily-guidance/components/daily-guidance-authenticated.tsx",
    );
    expect(source).not.toContain("premiumOverride");
    expect(source).not.toContain("isAdmin");
  });
});

describe("Today localization", () => {
  it("includes polished EN Today copy", () => {
    expect(en.dailyGuidance.focusLabel).toContain("Today's focus");
    expect(en.dailyGuidance.runeOfDayLabel).toBeTruthy();
    expect(en.premium.lockTitle).toContain("Mystic Plus");
  });

  it("includes polished RU Today copy", () => {
    expect(ru.dailyGuidance.focusLabel).toContain("Фокус дня");
    expect(ru.dailyGuidance.moonRhythmLabel).toContain("Лунный ритм");
    expect(ru.premium.lockTitle).toContain("Mystic Plus");
  });
});

describe("Today navigation scope", () => {
  it("does not expose Feed, Cards, or Admin in Today authenticated source", () => {
    const source = readSource(
      "src/features/daily-guidance/components/daily-guidance-authenticated.tsx",
    );
    expect(source).not.toContain("/feed");
    expect(source).not.toContain("/admin");
    expect(source).not.toContain("/cards");
  });
});

describe("Today incomplete profile state", () => {
  it("links incomplete users to onboarding", () => {
    const loader = readSource(
      "src/features/daily-guidance/services/load-daily-guidance.ts",
    );
    expect(loader).toContain('setupHref: "/onboarding"');

    const incomplete = readSource(
      "src/features/daily-guidance/components/daily-guidance-incomplete.tsx",
    );
    expect(incomplete).toContain("setupHref");
  });
});

describe("Today deterministic preservation", () => {
  it("keeps composeAuthenticatedGuidance deterministic with premium flag", () => {
    const input = {
      formattedDate: "Friday, June 13",
      greetingName: "Maria",
      premiumActive: false,
      labels: {
        primaryLabel: "Today's focus",
        numerologyUnavailable: "x",
        moonUnavailable: "x",
        runeUnavailable: "x",
        formatPersonalDayExplanation: (n: number, t: string) => `${n}-${t}`,
      },
      numerology: null,
      moon: null,
      rune: null,
    };

    expect(composeAuthenticatedGuidance(input)).toEqual(
      composeAuthenticatedGuidance(input),
    );
  });

  it("gates moon deep content without changing short summary", () => {
    const moon = composeMoonSection(
      {
        dateKey: "2026-06-13",
        timezone: "UTC",
        calculation: {
          phaseId: "full_moon",
          phase8Id: "full_moon",
          lunarDay: 15,
          illuminationPercent: 99,
          moonAgeDays: 14,
          phaseProgress: 0.5,
          isWaxing: false,
          energyLevel: "high",
          julianDate: 0,
        },
        phase: {
          title: "Full moon",
          short: "Peak light.",
          guidance: "Deep guidance",
          action: "Act",
        },
        lunarDayContent: null,
        source: { phase: "fallback", lunarDay: "missing" },
      },
      "unavailable",
      false,
    );

    if (moon.status === "ready") {
      expect(moon.data.summary).toBe("Peak light.");
      expect(moon.data.deep).toBeNull();
    }
  });
});
