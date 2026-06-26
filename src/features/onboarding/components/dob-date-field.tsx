"use client";

import { CalendarDays, ChevronDown } from "lucide-react";

import { formatDisplayDate } from "@/features/onboarding/utils/dob-wheel-picker-utils";
import { cn } from "@/lib/utils";
import type { SupportedLocale } from "@/config/app-config";

type DobDateFieldProps = {
  id: string;
  placeholder: string;
  value: string;
  locale: SupportedLocale;
  onOpen: () => void;
  className?: string;
  label?: string;
  ariaExpanded?: boolean;
};

export function DobDateField({
  id,
  placeholder,
  value,
  locale,
  onOpen,
  className,
  label,
  ariaExpanded = false,
}: DobDateFieldProps) {
  const displayValue = value ? formatDisplayDate(value, locale) : placeholder;
  const hasValue = Boolean(value);

  return (
    <div className={cn("space-y-2", className)}>
      {label ? (
        <label htmlFor={id} className="text-sm font-medium text-auth-text-primary">
          {label}
        </label>
      ) : null}
      <button
        type="button"
        id={id}
        data-testid="dob-date-field"
        aria-haspopup="dialog"
        aria-expanded={ariaExpanded}
        onClick={onOpen}
        className="dob-date-field flex min-h-12 w-full min-w-0 items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-auth-border/90 bg-auth-surface-muted/70 px-4 text-left transition-colors hover:border-auth-accent-gold/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-accent-gold/40"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <CalendarDays
            className="h-4 w-4 shrink-0 text-auth-accent-gold/80"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <span
            className={cn(
              "truncate text-sm",
              hasValue ? "font-medium text-auth-text-primary" : "text-auth-text-muted",
            )}
          >
            {displayValue}
          </span>
        </span>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-auth-text-subtle"
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
