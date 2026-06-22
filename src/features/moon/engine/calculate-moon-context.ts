import { mapPhase8ToPhase4 } from "@/features/moon/engine/phase-asset-map";
import {
  calculateIlluminationPercent,
  calculateMoonAgeDays,
} from "@/features/moon/engine/calculate-moon-age";
import { calculateLunarDayClamped } from "@/features/moon/engine/calculate-lunar-day";
import {
  resolveNextMajorPhase,
  resolvePhase8FromProgress,
} from "@/features/moon/engine/resolve-moon-phase";
import type {
  MoonCalculation,
  MoonCalculationInput,
  MoonEnergyLevel,
  MoonEngineResult,
} from "@/features/moon/types/moon";

export class MoonCalculationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MoonCalculationError";
  }
}

function energyForPhase(phaseId: MoonCalculation["phaseId"]): MoonEnergyLevel {
  switch (phaseId) {
    case "new_moon":
      return "low";
    case "full_moon":
      return "high";
    case "waxing":
    case "waning":
    default:
      return "medium";
  }
}

export function calculateMoonEngineResult(
  input: MoonCalculationInput,
): MoonEngineResult {
  if (!(input.calculationInstant instanceof Date) || Number.isNaN(input.calculationInstant.getTime())) {
    throw new MoonCalculationError("invalid-instant");
  }

  const { julianDate, cycleProgress, moonAgeDays, phaseAngle } =
    calculateMoonAgeDays(input.calculationInstant);
  const phase8Id = resolvePhase8FromProgress(cycleProgress);
  const phase4Id = mapPhase8ToPhase4(phase8Id);
  const illuminationPercent = calculateIlluminationPercent(phaseAngle);
  const nextMajor = resolveNextMajorPhase(cycleProgress);

  return {
    phase8Id,
    phase4Id,
    moonAgeDays,
    illuminationPercent,
    cycleProgress,
    phaseAngle,
    isWaxing: cycleProgress < 0.5,
    julianDate,
    nextMajorPhaseId: nextMajor.id,
    daysUntilNextMajorPhase: nextMajor.daysUntil,
  };
}

export function calculateMoonContext(
  input: MoonCalculationInput,
): MoonCalculation {
  const engine = calculateMoonEngineResult(input);
  const lunarDay = calculateLunarDayClamped(engine.moonAgeDays);

  return {
    julianDate: engine.julianDate,
    moonAgeDays: engine.moonAgeDays,
    lunarDay,
    phase8Id: engine.phase8Id,
    phaseId: engine.phase4Id,
    phaseProgress: engine.cycleProgress,
    illuminationPercent: engine.illuminationPercent,
    isWaxing: engine.isWaxing,
    energyLevel: energyForPhase(engine.phase4Id),
  };
}
