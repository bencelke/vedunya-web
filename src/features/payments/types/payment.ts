export type MysticPlusEntitlementStatus =
  | "active"
  | "inactive"
  | "cancelled"
  | "past_due"
  | "pending";

export type OwnedCourseStatus = "active" | "refunded" | "pending";

export type MysticPlusEntitlement = {
  type: "mysticPlus";
  status: MysticPlusEntitlementStatus;
  provider: "shopify" | "legacy";
  startedAt?: string;
  currentPeriodEnd?: string;
  cancelledAt?: string;
  updatedAt: string;
};

export type OwnedCourseEntitlement = {
  courseId: string;
  status: OwnedCourseStatus;
  provider: "shopify";
  shopifyOrderId?: string;
  shopifyCheckoutId?: string;
  shopifyLineItemId?: string;
  purchasedAt?: string;
  updatedAt: string;
};

export type UserEntitlements = {
  mysticPlus: MysticPlusEntitlement | null;
  ownedCourseIds: ReadonlySet<string>;
  ownedCourses: Record<string, OwnedCourseEntitlement>;
};
