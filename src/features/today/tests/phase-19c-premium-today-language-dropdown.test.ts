import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { appConfig } from "@/config/app-config";
import { localeLabels } from "@/config/locale-labels";
import { bottomNavItems } from "@/config/navigation";
import { resolveSpiritualContentLocale } from "@/i18n/resolve-spiritual-content-locale";
import { routing } from "@/i18n/routing";
import de from "@/messages/de.json";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

function collectLeafPaths(
  value: unknown,
  prefix = "",
): string[] {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return prefix ? [prefix] : [];
  }

  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
    collectLeafPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe("Phase 19C — premium Today background", () => {
  it("uses mystic-app-page cosmic background with starfield asset", () => {
    const theme = readSource("src/styles/mystic-theme.css");
    const shell = readSource("src/components/layout/app-shell.tsx");

    expect(shell).toContain("mystic-app-page");
    expect(theme).toContain('url("/assets/backgrounds/app-background.jpg")');
    expect(theme).toContain(".mystic-app-page::after");
  });

  it("uses premium guidance hero surface class", () => {
    const card = readSource(
      "src/features/daily-guidance/components/primary-guidance-card.tsx",
    );
    expect(card).toContain("mystic-guidance-hero");
    expect(card).toContain("mystic-guidance-action");
  });
});

describe("Phase 19C — editorial sections without hash symbol", () => {
  it("does not render Hash icon or # prefix on numerology section", () => {
    const numerology = readSource(
      "src/features/today/components/today-numerology-section.tsx",
    );
    const rune = readSource("src/features/today/components/today-rune-section.tsx");

    expect(numerology).not.toContain("Hash");
    expect(numerology).not.toContain('"#"');
    expect(numerology).not.toContain("mystic-numerology-medallion");
    expect(rune).not.toContain("Hash");
    expect(rune).not.toContain("mystic-rhythm-card");
  });

  it("uses large hero rune and moon sections", () => {
    const rune = readSource("src/features/today/components/today-rune-section.tsx");
    const moon = readSource("src/features/today/components/today-moon-section.tsx");
    expect(rune).toContain("size={200}");
    expect(moon).toContain("size={168}");
  });
});

describe("Phase 19C — value-first Today hierarchy", () => {
  it("renders request before rune, moon, and numerology", () => {
    const source = readSource(
      "src/features/daily-guidance/components/daily-guidance-authenticated.tsx",
    );
    const jsx = source.slice(source.indexOf("return ("));

    expect(jsx.indexOf("UniverseRequestSection")).toBeLessThan(
      jsx.indexOf("TodayRuneSection"),
    );
    expect(jsx.indexOf("TodayRuneSection")).toBeLessThan(
      jsx.indexOf("TodayMoonSection"),
    );
    expect(jsx.indexOf("TodayMoonSection")).toBeLessThan(
      jsx.indexOf("TodayNumerologySection"),
    );
  });

  it("keeps request collapsed by default", () => {
    const empty = readSource(
      "src/features/universe-request/components/universe-request-empty-state.tsx",
    );
    expect(empty).toContain("useState(false)");
    expect(empty).toMatch(/if \(!expanded\)/);
  });
});

describe("Phase 19C — brand and navigation", () => {
  it("keeps MYSTIC oracle brand on signed-in Today", () => {
    const header = readSource("src/features/today/components/today-oracle-header.tsx");
    expect(header).toContain("MYSTIC");
    expect(en.auth.brandWordmark).toBe("MYSTIC by Vedunya Maria");
  });

  it("omits AppHeader for signed-in Today and keeps profile in oracle header", () => {
    const todayPage = readSource("src/app/[locale]/today/page.tsx");
    const oracleHeader = readSource("src/features/today/components/today-oracle-header.tsx");
    expect(todayPage).toMatch(/sessionUser \? null : <AppHeader/);
    expect(oracleHeader).toContain('href="/profile"');
  });

  it("keeps Profile in bottom navigation", () => {
    expect(bottomNavItems.some((item) => item.key === "profile")).toBe(true);
  });
});

describe("Phase 19C — language dropdown", () => {
  it("renders compact language dropdown instead of EN/RU pills in app header", () => {
    const header = readSource("src/components/layout/app-header.tsx");
    expect(header).toContain("LanguageDropdown");
    expect(header).not.toContain("routing.locales.map");
    expect(header).not.toContain("uppercase tracking-wide");
  });

  it("uses language dropdown in auth language bar", () => {
    const bar = readSource("src/components/layout/auth-language-bar.tsx");
    expect(bar).toContain("LanguageDropdown");
    expect(bar).not.toContain("routing.locales.map");
  });

  it("exposes English, Русский, and Deutsch labels", () => {
    expect(localeLabels.en).toBe("English");
    expect(localeLabels.ru).toBe("Русский");
    expect(localeLabels.de).toBe("Deutsch");
  });

  it("includes globe icon in dropdown component", () => {
    const dropdown = readSource("src/components/i18n/language-dropdown.tsx");
    expect(dropdown).toContain("Globe");
    expect(dropdown).toContain("<select");
    expect(dropdown).toContain("localeLabels[item]");
  });
});

describe("Phase 19C — German locale scaffold", () => {
  it("enables /de route in app config and routing", () => {
    expect(appConfig.supportedLocales).toContain("de");
    expect(routing.locales).toContain("de");
  });

  it("ships de.json with full English fallback copy (no machine German)", () => {
    const enPaths = collectLeafPaths(en).sort();
    const dePaths = collectLeafPaths(de).sort();
    expect(dePaths).toEqual(enPaths);

    for (const path of enPaths) {
      const enValue = path.split(".").reduce<unknown>(
        (acc, key) => (acc as Record<string, unknown>)[key],
        en,
      );
      const deValue = path.split(".").reduce<unknown>(
        (acc, key) => (acc as Record<string, unknown>)[key],
        de,
      );
      expect(deValue).toBe(enValue);
    }
  });

  it("falls back German spiritual content to English", () => {
    expect(resolveSpiritualContentLocale("de")).toBe("en");
    expect(resolveSpiritualContentLocale("ru")).toBe("ru");
    expect(resolveSpiritualContentLocale("en")).toBe("en");
  });
});

describe("Phase 19C — reload loop guards preserved", () => {
  it("keeps timezone sync guards on Today page", () => {
    const todayPage = readSource("src/app/[locale]/today/page.tsx");
    const sync = readSource(
      "src/features/numerology/components/timezone-cookie-sync.tsx",
    );

    expect(todayPage).toContain("TimezoneCookieSync");
    expect(sync).toContain("shouldWriteTimezoneCookie");
    expect(todayPage).not.toContain("router.refresh");
  });
});

describe("Phase 19C — RU copy unchanged", () => {
  it("keeps Russian guidance eyebrow and request copy", () => {
    expect(ru.dailyGuidance.heroEyebrow).toBe("Подсказка дня");
    expect(ru.universeRequest.collapsed.heading).toBe("Намерение на день");
    expect(ru.universeRequest.collapsed.cta).toBe("Записать просьбу");
  });
});
