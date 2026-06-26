"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type UIEvent,
} from "react";

import {
  buildWheelDayOptions,
  buildWheelYearOptions,
  clampDayForMonth,
  getMonthLabels,
  type DobWheelParts,
} from "@/features/onboarding/utils/dob-wheel-picker-utils";
import { cn } from "@/lib/utils";
import type { SupportedLocale } from "@/config/app-config";

export const DOB_WHEEL_ITEM_HEIGHT = 44;
export const DOB_WHEEL_VISIBLE_ROWS = 5;
const PADDING_ROWS = Math.floor(DOB_WHEEL_VISIBLE_ROWS / 2);

export type DobWheelPickerProps = {
  parts: DobWheelParts;
  onPartsChange: (parts: DobWheelParts) => void;
  locale: SupportedLocale;
  minYear?: number;
  maxYear?: number;
  dayLabel: string;
  monthLabel: string;
  yearLabel: string;
  className?: string;
  id?: string;
};

type WheelColumnProps<T extends string | number> = {
  id: string;
  label: string;
  items: T[];
  selectedIndex: number;
  formatItem: (item: T) => string;
  onSelect: (index: number) => void;
};

function WheelColumn<T extends string | number>({
  id,
  label,
  items,
  selectedIndex,
  formatItem,
  onSelect,
}: WheelColumnProps<T>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollFrameRef = useRef<number | null>(null);
  const scrollEndTimeoutRef = useRef<number | null>(null);
  const isProgrammaticScrollRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(selectedIndex);

  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior = "auto") => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    isProgrammaticScrollRef.current = true;
    element.scrollTo({
      top: index * DOB_WHEEL_ITEM_HEIGHT,
      behavior,
    });
    window.setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, behavior === "smooth" ? 220 : 0);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      setActiveIndex(selectedIndex);
      scrollToIndex(selectedIndex);
    });
  }, [scrollToIndex, selectedIndex, items.length]);

  function finalizeScroll(behavior: ScrollBehavior = "smooth") {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    const index = Math.max(
      0,
      Math.min(items.length - 1, Math.round(element.scrollTop / DOB_WHEEL_ITEM_HEIGHT)),
    );
    setActiveIndex(index);
    scrollToIndex(index, behavior);
    onSelect(index);
  }

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    if (isProgrammaticScrollRef.current) {
      return;
    }

    const element = event.currentTarget;
    if (scrollFrameRef.current !== null) {
      cancelAnimationFrame(scrollFrameRef.current);
    }

    scrollFrameRef.current = requestAnimationFrame(() => {
      const index = Math.max(
        0,
        Math.min(items.length - 1, Math.round(element.scrollTop / DOB_WHEEL_ITEM_HEIGHT)),
      );
      setActiveIndex(index);
    });

    if ("onscrollend" in element) {
      return;
    }

    if (scrollEndTimeoutRef.current !== null) {
      window.clearTimeout(scrollEndTimeoutRef.current);
    }

    scrollEndTimeoutRef.current = window.setTimeout(() => {
      finalizeScroll();
    }, 120);
  }

  function handleScrollEnd() {
    if (isProgrammaticScrollRef.current) {
      return;
    }

    finalizeScroll();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") {
      return;
    }

    event.preventDefault();
    const delta = event.key === "ArrowUp" ? -1 : 1;
    const nextIndex = Math.max(0, Math.min(items.length - 1, activeIndex + delta));
    setActiveIndex(nextIndex);
    scrollToIndex(nextIndex, "smooth");
    onSelect(nextIndex);
  }

  return (
    <div className="dob-wheel-column min-w-0">
      <p
        id={`${id}-label`}
        className="mb-2 text-center text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-auth-text-subtle"
      >
        {label}
      </p>
      <div className="dob-wheel-viewport">
        <div className="dob-wheel-highlight" aria-hidden="true" />
        <div className="dob-wheel-fade dob-wheel-fade-top" aria-hidden="true" />
        <div className="dob-wheel-fade dob-wheel-fade-bottom" aria-hidden="true" />
        <div
          ref={scrollRef}
          id={id}
          role="listbox"
          aria-labelledby={`${id}-label`}
          aria-activedescendant={`${id}-option-${activeIndex}`}
          tabIndex={0}
          className="dob-wheel-column-scroll"
          style={{
            paddingTop: PADDING_ROWS * DOB_WHEEL_ITEM_HEIGHT,
            paddingBottom: PADDING_ROWS * DOB_WHEEL_ITEM_HEIGHT,
          }}
          onScroll={handleScroll}
          onScrollEnd={handleScrollEnd}
          onKeyDown={handleKeyDown}
        >
          {items.map((item, index) => {
            const distance = Math.abs(index - activeIndex);
            return (
              <button
                key={`${id}-${String(item)}`}
                id={`${id}-option-${index}`}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                className={cn(
                  "dob-wheel-item",
                  index === activeIndex && "dob-wheel-item--selected",
                  distance === 1 && "dob-wheel-item--near",
                  distance >= 2 && "dob-wheel-item--far",
                )}
                onClick={() => {
                  setActiveIndex(index);
                  scrollToIndex(index, "smooth");
                  onSelect(index);
                }}
              >
                {formatItem(item)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function DobWheelPicker({
  parts,
  onPartsChange,
  locale,
  minYear = 1900,
  maxYear = new Date().getFullYear(),
  dayLabel,
  monthLabel,
  yearLabel,
  className,
  id = "dob-wheel-picker",
}: DobWheelPickerProps) {
  const { day, month, year } = parts;

  const monthLabels = useMemo(() => getMonthLabels(locale), [locale]);
  const monthOptions = useMemo(
    () => Array.from({ length: 12 }, (_, index) => index + 1),
    [],
  );
  const yearOptions = useMemo(
    () => buildWheelYearOptions(minYear, maxYear),
    [minYear, maxYear],
  );
  const dayOptions = useMemo(
    () => buildWheelDayOptions(month, year),
    [month, year],
  );

  const dayIndex = Math.max(0, dayOptions.indexOf(day));
  const monthIndex = Math.max(0, month - 1);
  const yearIndex = Math.max(0, yearOptions.indexOf(year));

  function commitParts(patch: Partial<DobWheelParts>) {
    const next = {
      day: patch.day ?? day,
      month: patch.month ?? month,
      year: patch.year ?? year,
    };
    onPartsChange({
      ...next,
      day: clampDayForMonth(next.day, next.month, next.year),
    });
  }

  function handleDaySelect(index: number) {
    commitParts({ day: dayOptions[index] ?? dayOptions[0] ?? 1 });
  }

  function handleMonthSelect(index: number) {
    commitParts({ month: monthOptions[index] ?? 1 });
  }

  function handleYearSelect(index: number) {
    commitParts({ year: yearOptions[index] ?? maxYear });
  }

  return (
    <div className={cn("dob-wheel-picker w-full min-w-0", className)}>
      <div className="dob-wheel-grid" data-testid="dob-wheel-grid">
        <WheelColumn
          id={`${id}-day`}
          label={dayLabel}
          items={dayOptions}
          selectedIndex={dayIndex}
          formatItem={(item) => String(item)}
          onSelect={handleDaySelect}
        />
        <WheelColumn
          id={`${id}-month`}
          label={monthLabel}
          items={monthOptions}
          selectedIndex={monthIndex}
          formatItem={(item) => monthLabels[item - 1] ?? String(item)}
          onSelect={handleMonthSelect}
        />
        <WheelColumn
          id={`${id}-year`}
          label={yearLabel}
          items={yearOptions}
          selectedIndex={yearIndex}
          formatItem={(item) => String(item)}
          onSelect={handleYearSelect}
        />
      </div>
    </div>
  );
}
