"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

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

function parseIsoParts(value: string): {
  day: string;
  month: string;
  year: string;
} {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return { day: "", month: "", year: "" };
  }

  const [year, month, day] = value.split("-");
  return {
    day: String(Number(day)),
    month: String(Number(month)),
    year,
  };
}

function combineIsoParts(day: string, month: string, year: string): string {
  const normalizedDay = day.trim();
  const normalizedMonth = month.trim();
  const normalizedYear = year.trim();

  if (!normalizedDay || !normalizedMonth || !normalizedYear) {
    return "";
  }

  if (normalizedYear.length !== 4) {
    return "";
  }

  const dayNumber = Number(normalizedDay);
  const monthNumber = Number(normalizedMonth);
  const yearNumber = Number(normalizedYear);

  if (
    !Number.isInteger(dayNumber) ||
    !Number.isInteger(monthNumber) ||
    !Number.isInteger(yearNumber)
  ) {
    return "";
  }

  return `${String(yearNumber).padStart(4, "0")}-${String(monthNumber).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;
}

function sanitizeNumeric(value: string, maxLength: number): string {
  return value.replace(/\D/g, "").slice(0, maxLength);
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
  const initial = parseIsoParts(value);
  const [day, setDay] = useState(initial.day);
  const [month, setMonth] = useState(initial.month);
  const [year, setYear] = useState(initial.year);

  function emit(nextDay: string, nextMonth: string, nextYear: string) {
    onChange(combineIsoParts(nextDay, nextMonth, nextYear));
  }

  function handleDayChange(raw: string) {
    const nextDay = sanitizeNumeric(raw, 2);
    setDay(nextDay);
    emit(nextDay, month, year);
  }

  function handleMonthChange(raw: string) {
    const nextMonth = sanitizeNumeric(raw, 2);
    setMonth(nextMonth);
    emit(day, nextMonth, year);
  }

  function handleYearChange(raw: string) {
    const nextYear = sanitizeNumeric(raw, 4);
    setYear(nextYear);
    emit(day, month, nextYear);
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-[1fr_1fr_1.35fr] gap-3">
        <div className="space-y-2">
          <Label htmlFor={`${id}-day`} tone="auth">
            {dayLabel}
          </Label>
          <Input
            id={`${id}-day`}
            type="text"
            inputMode="numeric"
            autoComplete="bday-day"
            tone="auth"
            placeholder="DD"
            value={day}
            onChange={(event) => handleDayChange(event.target.value)}
            className="min-h-12 text-center tabular-nums"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${id}-month`} tone="auth">
            {monthLabel}
          </Label>
          <Input
            id={`${id}-month`}
            type="text"
            inputMode="numeric"
            autoComplete="bday-month"
            tone="auth"
            placeholder="MM"
            value={month}
            onChange={(event) => handleMonthChange(event.target.value)}
            className="min-h-12 text-center tabular-nums"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${id}-year`} tone="auth">
            {yearLabel}
          </Label>
          <Input
            id={`${id}-year`}
            type="text"
            inputMode="numeric"
            autoComplete="bday-year"
            tone="auth"
            placeholder="YYYY"
            value={year}
            onChange={(event) => handleYearChange(event.target.value)}
            className="min-h-12 text-center tabular-nums"
          />
        </div>
      </div>
      {reassurance ? (
        <p className="text-xs leading-relaxed text-auth-text-subtle">{reassurance}</p>
      ) : null}
    </div>
  );
}
