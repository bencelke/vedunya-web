import Image from "next/image";

import { moonPhaseArtDescriptor } from "@/features/moon/engine/phase-asset-map";
import type { MoonPhase4Id, MoonPhase8Id } from "@/features/moon/types/moon";

type MoonPhaseVisualProps = {
  phase4Id: MoonPhase4Id;
  phase8Id?: MoonPhase8Id;
  alt: string;
  className?: string;
  size?: number;
};

export function MoonPhaseVisual({
  phase4Id,
  phase8Id,
  alt,
  className,
  size = 120,
}: MoonPhaseVisualProps) {
  const art = moonPhaseArtDescriptor({ phase4Id, phase8Id });

  return (
    <div
      className={`relative flex items-center justify-center ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={art.assetPath}
        alt={alt}
        width={size}
        height={size}
        className="object-contain"
        style={
          art.flipHorizontally
            ? { transform: "scaleX(-1)" }
            : undefined
        }
        priority
      />
    </div>
  );
}

export function MoonPhaseVisualFallback({
  alt,
  className,
  size = 120,
}: {
  alt: string;
  className?: string;
  size?: number;
}) {
  return (
    <div
      aria-label={alt}
      className={`rounded-full border border-accent-gold/30 bg-accent-violet-soft ${className ?? ""}`}
      style={{ width: size, height: size }}
    />
  );
}
