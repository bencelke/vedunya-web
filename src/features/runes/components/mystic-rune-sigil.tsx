import Image from "next/image";

import { getRuneAssetPath } from "@/features/runes/constants/rune-assets";
import { getRuneUnicodeGlyph } from "@/features/runes/constants/rune-assets";
import { CANONICAL_RUNE_BY_ID } from "@/features/runes/constants/canonical-runes";
import type { CanonicalRuneId } from "@/features/runes/types/rune";
import { cn } from "@/lib/utils";

type MysticRuneSigilProps = {
  runeId: CanonicalRuneId;
  alt: string;
  size?: number;
  className?: string;
};

export function MysticRuneSigil({
  runeId,
  alt,
  size = 168,
  className,
}: MysticRuneSigilProps) {
  const definition = CANONICAL_RUNE_BY_ID[runeId];

  return (
    <div
      className={cn(
        "mystic-rune-sigil flex items-center justify-center rounded-full",
        className,
      )}
      style={{ width: size, height: size }}
      aria-label={alt}
    >
      <Image
        src={definition.assetPath}
        alt={alt}
        width={size}
        height={size}
        className="mystic-rune-sigil-glyph object-contain"
        style={{
          width: Math.round(size * 0.62),
          height: Math.round(size * 0.62),
        }}
      />
      <span className="sr-only">{getRuneUnicodeGlyph(runeId)}</span>
    </div>
  );
}

export function MysticRuneSigilFallback({
  runeId,
  alt,
  size = 168,
  className,
}: MysticRuneSigilProps) {
  return (
    <div
      className={cn(
        "mystic-rune-sigil flex items-center justify-center rounded-full text-[clamp(2.5rem,12vw,4.5rem)] text-[#F3EDE3]",
        className,
      )}
      style={{ width: size, height: size }}
      aria-label={alt}
    >
      {getRuneUnicodeGlyph(runeId)}
    </div>
  );
}

/** @deprecated Use asset path via MysticRuneSigil — kept for tests referencing SVG paths. */
export function getMysticRuneSigilAssetPath(runeId: CanonicalRuneId): string {
  return getRuneAssetPath(runeId);
}
