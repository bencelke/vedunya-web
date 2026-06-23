import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { appConfig } from "@/config/app-config";
import { pwaConfig } from "@/config/pwa";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";

const WEB_ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(resolve(WEB_ROOT, relativePath), "utf8");
}

describe("Phase 9.4 — primary page headers use Vedunya Maria", () => {
  it("uses translated brand wordmark in Today header, not standalone Mystic", () => {
    const header = readSource(
      "src/features/daily-guidance/components/daily-guidance-header.tsx",
    );
    expect(header).toContain('t("brandWordmark")');
    expect(header).not.toContain(">Mystic<");
    expect(header).not.toContain(">MYSTIC<");
    expect(en.dailyGuidance.brandWordmark).toBe("Vedunya Maria");
    expect(ru.dailyGuidance.brandWordmark).toBe("Vedunya Maria");
  });

  it("uses translated brand wordmark in app header via BrandMark", () => {
    const header = readSource("src/components/layout/app-header.tsx");
    const brandMark = readSource("src/components/brand/brand-mark.tsx");
    expect(header).toContain("BrandMark");
    expect(header).toContain("showLogo");
    expect(brandMark).toContain("Vedunya Maria");
    expect(header).not.toContain(">MYSTIC<");
    expect(header).not.toContain(">Mystic<");
  });
});

describe("Phase 9.4 — auth and onboarding branding", () => {
  it("uses Vedunya Maria wordmark in auth brand header via i18n", () => {
    const source = readSource(
      "src/features/auth/components/auth-brand-header.tsx",
    );
    expect(source).toContain('useTranslations("auth")');
    expect(source).toContain('t("brandWordmark")');
    expect(source).toContain("showWordmark={false}");
    expect(source).not.toContain(">Mystic<");
    expect(en.auth.brandWordmark).toBe("Vedunya Maria");
    expect(ru.auth.brandWordmark).toBe("Vedunya Maria");
  });

  it("keeps Mystic by Vedunya Maria in auth headlines, not standalone MYSTIC", () => {
    expect(en.auth.welcomeHeadline).toContain("Mystic by Vedunya Maria");
    expect(ru.auth.welcomeHeadline).toContain("Mystic by Vedunya Maria");
    expect(en.auth.welcomeHeadline).not.toMatch(/^MYSTIC$/);
  });

  it("shows Vedunya Maria wordmark on onboarding welcome step", () => {
    const flow = readSource(
      "src/features/onboarding/components/onboarding-flow.tsx",
    );
    expect(flow).toContain('useTranslations("auth")');
    expect(flow).toContain('tAuth("brandWordmark")');
    expect(flow).toContain("mystic-auth-wordmark");
    expect(flow).toContain("showWordmark={false}");
    expect(flow).not.toContain(">MYSTIC<");
  });
});

describe("Phase 9.4 — PWA and product naming", () => {
  it("keeps Mystic by Vedunya Maria full name and Mystic short name", () => {
    expect(appConfig.name).toBe("Mystic by Vedunya Maria");
    expect(appConfig.shortName).toBe("Mystic");
    expect(pwaConfig.name).toBe("Mystic by Vedunya Maria");
    expect(pwaConfig.shortName).toBe("Mystic");
  });

  it("keeps install copy using Mystic product short name", () => {
    expect(en.pwa.installTitle).toContain("Install Mystic");
    expect(ru.pwa.installTitle).toContain("Установить Mystic");
  });

  it("serves manifest with Mystic identity", () => {
    const manifestRoute = readSource("src/app/manifest.ts");
    expect(manifestRoute).toContain("pwaConfig");
  });
});

describe("Phase 9.4 — logo asset pairing", () => {
  it("pairs makosh emblem with Vedunya Maria copy in auth and onboarding", () => {
    const authHeader = readSource(
      "src/features/auth/components/auth-brand-header.tsx",
    );
    const onboarding = readSource(
      "src/features/onboarding/components/onboarding-flow.tsx",
    );
    const mysticLogo = readSource("src/components/brand/mystic-logo.tsx");
    expect(authHeader).toContain("MysticLogo");
    expect(onboarding).toContain("MysticLogo");
    expect(mysticLogo).toContain("makoshEmblem");
  });

  it("uses vedunya-mark.svg for compact app header logo", () => {
    const brandMark = readSource("src/components/brand/brand-mark.tsx");
    expect(brandMark).toContain("/assets/brand/vedunya-mark.svg");
  });
});

describe("Phase 9.4 — EN/RU routes remain wired", () => {
  const routes = [
    "src/app/[locale]/login/page.tsx",
    "src/app/[locale]/onboarding/page.tsx",
    "src/app/[locale]/today/page.tsx",
    "src/app/[locale]/profile/page.tsx",
  ];

  it.each(routes)("keeps locale route %s", (route) => {
    const source = readSource(route);
    expect(source.length).toBeGreaterThan(0);
    expect(source).toMatch(/setRequestLocale|params/);
  });
});
