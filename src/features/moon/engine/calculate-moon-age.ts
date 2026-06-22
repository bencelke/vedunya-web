import {
  REFERENCE_NEW_MOON_JD,
  SYNODIC_MONTH_DAYS,
} from "@/features/moon/constants";
import {
  calculateJulianDateUtc,
  normalizeFraction,
} from "@/features/moon/engine/calculate-julian-date";

export function calculateMoonAgeDays(instant: Date): {
  julianDate: number;
  cycleProgress: number;
  moonAgeDays: number;
  phaseAngle: number;
} {
  const julianDate = calculateJulianDateUtc(instant);
  const cycleProgress = normalizeFraction(
    (julianDate - REFERENCE_NEW_MOON_JD) / SYNODIC_MONTH_DAYS,
  );
  const moonAgeDays = cycleProgress * SYNODIC_MONTH_DAYS;
  const phaseAngle = cycleProgress * 360;

  return {
    julianDate,
    cycleProgress,
    moonAgeDays,
    phaseAngle,
  };
}

export function calculateIlluminationPercent(phaseAngleDegrees: number): number {
  const radians = (phaseAngleDegrees * Math.PI) / 180;
  const lit = (1 - Math.cos(radians)) / 2;
  return Math.min(100, Math.max(0, lit * 100));
}
