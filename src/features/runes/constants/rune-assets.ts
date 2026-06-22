import {
  CANONICAL_RUNE_BY_ID,
  type CanonicalRuneDefinition,
} from "@/features/runes/constants/canonical-runes";
import { resolveRuneId } from "@/features/runes/constants/rune-aliases";
import type { CanonicalRuneId } from "@/features/runes/types/rune";

export function getRuneAssetPath(runeId: CanonicalRuneId): string {
  return CANONICAL_RUNE_BY_ID[runeId].assetPath;
}

export function getRuneAssetPathForKey(
  raw: string | null | undefined,
): string | null {
  const runeId = resolveRuneId(raw);
  return runeId ? getRuneAssetPath(runeId) : null;
}

export function getRuneDefinition(
  runeId: CanonicalRuneId,
): CanonicalRuneDefinition {
  return CANONICAL_RUNE_BY_ID[runeId];
}

export function getRuneUnicodeGlyph(runeId: CanonicalRuneId): string {
  return CANONICAL_RUNE_BY_ID[runeId].unicodeGlyph;
}
