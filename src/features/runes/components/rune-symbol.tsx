import Image from "next/image";

import { getRuneUnicodeGlyph } from "@/features/runes/constants/rune-assets";
import { CANONICAL_RUNE_BY_ID } from "@/features/runes/constants/canonical-runes";
import type { CanonicalRuneId } from "@/features/runes/types/rune";

type RuneSymbolProps = {
  runeId: CanonicalRuneId;
  alt: string;
  size?: number;
  className?: string;
};

export function RuneSymbol({
  runeId,
  alt,
  size = 64,
  className,
}: RuneSymbolProps) {
  const definition = CANONICAL_RUNE_BY_ID[runeId];

  return (
    <div
      className={`relative flex items-center justify-center ${className ?? ""}`}
      style={{ width: size, height: size }}
      aria-label={alt}
    >
      <Image
        src={definition.assetPath}
        alt={alt}
        width={size}
        height={size}
        className="object-contain"
      />
      <span className="sr-only">{getRuneUnicodeGlyph(runeId)}</span>
    </div>
  );
}

export function RuneSymbolFallback({
  runeId,
  alt,
  size = 64,
  className,
}: RuneSymbolProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-full border border-accent-gold/30 bg-accent-violet-soft text-2xl text-accent-gold ${className ?? ""}`}
      style={{ width: size, height: size }}
      aria-label={alt}
    >
      {getRuneUnicodeGlyph(runeId)}
    </div>
  );
}
