"use client";

import { useState } from "react";
import { useLocale } from "next-intl";

import { DobDateField } from "@/features/onboarding/components/dob-date-field";
import { DobPickerSheet } from "@/features/onboarding/components/dob-picker-sheet";
import { cn } from "@/lib/utils";
import type { SupportedLocale } from "@/config/app-config";

type DobInputProps = {
  id: string;
  fieldPlaceholder: string;
  dayLabel: string;
  monthLabel: string;
  yearLabel: string;
  sheetTitle: string;
  sheetCancelLabel: string;
  sheetDoneLabel: string;
  reassurance?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  fieldLabel?: string;
  variant?: "default" | "premium";
};

export function DobInput({
  id,
  fieldPlaceholder,
  dayLabel,
  monthLabel,
  yearLabel,
  sheetTitle,
  sheetCancelLabel,
  sheetDoneLabel,
  reassurance,
  value,
  onChange,
  className,
  fieldLabel,
}: DobInputProps) {
  const locale = useLocale() as SupportedLocale;
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className={cn("space-y-4", className)}>
      <DobDateField
        id={id}
        label={fieldLabel}
        placeholder={fieldPlaceholder}
        value={value}
        locale={locale}
        ariaExpanded={sheetOpen}
        onOpen={() => setSheetOpen(true)}
      />
      <DobPickerSheet
        open={sheetOpen}
        value={value}
        locale={locale}
        title={sheetTitle}
        cancelLabel={sheetCancelLabel}
        doneLabel={sheetDoneLabel}
        dayLabel={dayLabel}
        monthLabel={monthLabel}
        yearLabel={yearLabel}
        onCancel={() => setSheetOpen(false)}
        onDone={(nextValue) => {
          if (nextValue) {
            onChange(nextValue);
          }
          setSheetOpen(false);
        }}
      />
      {reassurance ? (
        <p className="text-xs leading-relaxed text-auth-text-subtle">{reassurance}</p>
      ) : null}
    </div>
  );
}
