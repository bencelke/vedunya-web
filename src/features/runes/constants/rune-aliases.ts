import type { CanonicalRuneId } from "@/features/runes/types/rune";
import { CANONICAL_RUNE_ORDER } from "@/features/runes/constants/canonical-runes";

/** Matches Flutter `rune_asset_map.dart` `_runeKeyAliases`. */
export const RUNE_ALIASES: Record<string, CanonicalRuneId> = {
  raidho: "raido",
  kano: "kenaz",
  nautiz: "nauthiz",
  turisaz: "thurisaz",
  pertha: "perthro",
  sowulo: "sowilo",
  eiwaz: "eihwaz",
  berkana: "berkano",
};

const CANONICAL_SET = new Set<string>(CANONICAL_RUNE_ORDER);

export function normalizeRuneKey(raw: string | null | undefined): string {
  if (!raw) {
    return "";
  }
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) {
    return "";
  }
  return RUNE_ALIASES[trimmed] ?? trimmed;
}

export function resolveRuneId(
  raw: string | null | undefined,
): CanonicalRuneId | null {
  const normalized = normalizeRuneKey(raw);
  if (!normalized || !CANONICAL_SET.has(normalized)) {
    return null;
  }
  return normalized as CanonicalRuneId;
}

export function isKnownRuneKey(raw: string | null | undefined): boolean {
  return resolveRuneId(raw) !== null;
}
