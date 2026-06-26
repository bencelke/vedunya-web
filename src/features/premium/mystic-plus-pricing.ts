export const MYSTIC_PLUS_PRICING = {
  currency: "EUR",
  monthly: {
    amount: 4.99,
    label: "€4.99",
    interval: "month",
  },
  yearly: {
    amount: 39.99,
    label: "€39.99",
    interval: "year",
    savingsPercent: 33,
  },
} as const;

export type MysticPlusPlanId = "monthly" | "yearly";

export const DEFAULT_MYSTIC_PLUS_PLAN: MysticPlusPlanId = "yearly";
