import { FieldValue, Timestamp } from "firebase-admin/firestore";

import type { SupportedLocale } from "@/config/app-config";
import type {
  NotificationPreferencesRecord,
  PushPlatform,
  PushSubscriptionKeys,
  PushSubscriptionRecord,
} from "@/features/notifications/types/push";
import { hashSubscriptionEndpoint } from "@/features/notifications/utils/subscription-hash";
import { getFirebaseAdminFirestore } from "@/lib/firebase-admin/firestore";

const USERS_COLLECTION = "users";
const PUSH_SUBSCRIPTIONS_SUBCOLLECTION = "pushSubscriptions";
const NOTIFICATION_PREFERENCES_COLLECTION = "notificationPreferences";
const NOTIFICATION_PREFERENCES_DOC_ID = "default";

export { hashSubscriptionEndpoint };

function timestampToIso(value: unknown): string | null {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  return typeof value === "string" ? value : null;
}

function readKeys(value: unknown): PushSubscriptionKeys | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const p256dh = typeof record.p256dh === "string" ? record.p256dh : "";
  const auth = typeof record.auth === "string" ? record.auth : "";
  if (!p256dh || !auth) {
    return null;
  }

  return { p256dh, auth };
}

function normalizeSubscription(
  data: Record<string, unknown>,
  endpoint: string,
): PushSubscriptionRecord | null {
  const keys = readKeys(data.keys);
  if (!keys) {
    return null;
  }

  const locale = data.locale === "ru" ? "ru" : "en";
  const platform =
    data.platform === "ios" ||
    data.platform === "android" ||
    data.platform === "desktop"
      ? data.platform
      : "unknown";

  return {
    endpoint: typeof data.endpoint === "string" ? data.endpoint : endpoint,
    keys,
    userAgent:
      typeof data.userAgent === "string" ? data.userAgent.slice(0, 512) : undefined,
    platform,
    locale,
    timezone:
      typeof data.timezone === "string" && data.timezone.trim()
        ? data.timezone.trim()
        : "UTC",
    enabled: data.enabled !== false,
    createdAt: timestampToIso(data.createdAt) ?? new Date().toISOString(),
    updatedAt: timestampToIso(data.updatedAt) ?? new Date().toISOString(),
    lastSeenAt: timestampToIso(data.lastSeenAt) ?? new Date().toISOString(),
    lastSuccessAt: timestampToIso(data.lastSuccessAt) ?? undefined,
    lastFailureAt: timestampToIso(data.lastFailureAt) ?? undefined,
    failureCount:
      typeof data.failureCount === "number" ? data.failureCount : undefined,
  };
}

export function defaultNotificationPreferences(
  locale: SupportedLocale,
  timezone = "UTC",
): NotificationPreferencesRecord {
  return {
    enabled: false,
    morning: { enabled: true, time: "08:30" },
    midday: { enabled: true, time: "13:00" },
    evening: { enabled: true, time: "20:30" },
    universeRequest: { enabled: false, time: "09:00" },
    timezone,
    locale,
    updatedAt: new Date().toISOString(),
  };
}

function normalizePreferences(
  data: Record<string, unknown> | undefined,
  fallbackLocale: SupportedLocale,
): NotificationPreferencesRecord {
  if (!data) {
    return defaultNotificationPreferences(fallbackLocale);
  }

  const readSlot = (value: unknown, fallbackTime: string) => {
    if (!value || typeof value !== "object") {
      return { enabled: true, time: fallbackTime };
    }
    const slot = value as Record<string, unknown>;
    const time =
      typeof slot.time === "string" && /^\d{2}:\d{2}$/.test(slot.time)
        ? slot.time
        : fallbackTime;
    return { enabled: slot.enabled !== false, time };
  };

  return {
    enabled: data.enabled === true,
    morning: readSlot(data.morning, "08:30"),
    midday: readSlot(data.midday, "13:00"),
    evening: readSlot(data.evening, "20:30"),
    universeRequest: readSlot(data.universeRequest, "09:00"),
    timezone:
      typeof data.timezone === "string" && data.timezone.trim()
        ? data.timezone.trim()
        : "UTC",
    locale: data.locale === "ru" ? "ru" : fallbackLocale,
    updatedAt: timestampToIso(data.updatedAt) ?? new Date().toISOString(),
  };
}

export async function readNotificationPreferences(
  uid: string,
  locale: SupportedLocale,
): Promise<NotificationPreferencesRecord> {
  const db = getFirebaseAdminFirestore();
  if (!db) {
    return defaultNotificationPreferences(locale);
  }

  const snap = await db
    .collection(USERS_COLLECTION)
    .doc(uid)
    .collection(NOTIFICATION_PREFERENCES_COLLECTION)
    .doc(NOTIFICATION_PREFERENCES_DOC_ID)
    .get();

  if (!snap.exists) {
    return defaultNotificationPreferences(locale);
  }

  return normalizePreferences(snap.data(), locale);
}

export async function mergeNotificationPreferences(input: {
  uid: string;
  preferences: NotificationPreferencesRecord;
}): Promise<NotificationPreferencesRecord> {
  const db = getFirebaseAdminFirestore();
  if (!db) {
    throw new Error("push_unavailable");
  }

  const ref = db
    .collection(USERS_COLLECTION)
    .doc(input.uid)
    .collection(NOTIFICATION_PREFERENCES_COLLECTION)
    .doc(NOTIFICATION_PREFERENCES_DOC_ID);

  const payload = {
    ...input.preferences,
    updatedAt: Timestamp.now(),
  };

  await ref.set(payload, { merge: true });

  return readNotificationPreferences(input.uid, input.preferences.locale);
}

export async function mergePushSubscription(input: {
  uid: string;
  endpoint: string;
  keys: PushSubscriptionKeys;
  userAgent?: string;
  platform: PushPlatform;
  locale: SupportedLocale;
  timezone: string;
}): Promise<PushSubscriptionRecord> {
  const db = getFirebaseAdminFirestore();
  if (!db) {
    throw new Error("push_unavailable");
  }

  const docId = hashSubscriptionEndpoint(input.endpoint);
  const ref = db
    .collection(USERS_COLLECTION)
    .doc(input.uid)
    .collection(PUSH_SUBSCRIPTIONS_SUBCOLLECTION)
    .doc(docId);

  const now = Timestamp.now();

  await db.runTransaction(async (txn) => {
    const snap = await txn.get(ref);
    const existing = snap.data() ?? {};
    const payload: Record<string, unknown> = {
      endpoint: input.endpoint,
      keys: input.keys,
      userAgent: input.userAgent?.slice(0, 512),
      platform: input.platform,
      locale: input.locale,
      timezone: input.timezone,
      enabled: true,
      updatedAt: now,
      lastSeenAt: now,
    };

    if (!existing.createdAt) {
      payload.createdAt = now;
    }

    txn.set(ref, payload, { merge: true });
  });

  const saved = await ref.get();
  const normalized = normalizeSubscription(saved.data() ?? {}, input.endpoint);
  if (!normalized) {
    throw new Error("push_unavailable");
  }
  return normalized;
}

export async function disablePushSubscription(input: {
  uid: string;
  endpoint: string;
}): Promise<void> {
  const db = getFirebaseAdminFirestore();
  if (!db) {
    throw new Error("push_unavailable");
  }

  const docId = hashSubscriptionEndpoint(input.endpoint);
  const ref = db
    .collection(USERS_COLLECTION)
    .doc(input.uid)
    .collection(PUSH_SUBSCRIPTIONS_SUBCOLLECTION)
    .doc(docId);

  await ref.set(
    {
      enabled: false,
      updatedAt: Timestamp.now(),
    },
    { merge: true },
  );
}

export async function removePushSubscription(input: {
  uid: string;
  endpoint: string;
}): Promise<void> {
  const db = getFirebaseAdminFirestore();
  if (!db) {
    throw new Error("push_unavailable");
  }

  const docId = hashSubscriptionEndpoint(input.endpoint);
  await db
    .collection(USERS_COLLECTION)
    .doc(input.uid)
    .collection(PUSH_SUBSCRIPTIONS_SUBCOLLECTION)
    .doc(docId)
    .delete();
}

export async function readEnabledPushSubscriptions(
  uid: string,
): Promise<PushSubscriptionRecord[]> {
  const db = getFirebaseAdminFirestore();
  if (!db) {
    return [];
  }

  const snap = await db
    .collection(USERS_COLLECTION)
    .doc(uid)
    .collection(PUSH_SUBSCRIPTIONS_SUBCOLLECTION)
    .where("enabled", "==", true)
    .get();

  const records: PushSubscriptionRecord[] = [];
  for (const doc of snap.docs) {
    const data = doc.data();
    const endpoint =
      data && typeof data.endpoint === "string" ? data.endpoint : "";
    const normalized = normalizeSubscription(data, endpoint);
    if (normalized?.enabled) {
      records.push(normalized);
    }
  }
  return records;
}

export async function readPushSubscriptionByEndpoint(input: {
  uid: string;
  endpoint: string;
}): Promise<PushSubscriptionRecord | null> {
  const db = getFirebaseAdminFirestore();
  if (!db) {
    return null;
  }

  const docId = hashSubscriptionEndpoint(input.endpoint);
  const snap = await db
    .collection(USERS_COLLECTION)
    .doc(input.uid)
    .collection(PUSH_SUBSCRIPTIONS_SUBCOLLECTION)
    .doc(docId)
    .get();

  if (!snap.exists) {
    return null;
  }

  return normalizeSubscription(snap.data() ?? {}, input.endpoint);
}

export async function markPushSubscriptionResult(input: {
  uid: string;
  endpoint: string;
  success: boolean;
  remove?: boolean;
}): Promise<void> {
  const db = getFirebaseAdminFirestore();
  if (!db) {
    return;
  }

  const docId = hashSubscriptionEndpoint(input.endpoint);
  const ref = db
    .collection(USERS_COLLECTION)
    .doc(input.uid)
    .collection(PUSH_SUBSCRIPTIONS_SUBCOLLECTION)
    .doc(docId);

  if (input.remove) {
    await ref.delete();
    return;
  }

  const now = Timestamp.now();
  await ref.set(
    input.success
      ? {
          lastSuccessAt: now,
          failureCount: 0,
          updatedAt: now,
        }
      : {
          lastFailureAt: now,
          failureCount: FieldValue.increment(1),
          updatedAt: now,
        },
    { merge: true },
  );
}
