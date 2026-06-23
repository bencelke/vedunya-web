import Image from "next/image";

import { mysticAssets } from "@/config/mysticAssets";
import { cn } from "@/lib/utils";

export type MysticLogoProps = {
  className?: string;
  variant?: "dark" | "light";
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: { width: 120, height: 28 },
  md: { width: 156, height: 36 },
  lg: { width: 192, height: 44 },
} as const;

export function MysticLogo({
  className,
  variant = "dark",
  showWordmark = true,
  size = "md",
}: MysticLogoProps) {
  const src =
    variant === "light"
      ? mysticAssets.brand.mysticLogoWhite
      : mysticAssets.brand.mysticLogo;
  const dimensions = sizeMap[size];

  if (!showWordmark) {
    return (
      <Image
        src={mysticAssets.brand.makoshEmblem}
        alt=""
        aria-hidden="true"
        width={56}
        height={56}
        className={cn("h-14 w-14 object-contain", className)}
        priority
      />
    );
  }

  return (
    <Image
      src={src}
      alt="Mystic by Vedunya Maria"
      width={dimensions.width}
      height={dimensions.height}
      className={cn("h-auto w-auto max-w-[12rem]", className)}
      priority
    />
  );
}
