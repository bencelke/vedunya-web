/** Synodic month length in days — matches Flutter `MoonEngineService.synodicMonthDays`. */
export const SYNODIC_MONTH_DAYS = 29.53058867;

/** Reference new moon Julian date — 2000-01-06 18:14 UTC. */
export const REFERENCE_NEW_MOON_JD = 2451550.1;

/** Julian date epoch offset for Unix milliseconds. */
export const JD_UNIX_EPOCH_OFFSET = 2440587.5;

export const MS_PER_DAY = 86_400_000;

export const MOON_PHASE4_IDS = [
  "new_moon",
  "waxing",
  "full_moon",
  "waning",
] as const;

export const MOON_PHASE8_IDS = [
  "new_moon",
  "waxing_crescent",
  "first_quarter",
  "waxing_gibbous",
  "full_moon",
  "waning_gibbous",
  "last_quarter",
  "waning_crescent",
] as const;

export const MOON_PHASES_COLLECTION = "moon_phases";
export const LUNAR_DAYS_COLLECTION = "lunar_days";

export const LUNAR_DAY_MIN = 1;
export const LUNAR_DAY_MAX = 30;
