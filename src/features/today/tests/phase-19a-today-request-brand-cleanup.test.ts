import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { bottomNavItems } from "@/config/navigation";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("Phase 19A — Today brand header", () => {
  it("keeps MYSTIC by Vedunya Maria for preview/anonymous header variant", () => {
    const header = readSource(
      "src/features/daily-guidance/components/daily-guidance-header.tsx",
    );
    expect(header).toContain("MysticBrandHeader");
    expect(header).toContain('variant === "oracle"');
    expect(en.auth.brandWordmark).toBe("MYSTIC by Vedunya Maria");
    expect(ru.auth.brandWordmark).toBe("MYSTIC by Vedunya Maria");
  });

  it("uses MYSTIC oracle brand for signed-in Today", () => {
    const oracleHeader = readSource("src/features/today/components/today-oracle-header.tsx");
    expect(oracleHeader).toContain("MYSTIC");
  });
});

describe("Phase 19A — Profile navigation", () => {
  it("omits AppHeader for signed-in Today and exposes profile in oracle header", () => {
    const todayPage = readSource("src/app/[locale]/today/page.tsx");
    const oracleHeader = readSource("src/features/today/components/today-oracle-header.tsx");
    expect(todayPage).toMatch(/sessionUser \? null : <AppHeader/);
    expect(oracleHeader).toContain('href="/profile"');
  });

  it("keeps Profile in bottom navigation", () => {
    expect(bottomNavItems.some((item) => item.key === "profile")).toBe(true);
    expect(en.navigation.profile).toBe("Profile");
    expect(ru.navigation.profile).toBe("Профиль");
  });
});

describe("Phase 19A — universe request simplification", () => {
  it("removes category picker from request form UI", () => {
    const form = readSource(
      "src/features/universe-request/components/universe-request-form.tsx",
    );
    const active = readSource(
      "src/features/universe-request/components/universe-request-active-card.tsx",
    );
    expect(form).not.toContain("UniverseRequestCategoryPicker");
    expect(form).not.toContain("categoryLabel");
    expect(active).not.toContain("tCategories");
    expect(active).not.toContain("request.category");
  });

  it("saves request without category in POST body", () => {
    const empty = readSource(
      "src/features/universe-request/components/universe-request-empty-state.tsx",
    );
    const active = readSource(
      "src/features/universe-request/components/universe-request-active-card.tsx",
    );
    expect(empty).toContain('JSON.stringify({ text: input.text })');
    expect(active).toContain('JSON.stringify({ text: input.text })');
  });

  it("keeps character count in form", () => {
    const form = readSource(
      "src/features/universe-request/components/universe-request-form.tsx",
    );
    expect(form).toContain('t("form.charCount"');
    expect(form).toContain('t("form.helper")');
  });

  it("renders saved request text without requiring category in active card", () => {
    const active = readSource(
      "src/features/universe-request/components/universe-request-active-card.tsx",
    );
    expect(active).toContain("{request.text}");
    expect(active).not.toContain("request.category");
  });
});

describe("Phase 19A — request copy EN/RU", () => {
  it("uses calmer EN copy", () => {
    expect(en.universeRequest.empty.heading).toBe("One intention for today");
    expect(en.universeRequest.form.textLabel).toBe("Your request");
    expect(en.universeRequest.form.textPlaceholder).toContain("clarity and calm");
    expect(en.universeRequest.form.helper).toContain("One request is enough");
    expect(en.universeRequest.form.save).toBe("Save request");
    expect(en.universeRequest.active.currentLabel).toBe("Current request");
    expect(en.universeRequest.active.edit).toBe("Edit request");
  });

  it("uses calmer RU copy", () => {
    expect(ru.universeRequest.empty.heading).toBe("Одно намерение на день");
    expect(ru.universeRequest.form.textLabel).toBe("Ваша просьба");
    expect(ru.universeRequest.form.textPlaceholder).toContain("ясность и спокойствие");
    expect(ru.universeRequest.form.helper).toContain("Одной просьбы достаточно");
    expect(ru.universeRequest.form.save).toBe("Сохранить просьбу");
    expect(ru.universeRequest.active.currentLabel).toBe("Текущая просьба");
    expect(ru.universeRequest.active.edit).toBe("Изменить просьбу");
  });
});

describe("Phase 19A — Today route stability", () => {
  it("keeps profile gate on Today for incomplete profiles", () => {
    const todayPage = readSource("src/app/[locale]/today/page.tsx");
    expect(todayPage).toContain("isProfileComplete");
    expect(todayPage).toContain("getOnboardingRedirectPath(locale)");
  });

  it("keeps universe request before rune, moon, and numerology", () => {
    const authenticated = readSource(
      "src/features/daily-guidance/components/daily-guidance-authenticated.tsx",
    );
    const jsx = authenticated.slice(authenticated.indexOf("return ("));
    const requestIndex = jsx.indexOf("UniverseRequestSection");
    const runeIndex = jsx.indexOf("TodayRuneSection");
    const moonIndex = jsx.indexOf("TodayMoonSection");
    const numerologyIndex = jsx.indexOf("TodayNumerologySection");
    expect(requestIndex).toBeGreaterThan(-1);
    expect(requestIndex).toBeLessThan(runeIndex);
    expect(runeIndex).toBeLessThan(moonIndex);
    expect(moonIndex).toBeLessThan(numerologyIndex);
  });
});
