/** Keys read by `MysticPlusPaywallPlans` under `premium.paywall`. */
export const PAYWALL_PRICING_MESSAGE_KEYS = [
  "plansHeading",
  "monthlyTitle",
  "monthlyInterval",
  "monthlyDescription",
  "yearlyTitle",
  "yearlyInterval",
  "yearlyDescription",
  "yearlyBadge",
  "paymentComingLater",
  "paymentNotWiredNote",
] as const;

export type PaywallPricingMessageKey =
  (typeof PAYWALL_PRICING_MESSAGE_KEYS)[number];
