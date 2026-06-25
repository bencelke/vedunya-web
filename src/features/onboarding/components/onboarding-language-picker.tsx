"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SupportedLocale } from "@/config/app-config";

type OnboardingLanguagePickerProps = {
  value: SupportedLocale;
  onChange: (locale: SupportedLocale) => void;
  options: ReadonlyArray<{
    locale: SupportedLocale;
    label: string;
  }>;
};

export function OnboardingLanguagePicker({
  value,
  onChange,
  options,
}: OnboardingLanguagePickerProps) {
  return (
    <div className="grid gap-3">
      {options.map((option) => {
        const selected = value === option.locale;

        return (
          <button
            key={option.locale}
            type="button"
            onClick={() => onChange(option.locale)}
            className={cn(
              "flex min-h-[3.25rem] items-center justify-between rounded-[var(--radius-lg)] border px-4 text-left text-sm font-medium transition-colors",
              selected
                ? "border-auth-accent-gold bg-auth-accent-gold/12 text-auth-text-primary"
                : "border-auth-border bg-auth-surface-muted text-auth-text-muted hover:border-auth-accent-gold/35 hover:text-auth-text-primary",
            )}
            aria-pressed={selected}
          >
            <span>{option.label}</span>
            {selected ? (
              <Check
                className="h-4 w-4 shrink-0 text-auth-accent-gold"
                strokeWidth={2}
                aria-hidden="true"
              />
            ) : (
              <span className="h-4 w-4 shrink-0" aria-hidden="true" />
            )}
          </button>
        );
      })}
    </div>
  );
}
