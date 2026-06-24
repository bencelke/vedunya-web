import "server-only";

import { writeOwnedCourseEntitlement } from "@/features/payments/server/entitlement-repository";

export async function grantShopifyCourseEntitlement(input: {
  uid: string;
  courseId: string;
  shopifyOrderId: string;
  shopifyCheckoutId?: string;
  shopifyLineItemId?: string;
}): Promise<void> {
  const now = new Date().toISOString();
  await writeOwnedCourseEntitlement({
    uid: input.uid,
    entitlement: {
      courseId: input.courseId,
      status: "active",
      shopifyOrderId: input.shopifyOrderId,
      shopifyCheckoutId: input.shopifyCheckoutId,
      shopifyLineItemId: input.shopifyLineItemId,
      purchasedAt: now,
    },
  });
}

export async function markShopifyCourseRefunded(input: {
  uid: string;
  courseId: string;
  shopifyOrderId: string;
}): Promise<void> {
  await writeOwnedCourseEntitlement({
    uid: input.uid,
    entitlement: {
      courseId: input.courseId,
      status: "refunded",
      shopifyOrderId: input.shopifyOrderId,
    },
  });
}

export async function markShopifyCoursePending(input: {
  uid: string;
  courseId: string;
  shopifyCheckoutId?: string;
}): Promise<void> {
  await writeOwnedCourseEntitlement({
    uid: input.uid,
    entitlement: {
      courseId: input.courseId,
      status: "pending",
      shopifyCheckoutId: input.shopifyCheckoutId,
    },
  });
}
