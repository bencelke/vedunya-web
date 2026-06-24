export type PayPalEnvironment = "sandbox" | "live";

export type MysticPlusPlanKey = "monthly" | "yearly";

export type MysticPlusEntitlementStatus =
  | "active"
  | "inactive"
  | "cancelled"
  | "past_due"
  | "pending";

export type OwnedCourseStatus = "active" | "refunded" | "pending";

export type PayPalOrderStatus = "pending" | "completed" | "failed" | "refunded";

export type PayPalSubscriptionStatus =
  | "pending"
  | "approval_pending"
  | "active"
  | "cancelled"
  | "suspended"
  | "expired";

export type MysticPlusEntitlement = {
  type: "mysticPlus";
  status: MysticPlusEntitlementStatus;
  provider: "paypal";
  paypalSubscriptionId?: string;
  paypalPlanId?: string;
  startedAt?: string;
  currentPeriodEnd?: string;
  cancelledAt?: string;
  updatedAt: string;
};

export type OwnedCourseEntitlement = {
  courseId: string;
  status: OwnedCourseStatus;
  provider: "paypal";
  paypalOrderId?: string;
  paypalCaptureId?: string;
  purchasedAt?: string;
  updatedAt: string;
};

export type PaymentEventRecord = {
  provider: "paypal";
  eventId: string;
  eventType: string;
  resourceId?: string;
  processedAt: string;
  rawStored: boolean;
};

export type PayPalOrderRecord = {
  uid: string;
  courseId: string;
  productId: string;
  amount: string;
  currency: string;
  status: PayPalOrderStatus;
  paypalOrderId: string;
  paypalCaptureId?: string;
  createdAt: string;
  updatedAt: string;
};

export type PayPalSubscriptionRecord = {
  uid: string;
  plan: MysticPlusPlanKey;
  paypalPlanId: string;
  status: PayPalSubscriptionStatus;
  paypalSubscriptionId: string;
  createdAt: string;
  updatedAt: string;
};

export type UserEntitlements = {
  mysticPlus: MysticPlusEntitlement | null;
  ownedCourseIds: ReadonlySet<string>;
  ownedCourses: Record<string, OwnedCourseEntitlement>;
};
