export type PremiumDisplayStatus = "free" | "premium" | "owner" | "devOverride";

/** @deprecated Use server-side isMysticPlusPaymentConfigured() for runtime checks. */
export const WEB_MYSTIC_PLUS_PAYMENT_WIRED = true;

/** @deprecated Use server-side isCoursePurchaseConfigured() for runtime checks. */
export const COURSE_PURCHASE_FLOW_WIRED = true;
