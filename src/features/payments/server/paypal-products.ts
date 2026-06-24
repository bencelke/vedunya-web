import "server-only";

import {
  LIVING_THE_RUNES_COURSE_ID,
  LIVING_THE_RUNES_PRODUCT_ID,
} from "@/features/courses/constants/course-ids";
import type { MysticPlusPlanKey } from "@/features/payments/types/payment";
import { getPayPalConfig } from "@/features/payments/server/paypal-config";

export type CourseProduct = {
  courseId: string;
  productId: string;
  amount: string;
  currency: string;
  titleEn: string;
  titleRu: string;
};

export type MysticPlusProduct = {
  plan: MysticPlusPlanKey;
  amount: string;
  currency: string;
  paypalPlanId: string;
  titleEn: string;
  titleRu: string;
};

/** Placeholder pricing — confirm before live mode. */
export const MYSTIC_PLUS_MONTHLY_AMOUNT = "9.99";
export const MYSTIC_PLUS_YEARLY_AMOUNT = "79.99";
export const LIVING_THE_RUNES_AMOUNT = "79.00";

const COURSE_PRODUCTS: Record<string, CourseProduct> = {
  [LIVING_THE_RUNES_COURSE_ID]: {
    courseId: LIVING_THE_RUNES_COURSE_ID,
    productId: LIVING_THE_RUNES_PRODUCT_ID,
    amount: LIVING_THE_RUNES_AMOUNT,
    currency: "EUR",
    titleEn: "Living the Runes: 24 Steps to Inner Strength",
    titleRu: "Проживание Рун: 24 шага к внутренней силе",
  },
};

export function getPurchasableCourse(courseId: string): CourseProduct | null {
  return COURSE_PRODUCTS[courseId.trim()] ?? null;
}

export function listPurchasableCourseIds(): string[] {
  return Object.keys(COURSE_PRODUCTS);
}

export function getMysticPlusProduct(plan: MysticPlusPlanKey): MysticPlusProduct | null {
  const config = getPayPalConfig();
  if (!config) {
    return null;
  }

  const paypalPlanId =
    plan === "monthly" ? config.monthlyPlanId : config.yearlyPlanId;
  if (!paypalPlanId) {
    return null;
  }

  return {
    plan,
    amount: plan === "monthly" ? MYSTIC_PLUS_MONTHLY_AMOUNT : MYSTIC_PLUS_YEARLY_AMOUNT,
    currency: config.currency,
    paypalPlanId,
    titleEn: plan === "monthly" ? "Mystic Plus Monthly" : "Mystic Plus Yearly",
    titleRu: plan === "monthly" ? "Mystic Plus — месяц" : "Mystic Plus — год",
  };
}

export function amountsMatch(expected: string, actual: string): boolean {
  return Number.parseFloat(expected).toFixed(2) === Number.parseFloat(actual).toFixed(2);
}
