import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { WEB_MYSTIC_PLUS_PAYMENT_WIRED } from "@/features/premium/constants";
import {
  DEFAULT_MYSTIC_PLUS_PLAN,
  MYSTIC_PLUS_PRICING,
} from "@/features/premium/mystic-plus-pricing";
import {
  hasPremiumEntitlement,
} from "@/features/premium/utils/resolve-premium-display-status";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

function profileWith(
  fields: Partial<{
    isPremium: boolean;
    premiumOverride: boolean;
    isOwner: boolean;
  }>,
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

describe("Phase 20B — Mystic Plus pricing constants", () => {
  it("defines monthly and yearly EUR pricing in one config", () => {
    expect(MYSTIC_PLUS_PRICING.currency).toBe("EUR");
    expect(MYSTIC_PLUS_PRICING.monthly.label).toBe("€4.99");
    expect(MYSTIC_PLUS_PRICING.yearly.label).toBe("€39.99");
    expect(MYSTIC_PLUS_PRICING.yearly.savingsPercent).toBe(33);
    expect(DEFAULT_MYSTIC_PLUS_PLAN).toBe("yearly");
  });

  it("uses pricing constants in paywall plans component", () => {
    const plans = readSource(
      "src/features/premium/components/mystic-plus-paywall-plans.tsx",
    );
    const screen = readSource(
      "src/features/premium/components/mystic-plus-paywall-screen.tsx",
    );

    expect(plans).toContain("MYSTIC_PLUS_PRICING");
    expect(plans).toContain("DEFAULT_MYSTIC_PLUS_PLAN");
    expect(screen).toContain("MysticPlusPaywallPlans");
    expect(screen).not.toContain('"€4.99"');
  });
});

describe("Phase 20B — paywall plan cards", () => {
  it("renders monthly and yearly prices from shared config", () => {
    const plans = readSource(
      "src/features/premium/components/mystic-plus-paywall-plans.tsx",
    );

    expect(plans).toContain("monthly.label");
    expect(plans).toContain("yearly.label");
    expect(plans).toContain("yearlyBadge");
    expect(plans).toContain("mystic-plus-plan-card--recommended");
  });

  it("defaults selected plan to yearly", () => {
    const plans = readSource(
      "src/features/premium/components/mystic-plus-paywall-plans.tsx",
    );

    expect(plans).toContain("DEFAULT_MYSTIC_PLUS_PLAN");
    expect(plans).toContain("mystic-plus-plan-card--selected");
  });

  it("exposes EN and RU plan copy with savings", () => {
    expect(en.premium.paywall.monthlyTitle).toBe("Monthly");
    expect(en.premium.paywall.yearlyBadge).toBe("Best value");
    expect(ru.premium.paywall.monthlyTitle).toBe("Месячный");
    expect(ru.premium.paywall.yearlyBadge).toBe("Лучший выбор");
    expect(en.premium.paywall.yearlyDescription).toContain("{percent}");
  });
});

describe("Phase 20B — payment CTA honesty", () => {
  it("keeps Mystic Plus payment unwired", () => {
    expect(WEB_MYSTIC_PLUS_PAYMENT_WIRED).toBe(false);
  });

  it("shows disabled coming-soon CTA and honest note", () => {
    const plans = readSource(
      "src/features/premium/components/mystic-plus-paywall-plans.tsx",
    );

    expect(plans).toContain("disabled");
    expect(plans).toContain("paymentComingLater");
    expect(plans).toContain("paymentNotWiredNote");
    expect(plans).not.toContain("createCheckout");
    expect(plans).not.toContain("shopify");
    expect(plans).not.toContain("setPremium");
  });
});

describe("Phase 20B — active premium state", () => {
  it("shows active access block instead of plan cards for entitled users", () => {
    const screen = readSource(
      "src/features/premium/components/mystic-plus-paywall-screen.tsx",
    );

    expect(screen).toContain("activeAccessNote");
    expect(screen).toContain("hasAccess");
    expect(screen).toContain("MysticPlusPaywallPlans");
    expect(en.premium.paywall.statusActive).toBe("Mystic Plus is active");
    expect(ru.premium.paywall.activeAccessNote).toContain("полному разбору");
  });

  it("resolves premium, owner, and dev override as active", () => {
    expect(hasPremiumEntitlement(profileWith({ isPremium: true }), null)).toBe(true);
    expect(hasPremiumEntitlement(profileWith({ isOwner: true }), null)).toBe(true);
    expect(hasPremiumEntitlement(profileWith({ premiumOverride: true }), null)).toBe(true);
  });
});

describe("Phase 20B — Profile pricing hint", () => {
  it("shows from-monthly pricing on Profile for free users", () => {
    const section = readSource(
      "src/features/profile/components/profile-subscription-section.tsx",
    );

    expect(section).toContain("MYSTIC_PLUS_PRICING");
    expect(section).toContain("pricingFromMonthly");
    expect(en.profile.subscription.pricingFromMonthly).toBe("From {price}/month");
    expect(ru.profile.subscription.pricingFromMonthly).toBe("От {price} в месяц");
  });
});

describe("Phase 20B — course separation", () => {
  it("keeps paid courses separate from Mystic Plus", () => {
    expect(en.premium.paywall.courseSeparateNote).toContain("separate");
    expect(en.courses.purchaseUnavailable).toContain("separate from Mystic Plus");
  });
});
