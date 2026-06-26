import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { bottomNavItems } from "@/config/navigation";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("Phase 19B — value-first Today hierarchy", () => {
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

  it("uses editorial hero sections instead of compact rhythm strip", () => {
    const source = readSource(
      "src/features/daily-guidance/components/daily-guidance-authenticated.tsx",
    );

    expect(source).toContain("TodayRuneSection");
    expect(source).toContain("TodayMoonSection");
    expect(source).not.toContain("TodayRhythmStrip");
    expect(source).not.toContain("PersonalDayIndicator");
  });
});

describe("Phase 19B — brand and navigation", () => {
  it("keeps MYSTIC oracle brand on signed-in Today", () => {
    const header = readSource("src/features/today/components/today-oracle-header.tsx");
    expect(header).toContain("MYSTIC");
    expect(en.auth.brandWordmark).toBe("MYSTIC by Vedunya Maria");
  });

  it("omits AppHeader for signed-in Today", () => {
    const todayPage = readSource("src/app/[locale]/today/page.tsx");
    expect(todayPage).toMatch(/sessionUser \? null : <AppHeader/);
  });

  it("keeps Profile in bottom navigation", () => {
    expect(bottomNavItems.some((item) => item.key === "profile")).toBe(true);
  });
});

describe("Phase 19B — collapsed universe request", () => {
  it("starts empty request in collapsed CTA state", () => {
    const empty = readSource(
      "src/features/universe-request/components/universe-request-empty-state.tsx",
    );

    expect(empty).toContain("useState(false)");
    expect(empty).toContain('t("collapsed.heading")');
    expect(empty).toContain('t("collapsed.cta")');
    expect(empty).toContain("setExpanded(true)");
    expect(empty).toMatch(/if \(!expanded\)/);
  });

  it("shows textarea only after expand action", () => {
    const empty = readSource(
      "src/features/universe-request/components/universe-request-empty-state.tsx",
    );

    expect(empty).toContain("UniverseRequestForm");
    expect(empty).toContain("setExpanded(false)");
  });

  it("does not render category picker", () => {
    const form = readSource(
      "src/features/universe-request/components/universe-request-form.tsx",
    );
    expect(form).not.toContain("UniverseRequestCategoryPicker");
  });

  it("renders compact saved request with edit action", () => {
    const active = readSource(
      "src/features/universe-request/components/universe-request-active-card.tsx",
    );

    expect(active).toContain("line-clamp-3");
    expect(active).toContain('t("active.edit")');
    expect(active).toContain("setEditing(true)");
  });
});

describe("Phase 19B — copy EN/RU", () => {
  it("uses premium guidance and collapsed request copy in EN", () => {
    expect(en.dailyGuidance.heroEyebrow).toBe("Today's guidance");
    expect(en.universeRequest.collapsed.heading).toBe("Set today's intention");
    expect(en.universeRequest.collapsed.cta).toBe("Write request");
    expect(en.universeRequest.form.textPlaceholder).toContain("clarity and calm");
  });

  it("uses premium guidance and collapsed request copy in RU", () => {
    expect(ru.dailyGuidance.heroEyebrow).toBe("Подсказка дня");
    expect(ru.universeRequest.collapsed.heading).toBe("Намерение на день");
    expect(ru.universeRequest.collapsed.cta).toBe("Записать просьбу");
    expect(ru.universeRequest.form.textPlaceholder).toContain("ясность и спокойствие");
  });
});

describe("Phase 19B — mobile shell", () => {
  it("uses phone-like today column width near 430px", () => {
    const theme = readSource("src/styles/mystic-theme.css");
    expect(theme).toContain("--today-max-width: 26.875rem");
  });

  it("editorial sections show unavailable fallback without fake values", () => {
    const rune = readSource("src/features/today/components/today-rune-section.tsx");
    const moon = readSource("src/features/today/components/today-moon-section.tsx");
    expect(rune).toContain("isGuidanceReady");
    expect(moon).toContain("isGuidanceReady");
    expect(rune).toContain("SectionUnavailable");
  });
});

describe("Phase 19B — reload loop guards preserved", () => {
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
