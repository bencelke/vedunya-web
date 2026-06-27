"use client";

import { useTranslations } from "next-intl";

import type { CourseAccessType } from "@/features/courses/types/course";
import { cn } from "@/lib/utils";

type CourseAccessBadgeProps = {
  accessType: CourseAccessType;
  isLocked: boolean;
  isPurchased?: boolean;
  className?: string;
};

export function CourseAccessBadge({
  accessType,
  isLocked,
  isPurchased = false,
  className,
}: CourseAccessBadgeProps) {
  const t = useTranslations("courses");

  if (accessType === "free") {
    return (
      <span
        className={cn(
          "rounded-full border border-accent-gold/30 bg-accent-gold-muted/60 px-3 py-1 text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-accent-gold",
          className,
        )}
      >
        {t("accessFree")}
      </span>
    );
  }

  if (accessType === "paid" && isPurchased) {
    return (
      <span
        className={cn(
          "rounded-full border border-accent-gold/30 bg-accent-gold-muted/40 px-3 py-1 text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-accent-gold",
          className,
        )}
      >
        {t("accessOwned")}
      </span>
    );
  }

  if (accessType === "paid" && isLocked) {
    return (
      <span
        className={cn(
          "rounded-full border border-border-subtle bg-surface-elevated/90 px-3 py-1 text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-text-muted",
          className,
        )}
      >
        {t("accessPaid")}
      </span>
    );
  }

  return null;
}
