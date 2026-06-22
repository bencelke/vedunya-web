import { cache } from "react";

import {
  buildLocalDeepFallback,
  buildMinimalDeepContent,
} from "@/features/runes/content/rune-detail-fallback";
import { RUNES_COLLECTION } from "@/features/runes/constants/canonical-runes";
import { resolveRuneId } from "@/features/runes/constants/rune-aliases";
import {
  computeRuneContentDaySeed,
  readTextValue,
  variantIndexForField,
} from "@/features/runes/engine/rune-content-hash";
import { runeFirestoreSchema } from "@/features/runes/schemas/rune-content-schema";
import type {
  CanonicalRuneId,
  RuneDeepContent,
  SupportedRuneLocale,
} from "@/features/runes/types/rune";
import { getFirebaseAdminFirestore } from "@/lib/firebase-admin/firestore";

const VARIANT_FIELDS = [
  "title",
  "short",
  "deep",
  "action",
  "warning",
  "affirmation",
  "reflection",
] as const;

function resolveLocaleBlock(
  data: Record<string, unknown>,
  locale: SupportedRuneLocale,
): Record<string, unknown> | null {
  const translations = data.translations;
  if (!translations || typeof translations !== "object") {
    return null;
  }

  const map = translations as Record<string, unknown>;
  const requested = map[locale];
  if (requested && typeof requested === "object") {
    return requested as Record<string, unknown>;
  }

  const fallback = map.en;
  if (fallback && typeof fallback === "object") {
    return fallback as Record<string, unknown>;
  }

  return null;
}

function mapFirestoreToDeepContent(
  runeId: CanonicalRuneId,
  locale: SupportedRuneLocale,
  data: Record<string, unknown>,
  daySeed: number,
): RuneDeepContent | null {
  const parsed = runeFirestoreSchema.safeParse(data);
  if (!parsed.success) {
    return null;
  }

  const block = resolveLocaleBlock(data, locale);
  if (!block) {
    return null;
  }

  const fields: Partial<Record<(typeof VARIANT_FIELDS)[number], string>> = {};

  for (const field of VARIANT_FIELDS) {
    const raw = block[field];
    const strings =
      Array.isArray(raw)
        ? raw.filter((item): item is string => typeof item === "string")
        : [];
    const index =
      strings.length > 0
        ? variantIndexForField({
            runeId,
            field,
            values: strings,
            daySeed,
          })
        : 0;
    fields[field] = readTextValue(raw, index) ?? "";
  }

  if (!fields.short?.trim() && !fields.deep?.trim()) {
    return null;
  }

  return {
    runeId,
    title: fields.title ?? runeId,
    short: fields.short ?? "",
    deep: fields.deep ?? "",
    action: fields.action ?? "",
    warning: fields.warning ?? "",
    affirmation: fields.affirmation ?? "",
    reflection: fields.reflection ?? "",
  };
}

export type RuneDeepLoadResult = {
  content: RuneDeepContent;
  source: "firestore" | "fallback" | "minimal";
};

export async function loadRuneDeepContent(
  rawRuneId: string,
  locale: SupportedRuneLocale,
): Promise<RuneDeepLoadResult | null> {
  const runeId = resolveRuneId(rawRuneId);
  if (!runeId) {
    return null;
  }

  const daySeed = computeRuneContentDaySeed();
  const db = getFirebaseAdminFirestore();

  if (db) {
    try {
      const doc = await db.collection(RUNES_COLLECTION).doc(runeId).get();
      if (doc.exists) {
        const data = doc.data();
        if (data) {
          const mapped = mapFirestoreToDeepContent(runeId, locale, data, daySeed);
          if (mapped) {
            return { content: mapped, source: "firestore" };
          }
        }
      }
    } catch {
      // fall through to local fallback
    }
  }

  const local = buildLocalDeepFallback(runeId, locale);
  if (local) {
    return { content: local, source: "fallback" };
  }

  return {
    content: buildMinimalDeepContent(runeId, locale),
    source: "minimal",
  };
}

export const getCachedRuneDeepContent = cache(
  async (runeId: CanonicalRuneId, locale: SupportedRuneLocale) =>
    loadRuneDeepContent(runeId, locale),
);
