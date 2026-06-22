import { cache } from "react";

import { fallbackMoonPhaseById } from "@/features/moon/content/moon-phase-fallback.en";
import {
  LUNAR_DAYS_COLLECTION,
  MOON_PHASES_COLLECTION,
} from "@/features/moon/constants";
import {
  lunarDayFirestoreSchema,
  moonPhaseFirestoreSchema,
} from "@/features/moon/schemas/moon-content-schema";
import type {
  LunarDayContentRecord,
  MoonPhase4Id,
  MoonPhaseContentRecord,
  SupportedMoonLocale,
} from "@/features/moon/types/moon";
import { getFirebaseAdminFirestore } from "@/lib/firebase-admin/firestore";

function mergePhaseField(
  firestoreValue: string | undefined,
  fallbackValue: string,
): string {
  const trimmed = firestoreValue?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallbackValue;
}

function mergePhaseContent(
  id: MoonPhase4Id,
  fallback: MoonPhaseContentRecord,
  data: Record<string, unknown>,
): MoonPhaseContentRecord {
  const parsed = moonPhaseFirestoreSchema.safeParse(data);
  if (!parsed.success) {
    return fallback;
  }

  const fields = parsed.data;
  return {
    id,
    titleRu: mergePhaseField(fields.titleRu, fallback.titleRu),
    titleEn: mergePhaseField(fields.titleEn, fallback.titleEn),
    shortRu: mergePhaseField(fields.shortRu, fallback.shortRu),
    shortEn: mergePhaseField(fields.shortEn, fallback.shortEn),
    deepRu: mergePhaseField(fields.deepRu, fallback.deepRu),
    deepEn: mergePhaseField(fields.deepEn, fallback.deepEn),
    actionRu: mergePhaseField(fields.actionRu, fallback.actionRu),
    actionEn: mergePhaseField(fields.actionEn, fallback.actionEn),
    warningRu: mergePhaseField(fields.warningRu, fallback.warningRu),
    warningEn: mergePhaseField(fields.warningEn, fallback.warningEn),
  };
}

function readTranslationBlock(
  data: Record<string, unknown>,
  locale: SupportedMoonLocale,
): Record<string, unknown> | null {
  const translations = data.translations;
  if (translations && typeof translations === "object") {
    const block = (translations as Record<string, unknown>)[locale];
    if (block && typeof block === "object") {
      return block as Record<string, unknown>;
    }
  }

  const direct = data[locale];
  if (direct && typeof direct === "object") {
    return direct as Record<string, unknown>;
  }

  return null;
}

function parseLunarDayRecord(
  lunarDayNumber: number,
  data: Record<string, unknown>,
): LunarDayContentRecord | null {
  const parsed = lunarDayFirestoreSchema.safeParse(data);
  if (!parsed.success) {
    return null;
  }

  const readField = (
    block: Record<string, unknown> | null,
    key: string,
  ): string => {
    const value = block?.[key];
    return typeof value === "string" ? value.trim() : "";
  };

  const ruBlock = readTranslationBlock(data, "ru");
  const enBlock = readTranslationBlock(data, "en");

  const ru = {
    title: readField(ruBlock, "title"),
    short: readField(ruBlock, "short"),
    deep: readField(ruBlock, "deep"),
    focus: readField(ruBlock, "focus"),
    action: readField(ruBlock, "action"),
    warning: readField(ruBlock, "warning"),
    ritual: readField(ruBlock, "ritual"),
    reflection: readField(ruBlock, "reflection"),
  };
  const en = {
    title: readField(enBlock, "title"),
    short: readField(enBlock, "short"),
    deep: readField(enBlock, "deep"),
    focus: readField(enBlock, "focus"),
    action: readField(enBlock, "action"),
    warning: readField(enBlock, "warning"),
    ritual: readField(enBlock, "ritual"),
    reflection: readField(enBlock, "reflection"),
  };

  if (!ru.short && !en.short) {
    return null;
  }

  return {
    day: parsed.data.day ?? lunarDayNumber,
    energyLevel: parsed.data.energyLevel ?? "",
    focusKey: parsed.data.focusKey ?? "",
    ru,
    en,
  };
}

export type MoonPhaseLoadResult = {
  record: MoonPhaseContentRecord;
  source: "firestore" | "fallback";
};

export type LunarDayLoadResult = {
  record: LunarDayContentRecord | null;
  source: "firestore" | "missing";
};

export async function loadMoonPhaseContent(
  phaseId: MoonPhase4Id,
): Promise<MoonPhaseLoadResult> {
  const fallback = fallbackMoonPhaseById(phaseId);
  const db = getFirebaseAdminFirestore();

  if (!db) {
    return { record: fallback, source: "fallback" };
  }

  try {
    const doc = await db
      .collection(MOON_PHASES_COLLECTION)
      .doc(phaseId)
      .get();

    if (!doc.exists) {
      return { record: fallback, source: "fallback" };
    }

    const data = doc.data();
    if (!data) {
      return { record: fallback, source: "fallback" };
    }

    return {
      record: mergePhaseContent(phaseId, fallback, data),
      source: "firestore",
    };
  } catch {
    return { record: fallback, source: "fallback" };
  }
}

export async function loadLunarDayContent(
  lunarDayNumber: number,
): Promise<LunarDayLoadResult> {
  if (lunarDayNumber < 1 || lunarDayNumber > 30) {
    return { record: null, source: "missing" };
  }

  const db = getFirebaseAdminFirestore();
  if (!db) {
    return { record: null, source: "missing" };
  }

  try {
    const doc = await db
      .collection(LUNAR_DAYS_COLLECTION)
      .doc(String(lunarDayNumber))
      .get();

    if (!doc.exists) {
      return { record: null, source: "missing" };
    }

    const data = doc.data();
    if (!data) {
      return { record: null, source: "missing" };
    }

    const record = parseLunarDayRecord(lunarDayNumber, data);
    return {
      record,
      source: record ? "firestore" : "missing",
    };
  } catch {
    return { record: null, source: "missing" };
  }
}

export const getCachedMoonPhaseContent = cache(loadMoonPhaseContent);
export const getCachedLunarDayContent = cache(loadLunarDayContent);
