import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  hasPremiumEntitlement,
  resolvePremiumDisplayStatus,
} from "@/features/premium/utils/resolve-premium-display-status";
import type { ProfileSnapshot } from "@/features/profile/types/user-profile";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";

const WEB_ROOT = process.cwd();
const FORBIDDEN_VISIBLE_COPY = [
  "Subscribe now",
  "Start free trial",
  "Restore purchases",
  "Manage subscription",
  "Payment successful",
  "Buy now",
] as const;

function readSource(relativePath: string): string {
  return readFileSync(resolve(WEB_ROOT, relativePath), "utf8");
}

function profileWith(
  flags: Partial<NonNullable<ProfileSnapshot["publicProfile"]>>,
): ProfileSnapshot {
  return {
    uid: "user-1",
    displayName: "Maria",
    email: "maria@example.com",
    dateOfBirth: new Date("1990-01-01"),
    language: "en",
    profileComplete: true,
    authProviders: ["password"],
    publicProfile: {
      uid: "user-1",
      displayName: "Maria",
      isPremium: false,
      premiumOverride: false,
      isOwner: false,
      ...flags,
    },
    privateProfile: null,
  };
}

describe("Phase 12E — entitlement display", () => {
  it("resolves free, premium, owner, and devOverride states", () => {
    expect(resolvePremiumDisplayStatus(profileWith({}))).toBe("free");
    expect(resolvePremiumDisplayStatus(profileWith({ isPremium: true }))).toBe("premium");
    expect(resolvePremiumDisplayStatus(profileWith({ isOwner: true }))).toBe("owner");
    expect(
      resolvePremiumDisplayStatus(profileWith({ premiumOverride: true })),
    ).toBe("devOverride");
  });

  it("grants access for premium, owner, and devOverride only from profile fields", () => {
    expect(hasPremiumEntitlement(profileWith({}))).toBe(false);
    expect(hasPremiumEntitlement(profileWith({ isPremium: true }))).toBe(true);
    expect(hasPremiumEntitlement(profileWith({ isOwner: true }))).toBe(true);
    expect(hasPremiumEntitlement(profileWith({ premiumOverride: true }))).toBe(true);
  });
});

describe("Phase 12E — Profile Mystic Plus section", () => {
  it("renders subscription section with premium namespace and PayPal buttons", () => {
    const source = readSource(
      "src/features/profile/components/profile-subscription-section.tsx",
    );
    expect(source).toContain("resolvePremiumDisplayStatus");
    expect(source).toContain('useTranslations("premium")');
    expect(source).toContain("MysticPlusPayPalButtons");
    expect(source).toContain("PaymentStatusNotice");
  });

  it("shows Mystic Plus labels in EN and RU", () => {
    expect(en.premium.productName).toBe("Mystic Plus");
    expect(ru.premium.productName).toBe("Mystic Plus");
    expect(en.premium.statusFree).toContain("Free");
    expect(ru.premium.statusFree).toContain("бесплатный");
  });
});

describe("Phase 12E — premium lock cards", () => {
  it("uses shared MysticPlusLockCard across surfaces", () => {
    expect(readSource("src/features/today/components/today-premium-lock-card.tsx")).toContain(
      "MysticPlusLockCard",
    );
    expect(readSource("src/features/daily-guidance/components/daily-guidance-authenticated.tsx")).toContain(
      "MysticPlusLockCard",
    );
    expect(readSource("src/features/moon/components/moon-guidance-section.tsx")).toContain(
      "MysticPlusLockCard",
    );
    expect(readSource("src/features/runes/components/rune-detail-content.tsx")).toContain(
      "MysticPlusLockCard",
    );
  });

  it("uses disabled payment placeholder instead of fake checkout", () => {
    const lockCard = readSource("src/features/premium/components/mystic-plus-lock-card.tsx");
    expect(lockCard).toContain("disabled");
    expect(lockCard).toContain("paymentComingLater");
    expect(lockCard).not.toContain("Subscribe");
    expect(lockCard).not.toContain("Restore");
  });

  it("includes consistent EN/RU lock copy", () => {
    expect(en.premium.lockTitle).toBe("Mystic Plus");
    expect(en.premium.lockBody).toContain("deeper guidance");
    expect(ru.premium.lockBody).toContain("премиум-практики");
    expect(en.premium.todayDepthNote).toContain("Mystic Plus");
    expect(ru.premium.todayDepthNote).toContain("Mystic Plus");
  });
});

describe("Phase 12E — course purchase placeholder", () => {
  it("uses purchase-soon copy separate from Mystic Plus", () => {
    expect(en.courses.purchaseUnavailable).toContain("purchase soon");
    expect(en.courses.purchaseUnavailable).toContain("separate from Mystic Plus");
    expect(ru.courses.purchaseUnavailable).toContain("покупки");
    expect(ru.courses.purchaseUnavailable).toContain("отдельны от Mystic Plus");
  });

  it("distinguishes premium-locked courses from paid courses in course pages", () => {
    const coursePage = readSource("src/app/[locale]/courses/[slug]/page.tsx");
    expect(coursePage).toContain("isPremiumLocked");
    expect(coursePage).toContain('getTranslations("premium")');
  });
});

describe("Phase 12E — forbidden fake payment copy", () => {
  it("does not expose forbidden purchase strings in premium UI sources", () => {
    const sources = [
      "src/features/premium/components/mystic-plus-lock-card.tsx",
      "src/features/profile/components/profile-subscription-section.tsx",
      "src/features/daily-guidance/components/daily-guidance-authenticated.tsx",
    ];

    for (const path of sources) {
      const source = readSource(path);
      for (const phrase of FORBIDDEN_VISIBLE_COPY) {
        expect(source).not.toContain(phrase);
      }
    }
  });

  it("RU premium namespace avoids known EN fallback strings", () => {
    const ruPremium = JSON.stringify(ru.premium);
    expect(ruPremium).not.toContain("Status: Free");
    expect(ruPremium).not.toContain("Payment setup coming later");
    expect(ruPremium).not.toContain("Unlock deeper guidance");
  });
});
