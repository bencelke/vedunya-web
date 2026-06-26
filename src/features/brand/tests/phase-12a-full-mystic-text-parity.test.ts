import { describe, expect, it } from "vitest";

import { resolvePersonalDayContent } from "@/features/numerology/content/personal-day-content";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";

function collectStringValues(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") {
    out.push(value);
    return out;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      collectStringValues(item, out);
    }
    return out;
  }
  if (value && typeof value === "object") {
    for (const nested of Object.values(value)) {
      collectStringValues(nested, out);
    }
  }
  return out;
}

const ruVisibleCopy = collectStringValues(ru).join("\n");

/** English leak phrases that must not appear in RU message file copy. */
const RU_BAD_PHRASES = [
  "Say the thing",
  "Share a draft",
  "Knowledge paths",
  "Morning guidance reminder",
  "The universe says",
  "Вселенная говорит",
  "энергия изобилия",
  "магический поток",
] as const;

/** Intentional product English kept in RU UI. */
const RU_ALLOWED_PRODUCT_NAMES = ["Mystic", "Mystic Plus", "Vedunya Maria", "Email", "Google"];

describe("Phase 12A — RU message natural language", () => {
  it("does not leak untranslated guidance/onboarding tokens in RU visible copy", () => {
    expect(ruVisibleCopy).not.toMatch(/\bguidance\b/i);
    expect(ruVisibleCopy).not.toMatch(/\bonboarding\b/i);
    expect(ruVisibleCopy).not.toContain("Knowledge paths");
    expect(ruVisibleCopy).not.toContain("Morning guidance");
  });

  it.each(RU_BAD_PHRASES)("RU visible copy avoids bad phrase: %s", (phrase) => {
    expect(ruVisibleCopy).not.toContain(phrase);
  });

  it("uses Russian course catalog eyebrow", () => {
    expect(ru.courses.catalogEyebrow).toBe("Пути знания");
    expect(ru.courses.catalogEyebrow).not.toBe("Knowledge paths");
  });

  it("uses Russian notification morning label", () => {
    expect(ru.notifications.morningLabel).toBe("Утренняя подсказка");
    expect(ru.notifications.morningLabel).not.toContain("guidance");
  });

  it("keeps intentional Mystic product naming in RU", () => {
    for (const name of RU_ALLOWED_PRODUCT_NAMES) {
      expect(ruVisibleCopy).toContain(name);
    }
  });
});

describe("Phase 12A — EN message polish", () => {
  it("includes trust disclaimer for later legal surfaces", () => {
    expect(en.trust.disclaimer).toContain("not medical, legal, financial, or emergency advice");
    expect(ru.trust.disclaimer).toContain("не медицинская, юридическая, финансовая");
  });

  it("removes prototype next-release wording from signed-in preview", () => {
    expect(en.auth.today.signedInPreview).not.toContain("next release");
    expect(ru.auth.today.signedInPreview).not.toContain("следующем релизе");
  });

  it("keeps polished EN auth and onboarding copy", () => {
    expect(en.auth.loginDescription).toContain("daily practice");
    expect(en.auth.onboarding.steps.welcome.title).toContain("daily practice");
    expect(en.auth.brandWordmark).toBe("MYSTIC by Vedunya Maria");
  });
});

describe("Phase 12A — RU personal day content", () => {
  it("serves Russian personal day 3 without English fallback", () => {
    const resolved = resolvePersonalDayContent({
      personalDayNumber: 3,
      locale: "ru",
      dateKey: "2026-06-23",
      userSeed: "test-user",
    });

    expect(resolved?.content.title).toBe("Самовыражение");
    expect(resolved?.content.title).not.toBe("Expression");
    expect(resolved?.content.summary).not.toContain("Say the thing");
    expect(resolved?.content.doAdvice).not.toContain("Share a draft");
  });
});

describe("Phase 12A — brand wording", () => {
  it("uses Vedunya Maria for main wordmarks", () => {
    expect(en.dailyGuidance.brandWordmark).toBe("Vedunya Maria");
    expect(ru.dailyGuidance.brandWordmark).toBe("Vedunya Maria");
    expect(en.auth.brandWordmark).toBe("MYSTIC by Vedunya Maria");
    expect(ru.auth.brandWordmark).toBe("MYSTIC by Vedunya Maria");
  });

  it("uses Mystic by Vedunya Maria in welcome headlines", () => {
    expect(en.auth.welcomeHeadline).toContain("Mystic by Vedunya Maria");
    expect(ru.auth.welcomeHeadline).toContain("Mystic by Vedunya Maria");
  });
});

describe("Phase 12A — copy coverage by area", () => {
  const areas = [
    ["auth", en.auth, ru.auth],
    ["auth.onboarding", en.auth.onboarding, ru.auth.onboarding],
    ["dailyGuidance", en.dailyGuidance, ru.dailyGuidance],
    ["moon", en.moon, ru.moon],
    ["runes", en.runes, ru.runes],
    ["courses", en.courses, ru.courses],
    ["pwa", en.pwa, ru.pwa],
    ["notifications", en.notifications, ru.notifications],
    ["auth.profile", en.auth.profile, ru.auth.profile],
  ] as const;

  it.each(areas)("%s has EN and RU keys", (_label, enBlock, ruBlock) => {
    expect(Object.keys(enBlock).length).toBeGreaterThan(0);
    expect(Object.keys(ruBlock).length).toBeGreaterThan(0);
    expect(Object.keys(enBlock).sort()).toEqual(Object.keys(ruBlock).sort());
  });
});
