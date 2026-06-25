"use client";

import { useMemo, useState } from "react";
import { useLocale } from "next-intl";

import {
  buildYearOptions,
  combineIsoParts,
  daysInMonth,
  parseIsoParts,
} from "@/features/onboarding/utils/dob-input-utils";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { SupportedLocale } from "@/config/app-config";

type DobInputProps = {
  id: string;
  dayLabel: string;
  monthLabel: string;
  yearLabel: string;
  reassurance?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

const selectClassName =
  "min-h-12 w-full min-w-0 appearance-none rounded-[var(--radius-md)] border border-auth-border bg-auth-surface px-3 text-sm text-auth-text-primary outline-none transition-colors focus:border-auth-accent-gold/70";

function localizedMonthLabel(month: number, locale: SupportedLocale): string {
  const date = new Date(2000, month - 1, 1);
  return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-US", {
    month: "long",
  }).format(date);
}

export function DobInput({
  id,
  dayLabel,
  monthLabel,
  yearLabel,
  reassurance,
  value,
  onChange,
  className,
}: DobInputProps) {
  const locale = useLocale() as SupportedLocale;
  const initial = parseIsoParts(value);
  const [day, setDay] = useState(initial.day);
  const [month, setMonth] = useState(initial.month);
  const [year, setYear] = useState(initial.year);

  const yearOptions = useMemo(() => buildYearOptions(), []);
  const monthOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const monthNumber = index + 1;
        return {
          value: String(monthNumber),
          label: localizedMonthLabel(monthNumber, locale),
        };
      }),
    [locale],
  );

  const maxDay = daysInMonth(Number(month), Number(year));
  const dayOptions = useMemo(() => {
    const limit = maxDay > 0 ? maxDay : 31;
    return Array.from({ length: limit }, (_, index) => String(index + 1));
  }, [maxDay]);

  function emit(nextDay: string, nextMonth: string, nextYear: string) {
    onChange(combineIsoParts(nextDay, nextMonth, nextYear));
  }

  function handleDayChange(nextDay: string) {
    setDay(nextDay);
    emit(nextDay, month, year);
  }

  function handleMonthChange(nextMonth: string) {
    let nextDay = day;
    const limit = daysInMonth(Number(nextMonth), Number(year));
    if (nextDay && Number(nextDay) > limit) {
      nextDay = String(limit);
      setDay(nextDay);
    }
    setMonth(nextMonth);
    emit(nextDay, nextMonth, year);
  }

  function handleYearChange(nextYear: string) {
    let nextDay = day;
    const limit = daysInMonth(Number(month), Number(nextYear));
    if (nextDay && Number(nextDay) > limit) {
      nextDay = String(limit);
      setDay(nextDay);
    }
    setYear(nextYear);
    emit(nextDay, month, nextYear);
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="dob-picker-grid grid grid-cols-1 gap-3 min-[381px]:grid-cols-3 [&>*]:min-w-0">
        <div className="space-y-2">
          <Label htmlFor={`${id}-day`} tone="auth">
            {dayLabel}
          </Label>
          <select
            id={`${id}-day`}
            autoComplete="bday-day"
            value={day}
            onChange={(event) => handleDayChange(event.target.value)}
            className={selectClassName}
          >
            <option value="">{dayLabel}</option>
            {dayOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${id}-month`} tone="auth">
            {monthLabel}
          </Label>
          <select
            id={`${id}-month`}
            autoComplete="bday-month"
            value={month}
            onChange={(event) => handleMonthChange(event.target.value)}
            className={selectClassName}
          >
            <option value="">{monthLabel}</option>
            {monthOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${id}-year`} tone="auth">
            {yearLabel}
          </Label>
          <select
            id={`${id}-year`}
            autoComplete="bday-year"
            value={year}
            onChange={(event) => handleYearChange(event.target.value)}
            className={selectClassName}
          >
            <option value="">{yearLabel}</option>
            {yearOptions.map((option) => (
              <option key={option} value={String(option)}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
      {reassurance ? (
        <p className="text-xs leading-relaxed text-auth-text-subtle">{reassurance}</p>
      ) : null}
    </div>
  );
}
