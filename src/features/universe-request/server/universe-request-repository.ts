import "server-only";

import { Timestamp } from "firebase-admin/firestore";

import type {
  UniverseRequestCategory,
  UniverseRequestRecord,
} from "@/features/universe-request/types";
import { UNIVERSE_REQUEST_CATEGORIES } from "@/features/universe-request/types";
import { getFirebaseAdminFirestore } from "@/lib/firebase-admin/firestore";

const USERS_COLLECTION = "users";
const UNIVERSE_REQUESTS_COLLECTION = "universeRequests";
const CURRENT_DOC_ID = "current";

function timestampToIso(value: unknown): string | null {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  return typeof value === "string" ? value : null;
}

function readCategory(value: unknown): UniverseRequestCategory | null {
  if (typeof value !== "string") {
    return null;
  }
  return UNIVERSE_REQUEST_CATEGORIES.includes(value as UniverseRequestCategory)
    ? (value as UniverseRequestCategory)
    : null;
}

function normalizeRecord(data: Record<string, unknown>): UniverseRequestRecord | null {
  const text = typeof data.text === "string" ? data.text.trim() : "";
  if (!text) {
    return null;
  }

  const reminderTime =
    typeof data.reminderTime === "string" && /^\d{2}:\d{2}$/.test(data.reminderTime)
      ? data.reminderTime
      : null;

  return {
    text,
    category: readCategory(data.category),
    isActive: data.isActive !== false,
    reminderEnabled: data.reminderEnabled === true,
    reminderTime,
    createdAt: timestampToIso(data.createdAt) ?? new Date().toISOString(),
    updatedAt: timestampToIso(data.updatedAt) ?? new Date().toISOString(),
    pausedAt: timestampToIso(data.pausedAt),
  };
}

function currentRef(uid: string) {
  const db = getFirebaseAdminFirestore();
  if (!db) {
    return null;
  }

  return db
    .collection(USERS_COLLECTION)
    .doc(uid)
    .collection(UNIVERSE_REQUESTS_COLLECTION)
    .doc(CURRENT_DOC_ID);
}

export async function readUniverseRequest(
  uid: string,
): Promise<UniverseRequestRecord | null> {
  const ref = currentRef(uid);
  if (!ref) {
    return null;
  }

  const snap = await ref.get();
  if (!snap.exists) {
    return null;
  }

  const record = normalizeRecord(snap.data() ?? {});
  if (!record?.isActive) {
    return null;
  }

  return record;
}

export async function readUniverseRequestRaw(
  uid: string,
): Promise<UniverseRequestRecord | null> {
  const ref = currentRef(uid);
  if (!ref) {
    return null;
  }

  const snap = await ref.get();
  if (!snap.exists) {
    return null;
  }

  return normalizeRecord(snap.data() ?? {});
}

export async function upsertUniverseRequest(input: {
  uid: string;
  text: string;
  category: UniverseRequestCategory | null;
  reminderEnabled?: boolean;
  reminderTime?: string | null;
}): Promise<UniverseRequestRecord> {
  const ref = currentRef(input.uid);
  if (!ref) {
    throw new Error("universe_request_unavailable");
  }

  const existing = await ref.get();
  const now = Timestamp.now();
  const createdAt = existing.exists
    ? (existing.data()?.createdAt as Timestamp | undefined) ?? now
    : now;

  const payload = {
    text: input.text.trim(),
    category: input.category,
    isActive: true,
    reminderEnabled: input.reminderEnabled === true,
    reminderTime: input.reminderTime ?? null,
    createdAt,
    updatedAt: now,
    pausedAt: null,
  };

  await ref.set(payload, { merge: true });

  const record = normalizeRecord({
    ...payload,
    createdAt,
    updatedAt: now,
    pausedAt: null,
  });

  if (!record) {
    throw new Error("universe_request_invalid");
  }

  return record;
}

export async function patchUniverseRequest(input: {
  uid: string;
  text?: string;
  category?: UniverseRequestCategory | null;
  reminderEnabled?: boolean;
  reminderTime?: string | null;
  isActive?: boolean;
}): Promise<UniverseRequestRecord | null> {
  const ref = currentRef(input.uid);
  if (!ref) {
    throw new Error("universe_request_unavailable");
  }

  const existing = await ref.get();
  if (!existing.exists) {
    return null;
  }

  const now = Timestamp.now();
  const patch: Record<string, unknown> = { updatedAt: now };

  if (input.text !== undefined) {
    patch.text = input.text.trim();
  }
  if (input.category !== undefined) {
    patch.category = input.category;
  }
  if (input.reminderEnabled !== undefined) {
    patch.reminderEnabled = input.reminderEnabled;
  }
  if (input.reminderTime !== undefined) {
    patch.reminderTime = input.reminderTime;
  }
  if (input.isActive === false) {
    patch.isActive = false;
    patch.pausedAt = now;
    patch.reminderEnabled = false;
  } else if (input.isActive === true) {
    patch.isActive = true;
    patch.pausedAt = null;
  }

  await ref.set(patch, { merge: true });

  const snap = await ref.get();
  return normalizeRecord(snap.data() ?? {});
}

export async function pauseUniverseRequest(uid: string): Promise<boolean> {
  const ref = currentRef(uid);
  if (!ref) {
    throw new Error("universe_request_unavailable");
  }

  const existing = await ref.get();
  if (!existing.exists) {
    return false;
  }

  await ref.set(
    {
      isActive: false,
      reminderEnabled: false,
      pausedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
    { merge: true },
  );

  return true;
}
