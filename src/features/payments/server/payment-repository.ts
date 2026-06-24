import "server-only";

import { Timestamp } from "firebase-admin/firestore";

import type {
  MysticPlusPlanKey,
  PayPalOrderRecord,
  PayPalSubscriptionRecord,
  PaymentEventRecord,
} from "@/features/payments/types/payment";
import { getFirebaseAdminFirestore } from "@/lib/firebase-admin/firestore";

const USERS_COLLECTION = "users";
const PAYPAL_ORDERS_COLLECTION = "paypalOrders";
const PAYPAL_SUBSCRIPTIONS_COLLECTION = "paypalSubscriptions";
const PAYMENT_EVENTS_SUBCOLLECTION = "paymentEvents";
const GLOBAL_PAYMENT_EVENTS_COLLECTION = "paymentEvents";

function timestampToIso(value: unknown): string | null {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  return typeof value === "string" ? value : null;
}

export async function savePendingPayPalOrder(record: PayPalOrderRecord): Promise<void> {
  const db = getFirebaseAdminFirestore();
  if (!db) {
    throw new Error("payments_unavailable");
  }

  await db
    .collection(USERS_COLLECTION)
    .doc(record.uid)
    .collection(PAYPAL_ORDERS_COLLECTION)
    .doc(record.paypalOrderId)
    .set({
      ...record,
      createdAt: Timestamp.fromDate(new Date(record.createdAt)),
      updatedAt: Timestamp.fromDate(new Date(record.updatedAt)),
    });
}

export async function readPayPalOrder(
  uid: string,
  paypalOrderId: string,
): Promise<PayPalOrderRecord | null> {
  const db = getFirebaseAdminFirestore();
  if (!db) {
    return null;
  }

  const snap = await db
    .collection(USERS_COLLECTION)
    .doc(uid)
    .collection(PAYPAL_ORDERS_COLLECTION)
    .doc(paypalOrderId)
    .get();

  if (!snap.exists) {
    return null;
  }

  const data = snap.data() ?? {};
  return {
    uid,
    courseId: typeof data.courseId === "string" ? data.courseId : "",
    productId: typeof data.productId === "string" ? data.productId : "",
    amount: typeof data.amount === "string" ? data.amount : "",
    currency: typeof data.currency === "string" ? data.currency : "",
    status:
      data.status === "completed" ||
      data.status === "failed" ||
      data.status === "refunded"
        ? data.status
        : "pending",
    paypalOrderId,
    paypalCaptureId:
      typeof data.paypalCaptureId === "string" ? data.paypalCaptureId : undefined,
    createdAt: timestampToIso(data.createdAt) ?? new Date().toISOString(),
    updatedAt: timestampToIso(data.updatedAt) ?? new Date().toISOString(),
  };
}

export async function readPayPalOrderById(
  paypalOrderId: string,
): Promise<PayPalOrderRecord | null> {
  const db = getFirebaseAdminFirestore();
  if (!db) {
    return null;
  }

  const snap = await db
    .collectionGroup(PAYPAL_ORDERS_COLLECTION)
    .where("paypalOrderId", "==", paypalOrderId)
    .limit(1)
    .get();

  if (snap.empty) {
    return null;
  }

  const doc = snap.docs[0];
  const uid = doc.ref.parent.parent?.id;
  if (!uid) {
    return null;
  }

  return readPayPalOrder(uid, paypalOrderId);
}

export async function updatePayPalOrderStatus(input: {
  uid: string;
  paypalOrderId: string;
  status: PayPalOrderRecord["status"];
  paypalCaptureId?: string;
}): Promise<void> {
  const db = getFirebaseAdminFirestore();
  if (!db) {
    throw new Error("payments_unavailable");
  }

  const payload: Record<string, unknown> = {
    status: input.status,
    updatedAt: Timestamp.now(),
  };
  if (input.paypalCaptureId) {
    payload.paypalCaptureId = input.paypalCaptureId;
  }

  await db
    .collection(USERS_COLLECTION)
    .doc(input.uid)
    .collection(PAYPAL_ORDERS_COLLECTION)
    .doc(input.paypalOrderId)
    .set(payload, { merge: true });
}

export async function savePendingPayPalSubscription(
  record: PayPalSubscriptionRecord,
): Promise<void> {
  const db = getFirebaseAdminFirestore();
  if (!db) {
    throw new Error("payments_unavailable");
  }

  await db
    .collection(USERS_COLLECTION)
    .doc(record.uid)
    .collection(PAYPAL_SUBSCRIPTIONS_COLLECTION)
    .doc(record.paypalSubscriptionId)
    .set({
      ...record,
      createdAt: Timestamp.fromDate(new Date(record.createdAt)),
      updatedAt: Timestamp.fromDate(new Date(record.updatedAt)),
    });
}

export async function readPayPalSubscription(
  paypalSubscriptionId: string,
): Promise<PayPalSubscriptionRecord | null> {
  const db = getFirebaseAdminFirestore();
  if (!db) {
    return null;
  }

  const snap = await db
    .collectionGroup(PAYPAL_SUBSCRIPTIONS_COLLECTION)
    .where("paypalSubscriptionId", "==", paypalSubscriptionId)
    .limit(1)
    .get();

  if (snap.empty) {
    return null;
  }

  const doc = snap.docs[0];
  const data = doc.data();
  const uid = doc.ref.parent.parent?.id ?? "";

  return {
    uid,
    plan: data.plan === "yearly" ? "yearly" : "monthly",
    paypalPlanId: typeof data.paypalPlanId === "string" ? data.paypalPlanId : "",
    status:
      data.status === "active" ||
      data.status === "cancelled" ||
      data.status === "suspended" ||
      data.status === "expired" ||
      data.status === "approval_pending"
        ? data.status
        : "pending",
    paypalSubscriptionId,
    createdAt: timestampToIso(data.createdAt) ?? new Date().toISOString(),
    updatedAt: timestampToIso(data.updatedAt) ?? new Date().toISOString(),
  };
}

export async function updatePayPalSubscriptionStatus(input: {
  uid: string;
  paypalSubscriptionId: string;
  status: PayPalSubscriptionRecord["status"];
}): Promise<void> {
  const db = getFirebaseAdminFirestore();
  if (!db) {
    throw new Error("payments_unavailable");
  }

  await db
    .collection(USERS_COLLECTION)
    .doc(input.uid)
    .collection(PAYPAL_SUBSCRIPTIONS_COLLECTION)
    .doc(input.paypalSubscriptionId)
    .set(
      {
        status: input.status,
        updatedAt: Timestamp.now(),
      },
      { merge: true },
    );
}

export async function hasProcessedPaymentEvent(eventId: string): Promise<boolean> {
  const db = getFirebaseAdminFirestore();
  if (!db) {
    return false;
  }

  const snap = await db
    .collection(GLOBAL_PAYMENT_EVENTS_COLLECTION)
    .doc(eventId)
    .get();

  return snap.exists;
}

export async function markPaymentEventProcessed(input: {
  uid?: string;
  event: PaymentEventRecord;
}): Promise<void> {
  const db = getFirebaseAdminFirestore();
  if (!db) {
    throw new Error("payments_unavailable");
  }

  const payload = {
    provider: "paypal" as const,
    eventId: input.event.eventId,
    eventType: input.event.eventType,
    resourceId: input.event.resourceId ?? null,
    processedAt: Timestamp.fromDate(new Date(input.event.processedAt)),
    rawStored: input.event.rawStored,
  };

  await db
    .collection(GLOBAL_PAYMENT_EVENTS_COLLECTION)
    .doc(input.event.eventId)
    .set(payload, { merge: true });

  if (input.uid) {
    await db
      .collection(USERS_COLLECTION)
      .doc(input.uid)
      .collection(PAYMENT_EVENTS_SUBCOLLECTION)
      .doc(input.event.eventId)
      .set(payload, { merge: true });
  }
}

export type { MysticPlusPlanKey };
