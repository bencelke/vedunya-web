"use client";

import { MysticBrandHeader } from "@/components/brand/mystic-brand-header";
import { cn } from "@/lib/utils";

type IntroBrandHeaderProps = {
  size?: "lg" | "md";
  showDivider?: boolean;
  className?: string;
  wordmark: string;
};

export function IntroBrandHeader({
  size = "md",
  showDivider = false,
  className,
  wordmark,
}: IntroBrandHeaderProps) {
  return (
    <MysticBrandHeader
      wordmark={wordmark}
      size={size}
      showDivider={showDivider}
      className={cn(className)}
    />
  );
}
