import type { SupportedLocale } from "@/config/app-config";
import type { UniverseRequestViewModel } from "@/features/universe-request/types";

export type DailyGuidanceLocale = SupportedLocale;

export type GuidanceSection<T> =
  | { status: "ready"; data: T }
  | { status: "unavailable"; message: string };

export type DailyGuidancePrimary = {
  label: string;
  title: string;
  message: string;
  action: string;
};

export type PersonalDayIndicatorData = {
  number: number;
  title: string;
  explanation: string;
};

export type MoonRhythmSummaryData = {
  phaseId: string;
  phaseTitle: string;
  lunarDay: number;
  summary: string;
  deep: string | null;
  action: string | null;
  showPremiumDeepLock: boolean;
  assetPath: string | null;
  href: "/moon";
};

export type DailyRuneSummaryData = {
  runeId: string;
  title: string;
  summary: string;
  deep: string | null;
  action: string | null;
  showPremiumDeepLock: boolean;
  assetPath: string;
  href: string;
};

export type DailyGuidanceNumerologySection =
  GuidanceSection<PersonalDayIndicatorData>;

export type DailyGuidanceMoonSection = GuidanceSection<MoonRhythmSummaryData>;

export type DailyGuidanceRuneSection = GuidanceSection<DailyRuneSummaryData>;

export type DailyGuidanceViewModel = {
  formattedDate: string;
  greetingName: string | null;
  premiumActive: boolean;
  primary: DailyGuidancePrimary;
  numerology: DailyGuidanceNumerologySection;
  moon: DailyGuidanceMoonSection;
  rune: DailyGuidanceRuneSection;
  reflection: string | null;
  universeRequest: UniverseRequestViewModel;
};

export type DailyGuidanceAuthenticatedCore = Omit<
  DailyGuidanceViewModel,
  "universeRequest"
>;

export type DailyGuidancePreviewModel = {
  formattedDate: string;
  previewLabel: string;
  primary: DailyGuidancePrimary;
  moon: DailyGuidanceMoonSection;
  runePreview: {
    title: string;
    summary: string;
    assetPath: string;
  };
  personalizeMessage: string;
};

export type DailyGuidanceIncompleteModel = {
  formattedDate: string;
  greetingName: string | null;
  setupMessage: string;
  setupHref: "/onboarding";
};

export type DailyGuidancePageModel =
  | { kind: "anonymous"; preview: DailyGuidancePreviewModel }
  | { kind: "incomplete"; incomplete: DailyGuidanceIncompleteModel }
  | { kind: "authenticated"; guidance: DailyGuidanceViewModel }
  | { kind: "session-error" };

export function isGuidanceReady<T>(
  section: GuidanceSection<T>,
): section is { status: "ready"; data: T } {
  return section.status === "ready";
}
