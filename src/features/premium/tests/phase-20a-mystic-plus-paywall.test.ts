import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { WEB_MYSTIC_PLUS_PAYMENT_WIRED } from "@/features/premium/constants";
import {
  hasPremiumEntitlement,
  resolvePremiumDisplayStatus,
} from "@/features/premium/utils/resolve-premium-display-status";
import de from "@/messages/de.json";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

function profileWith(
  fields: Partial<NonNullable<Parameters<typeof resolvePremiumDisplayStatus>[0]>["publicProfile"]>,
) {
  return {
    uid: "user-1",
    displayName: "Boris",
    email: "boris@example.com",
    dateOfBirth: "1990-01-01",
    language: "en" as const,
    profileComplete: true,
    authProviders: ["password"],
    publicProfile: {
      uid: "user-1",
      displayName: "Boris",
      isPremium: false,
      premiumOverride: false,
      isOwner: false,
      ...fields,
    },
    privateProfile: null,
  };
}

describe("Phase 20A — Mystic Plus paywall route", () => {
  it("renders /plus page with paywall screen", () => {
    const page = readSource("src/app/[locale]/plus/page.tsx");
    const screen = readSource(
      "src/features/premium/components/mystic-plus-paywall-screen.tsx",
    );

    expect(page).toContain("MysticPlusPaywallScreen");
    expect(page).toContain("AppShell");
    expect(screen).toContain("mystic-plus-paywall");
  });

  it("aliases /mystic-plus to /plus", () => {
    const alias = readSource("src/app/[locale]/mystic-plus/page.tsx");
    expect(alias).toContain('redirect(`/${locale}/plus`)');
  });

  it("exposes EN and RU paywall copy", () => {
    expect(en.premium.paywall.heroTitle).toBe("Unlock the full reading");
    expect(ru.premium.paywall.heroTitle).toBe("Откройте полный разбор");
    expect(ru.premium.paywall.openInPlus).toBe("Открыть в Mystic Plus");
    expect(en.premium.paywall.disclaimer).toContain("reflective spiritual practice");
  });

  it("uses English structural fallback for de paywall keys", () => {
    expect(de.premium.paywall.metaTitle).toBe("Mystic Plus");
    expect(de.premium.paywall.benefit1).toBeTruthy();
    expect(de.premium.paywall.paymentComingLater).toBeTruthy();
  });
});

describe("Phase 20A — payment honesty", () => {
  it("keeps Mystic Plus payment unwired", () => {
    expect(WEB_MYSTIC_PLUS_PAYMENT_WIRED).toBe(false);
  });

  it("shows disabled payment CTA on paywall plans without checkout wiring", () => {
    const plans = readSource(
      "src/features/premium/components/mystic-plus-paywall-plans.tsx",
    );

    expect(plans).toContain('type="button"');
    expect(plans).toContain("disabled");
    expect(plans).toContain("paymentComingLater");
    expect(plans).not.toContain("createCheckout");
    expect(plans).not.toContain("isPremium = true");
  });

  it("does not grant entitlement client-side on paywall", () => {
    const screen = readSource(
      "src/features/premium/components/mystic-plus-paywall-screen.tsx",
    );
    const link = readSource(
      "src/features/premium/components/mystic-plus-paywall-link.tsx",
    );

    expect(screen).not.toContain("premiumOverride");
    expect(screen).not.toContain("setPremium");
    expect(link).not.toContain("onClick");
    expect(link).toContain('href="/plus"');
  });
});

describe("Phase 20A — access state display", () => {
  it("shows active state for premium, owner, and dev override via resolver", () => {
    expect(hasPremiumEntitlement(profileWith({ isPremium: true }), null)).toBe(true);
    expect(hasPremiumEntitlement(profileWith({ isOwner: true }), null)).toBe(true);
    expect(hasPremiumEntitlement(profileWith({ premiumOverride: true }), null)).toBe(true);
    expect(hasPremiumEntitlement(profileWith({}), null)).toBe(false);
  });

  it("does not expose raw debug flags in paywall UI", () => {
    const screen = readSource(
      "src/features/premium/components/mystic-plus-paywall-screen.tsx",
    );
    const plans = readSource(
      "src/features/premium/components/mystic-plus-paywall-plans.tsx",
    );

    expect(screen).not.toContain("devOverride");
    expect(screen).not.toContain("premiumOverride");
    expect(screen).not.toContain("isOwner");
    expect(screen).toContain("statusActive");
    expect(screen).toContain("activeAccessNote");
    expect(plans).not.toContain("premiumOverride");
  });
});

describe("Phase 20A — Profile/Settings link", () => {
  it("links Profile subscription section to /plus", () => {
    const section = readSource(
      "src/features/profile/components/profile-subscription-section.tsx",
    );

    expect(section).toContain("MysticPlusPaywallLink");
    expect(section).toContain('t("openPlus")');
    expect(en.profile.subscription.openPlus).toBe("Open Mystic Plus");
    expect(ru.profile.subscription.description).toBe(
      "Откройте более глубокую ежедневную подсказку",
    );
  });
});

describe("Phase 20A — locked CTA links", () => {
  it("links Today Mystic Plus panel to /plus", () => {
    const panel = readSource("src/features/today/components/today-mystic-plus-panel.tsx");
    expect(panel).toContain("MysticPlusPaywallLink");
    expect(panel).toContain("unlockFullReading");
  });

  it("links shared Mystic Plus lock card to /plus", () => {
    const lock = readSource("src/features/premium/components/mystic-plus-lock-card.tsx");
    expect(lock).toContain("MysticPlusPaywallLink");
    expect(lock).toContain("openInPlus");
    expect(lock).not.toContain("paymentComingLater");
  });

  it("uses lock card on moon and rune deeper reading surfaces", () => {
    const moon = readSource("src/features/moon/components/moon-guidance-section.tsx");
    const rune = readSource("src/features/runes/components/rune-detail-content.tsx");

    expect(moon).toContain("MysticPlusLockCard");
    expect(rune).toContain("MysticPlusLockCard");
  });
});

describe("Phase 20A — course entitlement separation", () => {
  it("keeps Mystic Plus separate from paid courses on paywall", () => {
    expect(en.premium.paywall.courseSeparateNote).toContain("separate");
    expect(en.courses.purchaseUnavailable).toContain("separate from Mystic Plus");
    const page = readSource("src/app/api/shopify/checkout/create/route.ts");
    expect(page).not.toContain("mysticPlus");
  });
});

describe("Phase 20A — app shell", () => {
  it("shows bottom nav on /plus without adding a Mystic Plus tab", () => {
    const nav = readSource("src/config/navigation.ts");
    expect(nav).toContain('normalized === "/plus"');
    expect(nav).not.toContain('"plus"');
  });

  it("does not use router.refresh on plus page", () => {
    const page = readSource("src/app/[locale]/plus/page.tsx");
    expect(page).not.toContain("router.refresh");
  });
});
