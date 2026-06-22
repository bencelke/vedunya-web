export type SupportedNumerologyLocale = "en" | "ru";

export type DateOnlyParts = {
  year: number;
  month: number;
  day: number;
};

export type PersonalDayInput = {
  birthDate: string;
  calculationDate: string;
  locale: SupportedNumerologyLocale;
  userSeed?: string;
};

export type PersonalDayCalculation = {
  birthDay: number;
  birthMonth: number;
  currentDay: number;
  currentMonth: number;
  currentYear: number;
  rawValue: number;
  personalDayNumber: number;
  dateKey: string;
};

export type PersonalDayContentRecord = {
  personalDayNumber: number;
  title: string;
  summary: string;
  doAdvice: string;
  avoidAdvice: string;
};

export type PersonalDayResolvedContent = {
  title: string;
  summary: string;
  doAdvice: string;
  avoidAdvice: string;
};

export type PersonalDayResult = {
  dateKey: string;
  calculation: PersonalDayCalculation;
  content: PersonalDayResolvedContent;
  contentKey: string;
};

export type PersonalDayLoadSuccess = {
  status: "ready";
  result: PersonalDayResult;
};

export type PersonalDayLoadMissingProfile = {
  status: "missing-profile-data";
};

export type PersonalDayLoadError = {
  status: "error";
  reason:
    | "invalid-session"
    | "invalid-dob"
    | "unsupported-locale"
    | "content-missing"
    | "calculation-failed"
    | "firestore-unavailable";
};

export type PersonalDayLoadResult =
  | PersonalDayLoadSuccess
  | PersonalDayLoadMissingProfile
  | PersonalDayLoadError;

export type PersonalDayPreviewInput = {
  birthDate: string;
  calculationDate: string;
  locale: SupportedNumerologyLocale;
};
