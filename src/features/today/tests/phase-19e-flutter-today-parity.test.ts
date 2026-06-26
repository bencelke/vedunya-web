import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import en from "@/messages/en.json";
import ru from "@/messages/ru.json";

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("Phase 19E — Flutter Today oracle header", () => {
  it("renders MYSTIC brand on signed-in Today", () => {
    const header = readSource("src/features/today/components/today-oracle-header.tsx");
    const experience = readSource(
      "src/features/daily-guidance/components/daily-guidance-experience.tsx",
    );
    const todayPage = readSource("src/app/[locale]/today/page.tsx");

    expect(header).toContain("MYSTIC");
    expect(experience).toContain("TodayOracleHeader");
    expect(todayPage).not.toContain("AppHeader showLogin={!sessionUser}");
    expect(todayPage).toMatch(/sessionUser \? null : <AppHeader/);
  });

  it("does not render language pills in Today oracle header", () => {
    const header = readSource("src/features/today/components/today-oracle-header.tsx");
    const experience = readSource(
      "src/features/daily-guidance/components/daily-guidance-experience.tsx",
    );

    expect(header).not.toContain("LanguageDropdown");
    expect(experience).toContain("TodayOracleHeader");
    expect(experience).toContain('variant="oracle"');
  });

  it("shows top-right profile icon linking to profile", () => {
    const header = readSource("src/features/today/components/today-oracle-header.tsx");

    expect(header).toContain('href="/profile"');
    expect(header).toContain("mystic-today-profile-btn");
  });
});

describe("Phase 19E — no generic guidance card", () => {
  it("does not render ПОДСКАЗКА ДНЯ or TODAY'S GUIDANCE on signed-in Today", () => {
    const auth = readSource(
      "src/features/daily-guidance/components/daily-guidance-authenticated.tsx",
    );

    expect(auth).not.toContain("PrimaryGuidanceCard");
    expect(auth).not.toContain("heroEyebrow");
    expect(ru.dailyGuidance.heroEyebrow).toBe("Подсказка дня");
    expect(en.dailyGuidance.heroEyebrow).toBe("Today's guidance");
  });
});

describe("Phase 19E — Flutter section order", () => {
  it("renders request before rune, moon, and numerology", () => {
    const source = readSource(
      "src/features/daily-guidance/components/daily-guidance-authenticated.tsx",
    );
    const jsx = source.slice(source.indexOf("return ("));

    const requestIndex = jsx.indexOf("UniverseRequestSection");
    const runeIndex = jsx.indexOf("TodayRuneSection");
    const moonIndex = jsx.indexOf("TodayMoonSection");
    const numerologyIndex = jsx.indexOf("TodayNumerologySection");

    expect(requestIndex).toBeLessThan(runeIndex);
    expect(runeIndex).toBeLessThan(moonIndex);
    expect(moonIndex).toBeLessThan(numerologyIndex);
  });
});

describe("Phase 19E — collapsed universe request", () => {
  it("starts empty request collapsed without categories", () => {
    const empty = readSource(
      "src/features/universe-request/components/universe-request-empty-state.tsx",
    );

    expect(empty).toContain("useState(false)");
    expect(empty).toMatch(/if \(!expanded\)/);
    expect(empty).not.toContain("UniverseRequestCategoryPicker");
    expect(empty).toContain("mystic-today-request-panel");
  });
});

describe("Phase 19E — editorial rune and moon heroes", () => {
  it("renders large rune sigil in gold circle", () => {
    const rune = readSource("src/features/today/components/today-rune-section.tsx");

    expect(rune).toContain("MysticRuneSigil");
    expect(rune).toContain("size={200}");
    expect(rune).not.toContain("mystic-rhythm-card");
  });

  it("renders large moon phase visual", () => {
    const moon = readSource("src/features/today/components/today-moon-section.tsx");

    expect(moon).toContain("MoonPhaseVisual");
    expect(moon).toContain("size={168}");
    expect(moon).not.toContain("mystic-rhythm-card");
  });
});

describe("Phase 19E — text-first numerology", () => {
  it("renders numerology title without hash or medallion card", () => {
    const numerology = readSource(
      "src/features/today/components/today-numerology-section.tsx",
    );

    expect(numerology).toContain("numerologyTitle");
    expect(numerology).toContain("${number} — ${title}");
    expect(numerology).not.toContain("mystic-numerology-medallion");
    expect(numerology).not.toContain("Hash");
    expect(numerology).not.toContain('"#"');
    expect(numerology).not.toContain("mystic-cosmic-card");
  });

  it("uses Flutter-aligned numerology section labels", () => {
    expect(en.dailyGuidance.todaySections.numerologyTitle).toBe("Numerology of the day");
    expect(ru.dailyGuidance.todaySections.numerologyTitle).toBe("Нумерология дня");
    expect(ru.dailyGuidance.todaySections.moonTitle).toBe("Лунный цикл");
    expect(ru.dailyGuidance.todaySections.runeTitle).toBe("Руна дня");
  });
});

describe("Phase 19E — Mystic Plus lock honesty", () => {
  it("shows disabled gold pill without fake premium access on paywall plans", () => {
    const panel = readSource("src/features/today/components/today-mystic-plus-panel.tsx");
    const plans = readSource(
      "src/features/premium/components/mystic-plus-paywall-plans.tsx",
    );
    const auth = readSource(
      "src/features/daily-guidance/components/daily-guidance-authenticated.tsx",
    );

    expect(panel).toContain("MysticPlusPaywallLink");
    expect(plans).toContain("disabled");
    expect(auth).toContain("showPremiumLock");
    expect(auth).toContain("TodayMysticPlusPanel");
  });
});

describe("Phase 19E — floating bottom navigation", () => {
  it("uses glass floating nav with active pill", () => {
    const nav = readSource("src/components/layout/bottom-navigation.tsx");

    expect(nav).toContain("mystic-chrome-nav--floating");
    expect(nav).toContain("mystic-nav-active-pill");
    expect(nav).toContain("BottomNavigation");
  });
});

describe("Phase 19E — cosmic background and tokens", () => {
  it("uses mystic Today editorial classes and background tokens", () => {
    const theme = readSource("src/styles/mystic-theme.css");

    expect(theme).toContain("--mystic-bg:");
    expect(theme).toContain("--mystic-line:");
    expect(theme).toContain(".mystic-today-brand");
    expect(theme).toContain(".mystic-today-request-panel");
    expect(theme).toContain('url("/assets/backgrounds/app-background.jpg")');
  });
});

describe("Phase 19E — reload loop guards preserved", () => {
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
