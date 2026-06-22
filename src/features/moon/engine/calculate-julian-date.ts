import {
  JD_UNIX_EPOCH_OFFSET,
  MS_PER_DAY,
} from "@/features/moon/constants";

/** Julian date from a UTC instant — matches Flutter `_julianDateUtc`. */
export function calculateJulianDateUtc(instant: Date): number {
  return instant.getTime() / MS_PER_DAY + JD_UNIX_EPOCH_OFFSET;
}

export function normalizeFraction(value: number): number {
  const mod = value % 1;
  return mod < 0 ? mod + 1 : mod;
}
