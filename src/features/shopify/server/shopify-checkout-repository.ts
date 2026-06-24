import "server-only";

import { Timestamp } from "firebase-admin/firestore";

import type {
  ShopifyCheckoutRecord,
  ShopifyOrderRecord,
  ShopifyPaymentEventRecord,
} from "@/features/shopify/types";
import { getFirebaseAdminFirestore } from "@/lib/firebase-admin/firestore";

const USERS_COLLECTION = "users";
const SHOPIFY_CHECKOUTS_COLLECTION = "shopifyCheckouts";
const SHOPIFY_ORDERS_COLLECTION = "shopifyOrders";
const GLOBAL_PAYMENT_EVENTS_COLLECTION = "paymentEvents";

function timestampToIso(value: unknown): string | null {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  return typeof value === "string" ? value : null;
}

function checkoutDocId(cartId: string): string {
  return cartId.replace(/[^a-zA-Z0-9_-]/g, "_");
}

export async function saveShopifyCheckoutRecord(record: ShopifyCheckoutRecord): Promise<void> {
  const db = getFirebaseAdminFirestore();
  if (!db || !record.shopifyCartId) {
    throw new Error("shopify_unavailable");
  }

  await db
    .collection(USERS_COLLECTION)
    .doc(record.uid)
    .collection(SHOPIFY_CHECKOUTS_COLLECTION)
    .doc(checkoutDocId(record.shopifyCartId))
    .set({
      ...record,
      createdAt: Timestamp.fromDate(new Date(record.createdAt)),
      updatedAt: Timestamp.fromDate(new Date(record.updatedAt)),
    });
}

export async function readShopifyCheckoutByCartId(
  cartId: string,
): Promise<ShopifyCheckoutRecord | null> {
  const db = getFirebaseAdminFirestore();
  if (!db) {
    return null;
  }

  const snap = await db
    .collectionGroup(SHOPIFY_CHECKOUTS_COLLECTION)
    .where("shopifyCartId", "==", cartId)
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
    productKey: data.productKey === "livingTheRunes" ? "livingTheRunes" : "livingTheRunes",
    productType: data.productType === "course" ? "course" : "course",
    courseId: typeof data.courseId === "string" ? data.courseId : undefined,
    shopifyCartId: typeof data.shopifyCartId === "string" ? data.shopifyCartId : cartId,
    shopifyCheckoutUrl:
      typeof data.shopifyCheckoutUrl === "string" ? data.shopifyCheckoutUrl : undefined,
    status:
      data.status === "pending" ||
      data.status === "completed" ||
      data.status === "expired"
        ? data.status
        : "created",
    createdAt: timestampToIso(data.createdAt) ?? new Date().toISOString(),
    updatedAt: timestampToIso(data.updatedAt) ?? new Date().toISOString(),
  };
}

export async function saveShopifyOrderRecord(record: ShopifyOrderRecord): Promise<void> {
  const db = getFirebaseAdminFirestore();
  if (!db) {
    throw new Error("shopify_unavailable");
  }

  await db
    .collection(USERS_COLLECTION)
    .doc(record.uid)
    .collection(SHOPIFY_ORDERS_COLLECTION)
    .doc(record.shopifyOrderId)
    .set({
      ...record,
      createdAt: Timestamp.fromDate(new Date(record.createdAt)),
      updatedAt: Timestamp.fromDate(new Date(record.updatedAt)),
    });
}

export async function readShopifyCheckoutByUidAndProduct(input: {
  uid: string;
  productKey: string;
}): Promise<ShopifyCheckoutRecord | null> {
  const db = getFirebaseAdminFirestore();
  if (!db) {
    return null;
  }

  const snap = await db
    .collection(USERS_COLLECTION)
    .doc(input.uid)
    .collection(SHOPIFY_CHECKOUTS_COLLECTION)
    .where("productKey", "==", input.productKey)
    .orderBy("updatedAt", "desc")
    .limit(1)
    .get();

  if (snap.empty) {
    return null;
  }

  const doc = snap.docs[0];
  const data = doc.data();

  return {
    uid: input.uid,
    productKey: "livingTheRunes",
    productType: "course",
    courseId: typeof data.courseId === "string" ? data.courseId : undefined,
    shopifyCartId: typeof data.shopifyCartId === "string" ? data.shopifyCartId : undefined,
    shopifyCheckoutUrl:
      typeof data.shopifyCheckoutUrl === "string" ? data.shopifyCheckoutUrl : undefined,
    status:
      data.status === "pending" ||
      data.status === "completed" ||
      data.status === "expired"
        ? data.status
        : "created",
    createdAt: timestampToIso(data.createdAt) ?? new Date().toISOString(),
    updatedAt: timestampToIso(data.updatedAt) ?? new Date().toISOString(),
  };
}

export async function hasProcessedShopifyWebhook(eventId: string): Promise<boolean> {
  const db = getFirebaseAdminFirestore();
  if (!db) {
    return false;
  }

  const snap = await db.collection(GLOBAL_PAYMENT_EVENTS_COLLECTION).doc(eventId).get();
  return snap.exists;
}

export async function markShopifyWebhookProcessed(
  event: ShopifyPaymentEventRecord,
): Promise<void> {
  const db = getFirebaseAdminFirestore();
  if (!db) {
    throw new Error("shopify_unavailable");
  }

  await db.collection(GLOBAL_PAYMENT_EVENTS_COLLECTION).doc(event.eventId).set({
    provider: "shopify",
    eventId: event.eventId,
    topic: event.topic,
    orderId: event.orderId ?? null,
    processedAt: Timestamp.fromDate(new Date(event.processedAt)),
    rawStored: false,
  });
}
