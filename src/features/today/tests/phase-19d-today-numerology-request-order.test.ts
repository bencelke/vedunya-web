import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { resolvePersonalDayContent } from "@/features/numerology/content/personal-day-content";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("Phase 19D — Today order: request first", () => {
  it("renders request before numerology and rhythm cards", () => {
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

  it("does not render generic PrimaryGuidanceCard on signed-in Today", () => {
    const source = readSource(
      "src/features/daily-guidance/components/daily-guidance-authenticated.tsx",
    );

    expect(source).not.toContain("PrimaryGuidanceCard");
    expect(source).toContain("TodayNumerologySection");
  });
});

describe("Phase 19D — no generic daily guidance card", () => {
  it("does not use heroEyebrow guidance labels in Today authenticated flow", () => {
    const source = readSource(
      "src/features/daily-guidance/components/daily-guidance-authenticated.tsx",
    );

    expect(source).not.toContain("heroEyebrow");
    expect(source).not.toContain("PrimaryGuidanceCard");
  });

  it("keeps heroEyebrow out of TodayNumerologySection", () => {
    const section = readSource("src/features/today/components/today-numerology-section.tsx");

    expect(section).not.toContain("heroEyebrow");
    expect(section).toContain("numerologyTitle");
    expect(section).not.toContain("Today's guidance");
  });
});

describe("Phase 19D — collapsed universe request", () => {
  it("starts empty request in collapsed CTA state", () => {
    const empty = readSource(
      "src/features/universe-request/components/universe-request-empty-state.tsx",
    );

    expect(empty).toContain("useState(false)");
    expect(empty).toMatch(/if \(!expanded\)/);
    expect(empty).not.toContain("UniverseRequestCategoryPicker");
  });
});

describe("Phase 19D — numerology section content", () => {
  it("renders Mystic number, title, summary, and focus as text", () => {
    const section = readSource("src/features/today/components/today-numerology-section.tsx");

    expect(section).not.toContain("mystic-numerology-medallion");
    expect(section).toContain("{title}");
    expect(section).toContain("{summary}");
    expect(section).toContain("{focus}");
    expect(section).not.toContain("Hash");
    expect(section).not.toContain('"#"');
  });

  it("uses personal-day-content.en for EN personal day 9", () => {
    const resolved = resolvePersonalDayContent({
      personalDayNumber: 9,
      locale: "en",
      dateKey: "2026-06-23",
      userSeed: "test-user",
    });

    expect(resolved?.content.title).toBe("Completion");
    expect(resolved?.content.summary).toContain("Let go what is done");
    expect(resolved?.content.doAdvice).toContain("Close a loop");
  });

  it("uses personal-day-content.ru for RU personal day 9", () => {
    const resolved = resolvePersonalDayContent({
      personalDayNumber: 9,
      locale: "ru",
      dateKey: "2026-06-23",
      userSeed: "test-user",
    });

    expect(resolved?.content.title).toBe("Завершение");
    expect(resolved?.content.summary).toContain("Отпустите завершённое");
    expect(resolved?.content.doAdvice).toContain("Закройте");
  });

  it("exposes numerology card labels in messages", () => {
    expect(en.dailyGuidance.numerologyCard.label).toBe("Numerology of the day");
    expect(ru.dailyGuidance.numerologyCard.label).toBe("Нумерология дня");
    expect(ru.dailyGuidance.numerologyCard.focusLabel).toBe("Фокус");
  });
});

describe("Phase 19D — rune and moon editorial sections", () => {
  it("keeps rune before moon in authenticated Today", () => {
    const auth = readSource(
      "src/features/daily-guidance/components/daily-guidance-authenticated.tsx",
    );
    const jsx = auth.slice(auth.indexOf("return ("));

    expect(jsx.indexOf("TodayRuneSection")).toBeLessThan(jsx.indexOf("TodayMoonSection"));
  });
});

describe("Phase 19D — request copy EN/RU", () => {
  it("uses calm collapsed request copy", () => {
    expect(en.universeRequest.collapsed.heading).toBe("Set today's intention");
    expect(en.universeRequest.collapsed.cta).toBe("Write request");
    expect(ru.universeRequest.title).toBe("Просьба к Вселенной");
    expect(ru.universeRequest.collapsed.heading).toBe("Намерение на день");
    expect(ru.universeRequest.collapsed.cta).toBe("Записать просьбу");
  });
});

describe("Phase 19D — reload loop guards preserved", () => {
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
