"use client";

import { useEffect, useState } from "react";

import { DobWheelPicker } from "@/features/onboarding/components/dob-wheel-picker";
import {
  clampWheelParts,
  parseWheelValue,
  resolveWheelPickerValue,
  type DobWheelParts,
} from "@/features/onboarding/utils/dob-wheel-picker-utils";
import type { SupportedLocale } from "@/config/app-config";

type DobPickerSheetProps = {
  open: boolean;
  value: string;
  locale: SupportedLocale;
  title: string;
  cancelLabel: string;
  doneLabel: string;
  dayLabel: string;
  monthLabel: string;
  yearLabel: string;
  onCancel: () => void;
  onDone: (value: string) => void;
};

export function DobPickerSheet({
  open,
  value,
  locale,
  title,
  cancelLabel,
  doneLabel,
  dayLabel,
  monthLabel,
  yearLabel,
  onCancel,
  onDone,
}: DobPickerSheetProps) {
  const [draft, setDraft] = useState<DobWheelParts>(() => parseWheelValue(value));

  useEffect(() => {
    if (!open) {
      return;
    }

    queueMicrotask(() => {
      setDraft(parseWheelValue(value));
    });
  }, [open, value]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCancel, open]);

  if (!open) {
    return null;
  }

  function handleDone() {
    const resolved = resolveWheelPickerValue(draft.day, draft.month, draft.year);
    onDone(resolved ?? "");
  }

  return (
    <div className="dob-picker-sheet-root" data-testid="dob-picker-sheet">
      <button
        type="button"
        className="dob-picker-sheet-backdrop"
        aria-label={cancelLabel}
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dob-picker-sheet-title"
        className="dob-picker-sheet-panel"
      >
        <div className="dob-picker-sheet-handle md:hidden" aria-hidden="true" />
        <header className="dob-picker-sheet-header">
          <button type="button" className="dob-picker-sheet-action" onClick={onCancel}>
            {cancelLabel}
          </button>
          <h2 id="dob-picker-sheet-title" className="dob-picker-sheet-title">
            {title}
          </h2>
          <button
            type="button"
            className="dob-picker-sheet-action dob-picker-sheet-action--primary"
            onClick={handleDone}
          >
            {doneLabel}
          </button>
        </header>
        <div className="dob-picker-sheet-body">
          <DobWheelPicker
            id="dob-picker-sheet-wheel"
            locale={locale}
            parts={draft}
            onPartsChange={(next) => setDraft(clampWheelParts(next))}
            dayLabel={dayLabel}
            monthLabel={monthLabel}
            yearLabel={yearLabel}
          />
        </div>
      </div>
    </div>
  );
}
