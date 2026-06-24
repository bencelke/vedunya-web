import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { TRUST_ROUTES } from "@/features/trust/constants";
import { WEB_MYSTIC_PLUS_PAYMENT_WIRED } from "@/features/premium/constants";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";

const WEB_ROOT = process.cwd();

const CORE_ROUTES = [
  "src/app/[locale]/page.tsx",
  "src/app/[locale]/login/page.tsx",
  "src/app/[locale]/onboarding/page.tsx",
  "src/app/[locale]/today/page.tsx",
  "src/app/[locale]/moon/page.tsx",
  "src/app/[locale]/runes/[runeId]/page.tsx",
  "src/app/[locale]/courses/page.tsx",
  "src/app/[locale]/courses/[slug]/page.tsx",
  "src/app/[locale]/profile/page.tsx",
  "src/app/[locale]/offline/page.tsx",
] as const;

const TRUST_ROUTE_PAGES = [
  "src/app/[locale]/legal/disclaimer/page.tsx",
  "src/app/[locale]/legal/privacy/page.tsx",
  "src/app/[locale]/legal/terms/page.tsx",
  "src/app/[locale]/support/page.tsx",
  "src/app/[locale]/about/page.tsx",
  "src/app/[locale]/account/data-deletion/page.tsx",
] as const;

const FORBIDDEN_VISIBLE_COPY = [
  "guaranteed prediction",
  "guaranteed result",
  "payment active",
  "automatic account deletion",
  "HIPAA compliant",
  "GDPR certified",
  "the universe will grant",
  "the universe has answered",
  "Subscribe now",
  "Buy now",
  "Payment successful",
] as const;

const KNOWN_EN_FALLBACKS = [
  "Back to Profile",
  "Privacy Policy",
  "Terms of Use",
  "Signed in as",
  "Personal details",
  "Contact support",
  "Coming soon",
] as const;

function readSource(relativePath: string): string {
  return readFileSync(resolve(WEB_ROOT, relativePath), "utf8");
}

function prototypeCopyBlob(): string {
  return JSON.stringify({
    en: { ...en.dailyGuidance, ...en.premium, ...en.notifications, ...en.legal, ...en.support, ...en.about, ...en.dataDeletion, profile: en.profile },
    ru: { ...ru.dailyGuidance, ...ru.premium, ...ru.notifications, ...ru.legal, ...ru.support, ...ru.about, ...ru.dataDeletion, profile: ru.profile },
  }).toLowerCase();
}

describe("Phase 12G — core localized routes", () => {
  it("defines all core route page modules", () => {
    for (const route of CORE_ROUTES) {
      expect(readSource(route).length).toBeGreaterThan(0);
    }
  });

  it("defines all trust route page modules", () => {
    for (const route of TRUST_ROUTE_PAGES) {
      expect(readSource(route).length).toBeGreaterThan(0);
    }
  });
});

describe("Phase 12G — root redirect behavior", () => {
  it("redirects authenticated users away from locale root entry", () => {
    const landing = readSource("src/app/[locale]/page.tsx");
    expect(landing).toContain("getCurrentUser");
    expect(landing).toContain("getTodayRedirectPath");
    expect(landing).toContain("getOnboardingRedirectPath");
    expect(landing).not.toContain("LandingHero");
  });
});

describe("Phase 12G — Today hierarchy", () => {
  it("places Request the Universe before rune, moon, and personal day", () => {
    const source = readSource(
      "src/features/daily-guidance/components/daily-guidance-authenticated.tsx",
    );
    const jsx = source.slice(source.indexOf("return ("));

    expect(jsx.indexOf("UniverseRequestSection")).toBeLessThan(
      jsx.indexOf("PrimaryGuidanceCard"),
    );
    expect(jsx.indexOf("PrimaryGuidanceCard")).toBeLessThan(
      jsx.indexOf("<TodayRuneAnchor"),
    );
    expect(jsx.indexOf("<TodayRuneAnchor")).toBeLessThan(
      jsx.indexOf("<MoonRhythmSummary"),
    );
    expect(jsx.indexOf("<MoonRhythmSummary")).toBeLessThan(
      jsx.indexOf("<PersonalDayIndicator"),
    );
  });
});

describe("Phase 12G — Profile trust links", () => {
  it("links Profile legal and support sections to trust routes", () => {
    const legal = readSource("src/features/profile/components/profile-legal-section.tsx");
    const support = readSource("src/features/profile/components/profile-support-section.tsx");

    for (const key of Object.keys(TRUST_ROUTES)) {
      expect(legal).toContain(`TRUST_ROUTES.${key}`);
    }
    expect(support).toContain("TRUST_ROUTES.support");
    expect(support).toContain("mailto:");
  });
});

describe("Phase 12G — privacy and honesty", () => {
  it("does not expose forbidden guarantee, payment, or compliance claims", () => {
    const copy = prototypeCopyBlob();
    for (const phrase of FORBIDDEN_VISIBLE_COPY) {
      expect(copy).not.toContain(phrase.toLowerCase());
    }
    expect(copy).not.toMatch(/hipaa/);
    expect(copy).not.toMatch(/gdpr certified/);
  });

  it("defers Mystic Plus subscription checkout on Profile", () => {
    expect(WEB_MYSTIC_PLUS_PAYMENT_WIRED).toBe(false);
    const lockCard = readSource("src/features/premium/components/mystic-plus-lock-card.tsx");
    expect(lockCard).toContain("paymentComingLater");
    expect(lockCard).toContain("disabled");
    expect(lockCard).not.toContain("checkout");
  });

  it("uses honest scheduler note for notifications", () => {
    expect(en.notifications.schedulerNote).toContain("scheduled from the server");
    expect(ru.notifications.schedulerNote).toContain("отправляются сервером");
    expect(en.notifications.schedulerNote).not.toMatch(/already sending|live now/i);
  });

  it("describes manual data deletion honestly", () => {
    expect(en.dataDeletion.manualNote).toMatch(/not available|manual/i);
    expect(ru.dataDeletion.manualNote).toMatch(/недоступно|вручную/i);
  });
});

describe("Phase 12G — Profile safety", () => {
  it("hides UID and debug fields from Profile UI", () => {
    const components = [
      "src/features/profile/components/profile-content.tsx",
      "src/features/profile/components/profile-account-section.tsx",
    ];
    for (const path of components) {
      const source = readSource(path);
      expect(source).not.toContain("profile.uid");
      expect(source).not.toContain("{uid}");
      expect(source).not.toContain("isAdmin");
    }
  });
});

describe("Phase 12G — course lock vs Mystic Plus", () => {
  it("uses distinct course purchase copy from Mystic Plus lock", () => {
    expect(en.courses.purchaseUnavailable).toContain("purchase soon");
    expect(en.premium.paymentComingLater).toBeTruthy();
    expect(en.courses.purchaseUnavailable).not.toBe(en.premium.paymentComingLater);
    expect(en.courses.purchaseUnavailable).toContain("Mystic Plus");
  });
});

describe("Phase 12G — RU localization quality", () => {
  it("avoids known EN fallback strings in RU profile and trust copy", () => {
    const ruBlob = JSON.stringify({
      profile: ru.profile,
      legal: ru.legal,
      support: ru.support,
      about: ru.about,
      dataDeletion: ru.dataDeletion,
    });
    for (const phrase of KNOWN_EN_FALLBACKS) {
      expect(ruBlob).not.toContain(phrase);
    }
  });
});

describe("Phase 12G — trust page shell", () => {
  it("includes back to profile without double horizontal padding", () => {
    const shell = readSource("src/features/trust/components/trust-page-shell.tsx");
    const section = readSource("src/features/trust/components/trust-section.tsx");
    expect(shell).toContain('href="/profile"');
    expect(shell).not.toContain("px-[var(--spacing-page)]");
    expect(section).toContain("break-words");
  });
});

describe("Phase 12G — PWA honesty", () => {
  it("disables PWA registration outside production runtime", () => {
    const config = readSource("src/config/pwa.ts");
    const registrar = readSource("src/components/pwa/pwa-registrar.tsx");
    expect(config).toContain("isPwaEnabled");
    expect(config).toContain("NODE_ENV");
    expect(registrar).toContain("isPwaEnabled");
  });
});

describe("Phase 12G — load error copy", () => {
  it("uses calm localized load errors without raw Firebase codes", () => {
    expect(en.dailyGuidance.loadError).not.toMatch(/auth\/|firebase/i);
    expect(ru.dailyGuidance.loadError).not.toMatch(/auth\/|firebase/i);
    expect(en.dailyGuidance.loadError).toContain("try again");
    expect(ru.dailyGuidance.loadError).toContain("Попробуйте");
  });
});
