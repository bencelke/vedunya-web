"use client";

import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import type { UniverseRequestCategory } from "@/features/universe-request/types";
import { UNIVERSE_REQUEST_CATEGORIES } from "@/features/universe-request/types";

type UniverseRequestCategoryPickerProps = {
  value: UniverseRequestCategory | null;
  onChange: (category: UniverseRequestCategory) => void;
  disabled?: boolean;
};

export function UniverseRequestCategoryPicker({
  value,
  onChange,
  disabled = false,
}: UniverseRequestCategoryPickerProps) {
  const t = useTranslations("universeRequest.categories");

  return (
    <div className="flex flex-wrap gap-2">
      {UNIVERSE_REQUEST_CATEGORIES.map((category) => {
        const selected = value === category;

        return (
          <button
            key={category}
            type="button"
            disabled={disabled}
            onClick={() => onChange(category)}
            className={cn(
              "min-h-10 rounded-[var(--radius-pill)] border px-3 text-xs font-medium transition-colors",
              selected
                ? "border-accent-gold bg-accent-gold-muted text-accent-gold"
                : "border-border-subtle bg-surface-primary/70 text-text-muted hover:text-text-primary",
            )}
          >
            {t(category)}
          </button>
        );
      })}
    </div>
  );
}
