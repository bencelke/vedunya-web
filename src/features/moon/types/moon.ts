export type MoonPhase4Id = "new_moon" | "waxing" | "full_moon" | "waning";

export type MoonPhase8Id =
  | "new_moon"
  | "waxing_crescent"
  | "first_quarter"
  | "waxing_gibbous"
  | "full_moon"
  | "waning_gibbous"
  | "last_quarter"
  | "waning_crescent";

export type MoonEnergyLevel = "low" | "medium" | "high";

export type SupportedMoonLocale = "en" | "ru";

export type MoonCalculationInput = {
  /** UTC instant used for synodic math (matches Flutter `dateTime.toUtc()`). */
  calculationInstant: Date;
  timezone: string;
};

export type MoonEngineResult = {
  phase8Id: MoonPhase8Id;
  phase4Id: MoonPhase4Id;
  moonAgeDays: number;
  illuminationPercent: number;
  cycleProgress: number;
  phaseAngle: number;
  isWaxing: boolean;
  julianDate: number;
  nextMajorPhaseId: MoonPhase8Id | "new_moon";
  daysUntilNextMajorPhase: number;
};

export type MoonCalculation = {
  julianDate: number;
  moonAgeDays: number;
  lunarDay: number;
  phase8Id: MoonPhase8Id;
  phaseId: MoonPhase4Id;
  phaseProgress: number;
  illuminationPercent: number;
  isWaxing: boolean;
  energyLevel: MoonEnergyLevel;
};

export type MoonPhaseContentRecord = {
  id: MoonPhase4Id;
  titleRu: string;
  titleEn: string;
  shortRu: string;
  shortEn: string;
  deepRu: string;
  deepEn: string;
  actionRu: string;
  actionEn: string;
  warningRu: string;
  warningEn: string;
};

export type MoonLocalizedContent = {
  title: string;
  short: string;
  guidance: string;
  action?: string;
  reflection?: string;
};

export type LunarDayTranslationRecord = {
  title: string;
  short: string;
  deep: string;
  focus: string;
  action: string;
  warning: string;
  ritual: string;
  reflection: string;
};

export type LunarDayContentRecord = {
  day: number;
  energyLevel: string;
  focusKey: string;
  ru: LunarDayTranslationRecord;
  en: LunarDayTranslationRecord;
};

export type MoonContentSource = "firestore" | "fallback" | "missing";

export type MoonGuidanceResult = {
  dateKey: string;
  timezone: string;
  calculation: MoonCalculation;
  phase: MoonLocalizedContent;
  lunarDayContent: MoonLocalizedContent | null;
  source: {
    phase: "firestore" | "fallback";
    lunarDay: MoonContentSource;
  };
};

export type MoonGuidanceLoadResult =
  | { status: "ready"; guidance: MoonGuidanceResult }
  | { status: "error"; reason: string };

export type MoonSummaryResult = {
  phaseTitle: string;
  phaseShort: string;
  lunarDay: number;
  phase4Id: MoonPhase4Id;
  phase8Id: MoonPhase8Id;
};
