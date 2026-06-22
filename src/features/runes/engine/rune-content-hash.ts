/** FNV-1a 32-bit — matches Flutter `RuneContentService._stableHash`. */
export function stableHash(input: string): number {
  let hash = 2_166_136_261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16_777_619);
  }
  return Math.abs(hash >>> 0);
}

export function variantIndexForField(input: {
  runeId: string;
  field: string;
  values: string[];
  daySeed: number;
}): number {
  if (input.values.length === 0) {
    return 0;
  }
  const seed = stableHash(
    `${input.runeId}|${input.field}|${input.daySeed}|rune_content_v1`,
  );
  return seed % input.values.length;
}

export function readTextValue(
  value: unknown,
  variantIndex = 0,
): string | null {
  if (value == null) {
    return null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (Array.isArray(value)) {
    const strings = value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    if (strings.length === 0) {
      return null;
    }
    const index = Math.abs(variantIndex) % strings.length;
    return strings[index] ?? null;
  }
  return null;
}

export function computeRuneContentDaySeed(date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 1);
  const dayOfYear = Math.floor(
    (date.getTime() - start.getTime()) / 86_400_000,
  );
  return date.getFullYear() * 1000 + dayOfYear + 1;
}
