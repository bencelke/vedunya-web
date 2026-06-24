import "server-only";

import { Timestamp } from "firebase-admin/firestore";

import type {
  MysticPlusEntitlement,
  MysticPlusEntitlementStatus,
  OwnedCourseEntitlement,
  OwnedCourseStatus,
  UserEntitlements,
} from "@/features/payments/types/payment";
import { getFirebaseAdminFirestore } from "@/lib/firebase-admin/firestore";

const USERS_COLLECTION = "users";
const ENTITLEMENTS_COLLECTION = "entitlements";
const MYSTIC_PLUS_DOC_ID = "mysticPlus";
const OWNED_COURSES_COLLECTION = "ownedCourses";

function timestampToIso(value: unknown): string | null {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  return typeof value === "string" ? value : null;
}

export async function readMysticPlusEntitlement(
  uid: string,
): Promise<MysticPlusEntitlement | null> {
  const db = getFirebaseAdminFirestore();
  if (!db) {
    return null;
  }

  const snap = await db
    .collection(USERS_COLLECTION)
    .doc(uid)
    .collection(ENTITLEMENTS_COLLECTION)
    .doc(MYSTIC_PLUS_DOC_ID)
    .get();

  if (!snap.exists) {
    return null;
  }

  const data = snap.data() ?? {};
  const status = data.status;
  const allowed: MysticPlusEntitlementStatus[] = [
    "active",
    "inactive",
    "cancelled",
    "past_due",
    "pending",
  ];

  if (!allowed.includes(status as MysticPlusEntitlementStatus)) {
    return null;
  }

  return {
    type: "mysticPlus",
    status: status as MysticPlusEntitlementStatus,
    provider: "shopify",
    startedAt: timestampToIso(data.startedAt) ?? undefined,
    currentPeriodEnd: timestampToIso(data.currentPeriodEnd) ?? undefined,
    cancelledAt: timestampToIso(data.cancelledAt) ?? undefined,
    updatedAt: timestampToIso(data.updatedAt) ?? new Date().toISOString(),
  };
}

export async function readOwnedCourseEntitlement(
  uid: string,
  courseId: string,
): Promise<OwnedCourseEntitlement | null> {
  const db = getFirebaseAdminFirestore();
  if (!db) {
    return null;
  }

  const snap = await db
    .collection(USERS_COLLECTION)
    .doc(uid)
    .collection(OWNED_COURSES_COLLECTION)
    .doc(courseId)
    .get();

  if (!snap.exists) {
    return null;
  }

  const data = snap.data() ?? {};
  const status = data.status;
  const allowed: OwnedCourseStatus[] = ["active", "refunded", "pending"];

  if (!allowed.includes(status as OwnedCourseStatus)) {
    return null;
  }

  return {
    courseId,
    status: status as OwnedCourseStatus,
    provider: "shopify",
    shopifyOrderId:
      typeof data.shopifyOrderId === "string" ? data.shopifyOrderId : undefined,
    shopifyCheckoutId:
      typeof data.shopifyCheckoutId === "string" ? data.shopifyCheckoutId : undefined,
    shopifyLineItemId:
      typeof data.shopifyLineItemId === "string" ? data.shopifyLineItemId : undefined,
    purchasedAt: timestampToIso(data.purchasedAt) ?? undefined,
    updatedAt: timestampToIso(data.updatedAt) ?? new Date().toISOString(),
  };
}

export async function writeOwnedCourseEntitlement(input: {
  uid: string;
  entitlement: Omit<OwnedCourseEntitlement, "provider" | "updatedAt">;
}): Promise<void> {
  const db = getFirebaseAdminFirestore();
  if (!db) {
    throw new Error("payments_unavailable");
  }

  const now = Timestamp.now();
  const payload: Record<string, unknown> = {
    courseId: input.entitlement.courseId,
    status: input.entitlement.status,
    provider: "shopify",
    updatedAt: now,
  };

  if (input.entitlement.shopifyOrderId) {
    payload.shopifyOrderId = input.entitlement.shopifyOrderId;
  }
  if (input.entitlement.shopifyCheckoutId) {
    payload.shopifyCheckoutId = input.entitlement.shopifyCheckoutId;
  }
  if (input.entitlement.shopifyLineItemId) {
    payload.shopifyLineItemId = input.entitlement.shopifyLineItemId;
  }
  if (input.entitlement.purchasedAt) {
    payload.purchasedAt = Timestamp.fromDate(
      new Date(input.entitlement.purchasedAt),
    );
  }

  await db
    .collection(USERS_COLLECTION)
    .doc(input.uid)
    .collection(OWNED_COURSES_COLLECTION)
    .doc(input.entitlement.courseId)
    .set(payload, { merge: true });
}

export async function loadUserEntitlements(uid: string): Promise<UserEntitlements> {
  const db = getFirebaseAdminFirestore();
  if (!db) {
    return {
      mysticPlus: null,
      ownedCourseIds: new Set(),
      ownedCourses: {},
    };
  }

  const [mysticPlus, ownedSnap] = await Promise.all([
    readMysticPlusEntitlement(uid),
    db
      .collection(USERS_COLLECTION)
      .doc(uid)
      .collection(OWNED_COURSES_COLLECTION)
      .get(),
  ]);

  const ownedCourses: Record<string, OwnedCourseEntitlement> = {};
  const ownedCourseIds = new Set<string>();

  for (const doc of ownedSnap.docs) {
    const entitlement = await readOwnedCourseEntitlement(uid, doc.id);
    if (entitlement?.status === "active") {
      ownedCourseIds.add(doc.id);
      ownedCourses[doc.id] = entitlement;
    }
  }

  return {
    mysticPlus,
    ownedCourseIds,
    ownedCourses,
  };
}

export function hasActiveMysticPlusEntitlement(
  entitlement: MysticPlusEntitlement | null,
): boolean {
  return entitlement?.status === "active";
}

export function hasActiveOwnedCourse(
  entitlements: UserEntitlements,
  courseId: string,
): boolean {
  return entitlements.ownedCourseIds.has(courseId);
}
