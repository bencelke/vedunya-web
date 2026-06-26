import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { PAYWALL_PRICING_MESSAGE_KEYS } from "@/features/premium/paywall-message-keys";
import { mergeLocaleMessages } from "@/i18n/merge-locale-messages";
import de from "@/messages/de.json";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";

type PaywallMessages = (typeof en)["premium"]["paywall"];

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

function paywallFor(locale: "en" | "ru" | "de"): PaywallMessages {
  if (locale === "ru") {
    return ru.premium.paywall;
  }
  if (locale === "de") {
    return de.premium.paywall;
  }
  return en.premium.paywall;
}

describe("Phase 20C — paywall pricing message parity", () => {
  it.each(PAYWALL_PRICING_MESSAGE_KEYS)(
    "defines premium.paywall.%s in en, ru, and de",
    (key) => {
      for (const locale of ["en", "ru", "de"] as const) {
        const value = paywallFor(locale)[key];
        expect(value, `${locale}.premium.paywall.${key}`).toBeTruthy();
        expect(typeof value).toBe("string");
      }
    },
  );

  it("exposes RU monthly and yearly pricing labels", () => {
    expect(ru.premium.paywall.plansHeading).toBe("Выберите план");
    expect(ru.premium.paywall.monthlyTitle).toBe("Месячный");
    expect(ru.premium.paywall.monthlyInterval).toBe("в месяц");
    expect(ru.premium.paywall.yearlyTitle).toBe("Годовой");
    expect(ru.premium.paywall.yearlyInterval).toBe("в год");
    expect(ru.premium.paywall.yearlyBadge).toBe("Лучший выбор");
  });

  it("exposes RU payment-not-wired note", () => {
    expect(ru.premium.paywall.paymentNotWiredNote).toBe(
      "Подписка Mystic Plus в веб-версии пока недоступна.",
    );
  });

  it("exposes EN monthly and yearly pricing labels", () => {
    expect(en.premium.paywall.plansHeading).toBe("Choose your plan");
    expect(en.premium.paywall.monthlyTitle).toBe("Monthly");
    expect(en.premium.paywall.monthlyInterval).toBe("per month");
    expect(en.premium.paywall.yearlyTitle).toBe("Yearly");
    expect(en.premium.paywall.yearlyInterval).toBe("per year");
    expect(en.premium.paywall.yearlyBadge).toBe("Best value");
  });

  it("keeps EN payment-not-wired note for /en/plus", () => {
    expect(en.premium.paywall.paymentNotWiredNote).toBe(
      "Mystic Plus subscriptions are not active in the web version yet.",
    );
  });

  it("keeps structural DE paywall pricing keys as English fallback placeholders", () => {
    for (const key of PAYWALL_PRICING_MESSAGE_KEYS) {
      expect(de.premium.paywall[key]).toBe(en.premium.paywall[key]);
    }
  });

  it("merges missing locale keys from English in i18n request config", () => {
    const request = readSource("src/i18n/request.ts");
    expect(request).toContain("mergeLocaleMessages");
    expect(request).toContain("../messages/en.json");
  });

  it("falls back to English when a locale omits nested paywall keys", () => {
    const partialRu = {
      premium: {
        paywall: {
          monthlyTitle: "Месячный",
        },
      },
    };

    const merged = mergeLocaleMessages(
      en as Record<string, unknown>,
      partialRu,
    ) as typeof en;

    expect(merged.premium.paywall.monthlyTitle).toBe("Месячный");
    expect(merged.premium.paywall.monthlyInterval).toBe("per month");
    expect(merged.premium.paywall.paymentNotWiredNote).toBe(
      en.premium.paywall.paymentNotWiredNote,
    );
  });
});
