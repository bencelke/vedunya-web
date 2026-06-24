import "server-only";

import {
  amountsMatch,
  getMysticPlusProduct,
  getPurchasableCourse,
} from "@/features/payments/server/paypal-products";
import { paypalRequest } from "@/features/payments/server/paypal-client";
import {
  readPayPalOrder,
  readPayPalOrderById,
  readPayPalSubscription,
  savePendingPayPalOrder,
  savePendingPayPalSubscription,
  updatePayPalOrderStatus,
  updatePayPalSubscriptionStatus,
} from "@/features/payments/server/payment-repository";
import {
  writeMysticPlusEntitlement,
  writeOwnedCourseEntitlement,
} from "@/features/payments/server/entitlement-repository";
import type { MysticPlusPlanKey } from "@/features/payments/types/payment";

type PayPalOrderResponse = {
  id: string;
  status?: string;
  purchase_units?: Array<{
    amount?: { currency_code?: string; value?: string };
    custom_id?: string;
    payments?: {
      captures?: Array<{ id?: string; status?: string }>;
    };
  }>;
};

type PayPalSubscriptionResponse = {
  id: string;
  status?: string;
  plan_id?: string;
  custom_id?: string;
};

export async function createCoursePayPalOrder(input: {
  uid: string;
  courseId: string;
  returnUrl: string;
  cancelUrl: string;
}): Promise<{ orderId: string }> {
  const product = getPurchasableCourse(input.courseId);
  if (!product) {
    throw new Error("invalid_course");
  }

  const response = await paypalRequest<PayPalOrderResponse>({
    path: "/v2/checkout/orders",
    method: "POST",
    body: {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: product.courseId,
          custom_id: `${input.uid}|${product.courseId}|${product.productId}`,
          description: product.titleEn,
          amount: {
            currency_code: product.currency,
            value: product.amount,
          },
        },
      ],
      application_context: {
        return_url: input.returnUrl,
        cancel_url: input.cancelUrl,
        user_action: "PAY_NOW",
      },
    },
  });

  const now = new Date().toISOString();
  await savePendingPayPalOrder({
    uid: input.uid,
    courseId: product.courseId,
    productId: product.productId,
    amount: product.amount,
    currency: product.currency,
    status: "pending",
    paypalOrderId: response.id,
    createdAt: now,
    updatedAt: now,
  });

  return { orderId: response.id };
}

export async function captureAndVerifyCourseOrder(input: {
  uid: string;
  orderId: string;
}): Promise<{ ok: true; courseId: string; status: "completed" | "pending" }> {
  const pending = await readPayPalOrder(input.uid, input.orderId);
  if (!pending || pending.uid !== input.uid) {
    throw new Error("order_not_found");
  }

  if (pending.status === "completed") {
    return { ok: true, courseId: pending.courseId, status: "completed" };
  }

  const captured = await paypalRequest<PayPalOrderResponse>({
    path: `/v2/checkout/orders/${input.orderId}/capture`,
    method: "POST",
  });

  const unit = captured.purchase_units?.[0];
  const amount = unit?.amount;
  const capture = unit?.payments?.captures?.[0];

  if (
    captured.status !== "COMPLETED" ||
    !amount?.currency_code ||
    !amount.value ||
    capture?.status !== "COMPLETED"
  ) {
    await updatePayPalOrderStatus({
      uid: input.uid,
      paypalOrderId: input.orderId,
      status: "failed",
    });
    throw new Error("capture_not_completed");
  }

  if (
    amount.currency_code !== pending.currency ||
    !amountsMatch(pending.amount, amount.value)
  ) {
    throw new Error("amount_mismatch");
  }

  const now = new Date().toISOString();
  await writeOwnedCourseEntitlement({
    uid: input.uid,
    entitlement: {
      courseId: pending.courseId,
      status: "active",
      paypalOrderId: input.orderId,
      paypalCaptureId: capture.id,
      purchasedAt: now,
    },
  });

  await updatePayPalOrderStatus({
    uid: input.uid,
    paypalOrderId: input.orderId,
    status: "completed",
    paypalCaptureId: capture.id,
  });

  return { ok: true, courseId: pending.courseId, status: "completed" };
}

export async function createMysticPlusSubscription(input: {
  uid: string;
  plan: MysticPlusPlanKey;
  returnUrl: string;
  cancelUrl: string;
}): Promise<{ subscriptionId: string; status: string }> {
  const product = getMysticPlusProduct(input.plan);
  if (!product) {
    throw new Error("invalid_plan");
  }

  const response = await paypalRequest<PayPalSubscriptionResponse>({
    path: "/v1/billing/subscriptions",
    method: "POST",
    body: {
      plan_id: product.paypalPlanId,
      custom_id: input.uid,
      application_context: {
        return_url: input.returnUrl,
        cancel_url: input.cancelUrl,
        user_action: "SUBSCRIBE_NOW",
      },
    },
  });

  const now = new Date().toISOString();
  await savePendingPayPalSubscription({
    uid: input.uid,
    plan: input.plan,
    paypalPlanId: product.paypalPlanId,
    status:
      response.status === "APPROVAL_PENDING" ? "approval_pending" : "pending",
    paypalSubscriptionId: response.id,
    createdAt: now,
    updatedAt: now,
  });

  await writeMysticPlusEntitlement({
    uid: input.uid,
    entitlement: {
      status: "pending",
      paypalSubscriptionId: response.id,
      paypalPlanId: product.paypalPlanId,
    },
  });

  return {
    subscriptionId: response.id,
    status: response.status ?? "APPROVAL_PENDING",
  };
}

export async function grantCourseFromVerifiedCapture(input: {
  uid: string;
  paypalOrderId: string;
  paypalCaptureId?: string;
  amount?: string;
  currency?: string;
}): Promise<void> {
  const pending =
    (await readPayPalOrder(input.uid, input.paypalOrderId)) ??
    (await readPayPalOrderById(input.paypalOrderId));

  if (!pending) {
    throw new Error("order_not_found");
  }

  if (input.amount && input.currency) {
    if (
      input.currency !== pending.currency ||
      !amountsMatch(pending.amount, input.amount)
    ) {
      throw new Error("amount_mismatch");
    }
  }

  const now = new Date().toISOString();
  await writeOwnedCourseEntitlement({
    uid: pending.uid,
    entitlement: {
      courseId: pending.courseId,
      status: "active",
      paypalOrderId: input.paypalOrderId,
      paypalCaptureId: input.paypalCaptureId,
      purchasedAt: now,
    },
  });

  await updatePayPalOrderStatus({
    uid: pending.uid,
    paypalOrderId: input.paypalOrderId,
    status: "completed",
    paypalCaptureId: input.paypalCaptureId,
  });
}

export async function activateMysticPlusFromSubscription(input: {
  paypalSubscriptionId: string;
  paypalPlanId?: string;
}): Promise<void> {
  const record = await readPayPalSubscription(input.paypalSubscriptionId);
  if (!record) {
    throw new Error("subscription_not_found");
  }

  const now = new Date().toISOString();
  await writeMysticPlusEntitlement({
    uid: record.uid,
    entitlement: {
      status: "active",
      paypalSubscriptionId: input.paypalSubscriptionId,
      paypalPlanId: input.paypalPlanId ?? record.paypalPlanId,
      startedAt: now,
    },
  });

  await updatePayPalSubscriptionStatus({
    uid: record.uid,
    paypalSubscriptionId: input.paypalSubscriptionId,
    status: "active",
  });
}

export async function updateMysticPlusSubscriptionStatus(input: {
  paypalSubscriptionId: string;
  status: "cancelled" | "past_due" | "inactive" | "pending";
}): Promise<void> {
  const record = await readPayPalSubscription(input.paypalSubscriptionId);
  if (!record) {
    return;
  }

  const entitlementStatus =
    input.status === "past_due"
      ? "past_due"
      : input.status === "cancelled"
        ? "cancelled"
        : input.status === "pending"
          ? "pending"
          : "inactive";

  await writeMysticPlusEntitlement({
    uid: record.uid,
    entitlement: {
      status: entitlementStatus,
      paypalSubscriptionId: input.paypalSubscriptionId,
      paypalPlanId: record.paypalPlanId,
      cancelledAt:
        entitlementStatus === "cancelled" ? new Date().toISOString() : undefined,
    },
  });

  await updatePayPalSubscriptionStatus({
    uid: record.uid,
    paypalSubscriptionId: input.paypalSubscriptionId,
    status:
      input.status === "past_due"
        ? "suspended"
        : input.status === "cancelled"
          ? "cancelled"
          : input.status === "pending"
            ? "approval_pending"
            : "expired",
  });
}

export async function refundOwnedCourse(input: {
  paypalOrderId: string;
}): Promise<void> {
  const record = await readPayPalOrderById(input.paypalOrderId);
  if (!record) {
    return;
  }

  await writeOwnedCourseEntitlement({
    uid: record.uid,
    entitlement: {
      courseId: record.courseId,
      status: "refunded",
      paypalOrderId: input.paypalOrderId,
    },
  });

  await updatePayPalOrderStatus({
    uid: record.uid,
    paypalOrderId: input.paypalOrderId,
    status: "refunded",
  });
}
