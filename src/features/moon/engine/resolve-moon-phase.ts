import type { MoonPhase8Id } from "@/features/moon/types/moon";

/** Eight equal synodic sectors — matches Flutter `_phase8FromProgress`. */
export function resolvePhase8FromProgress(progress: number): MoonPhase8Id {
  if (progress < 1 / 16 || progress >= 15 / 16) {
    return "new_moon";
  }
  if (progress < 3 / 16) {
    return "waxing_crescent";
  }
  if (progress < 5 / 16) {
    return "first_quarter";
  }
  if (progress < 7 / 16) {
    return "waxing_gibbous";
  }
  if (progress < 9 / 16) {
    return "full_moon";
  }
  if (progress < 11 / 16) {
    return "waning_gibbous";
  }
  if (progress < 13 / 16) {
    return "last_quarter";
  }
  return "waning_crescent";
}

type MajorMark = {
  id: MoonPhase8Id | "new_moon";
  progress: number;
};

const MAJOR_MARKS: MajorMark[] = [
  { id: "new_moon", progress: 0 },
  { id: "first_quarter", progress: 0.25 },
  { id: "full_moon", progress: 0.5 },
  { id: "last_quarter", progress: 0.75 },
  { id: "new_moon", progress: 1 },
];

export function resolveNextMajorPhase(progress: number): {
  id: MoonPhase8Id | "new_moon";
  daysUntil: number;
  synodicMonthDays: number;
} {
  for (const mark of MAJOR_MARKS) {
    if (mark.progress > progress) {
      return {
        id: mark.id,
        daysUntil: (mark.progress - progress) * 29.53058867,
        synodicMonthDays: 29.53058867,
      };
    }
  }

  return { id: "new_moon", daysUntil: 0, synodicMonthDays: 29.53058867 };
}
