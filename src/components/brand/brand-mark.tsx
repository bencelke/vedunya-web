import Image from "next/image";

import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
  compact?: boolean;
  showLogo?: boolean;
};

export function BrandMark({
  className,
  compact = false,
  showLogo = false,
}: BrandMarkProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-medium tracking-tight text-text-primary",
        compact ? "text-sm" : "text-base",
        className,
      )}
    >
      {showLogo ? (
        <Image
          src="/assets/brand/vedunya-mark.svg"
          alt=""
          aria-hidden="true"
          width={compact ? 20 : 24}
          height={compact ? 20 : 24}
          className="shrink-0 opacity-90"
        />
      ) : null}
      <span>Vedunya Maria</span>
    </span>
  );
}
