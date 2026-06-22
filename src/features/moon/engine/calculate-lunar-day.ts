import { LUNAR_DAY_MAX, LUNAR_DAY_MIN } from "@/features/moon/constants";

export class LunarDayCalculationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LunarDayCalculationError";
  }
}

/** Matches Flutter `LunarDayService._approximateLunarDay`. */
export function calculateLunarDay(moonAgeDays: number): number {
  if (!Number.isFinite(moonAgeDays)) {
    throw new LunarDayCalculationError("invalid-moon-age");
  }

  const day = Math.floor(moonAgeDays) + 1;

  if (day < LUNAR_DAY_MIN || day > LUNAR_DAY_MAX) {
    throw new LunarDayCalculationError("lunar-day-out-of-range");
  }

  return day;
}

/** Flutter clamps out-of-range values in production; exposed for parity reference. */
export function calculateLunarDayClamped(moonAgeDays: number): number {
  const day = Math.floor(moonAgeDays) + 1;
  if (day < LUNAR_DAY_MIN) {
    return LUNAR_DAY_MIN;
  }
  if (day > LUNAR_DAY_MAX) {
    return LUNAR_DAY_MAX;
  }
  return day;
}
