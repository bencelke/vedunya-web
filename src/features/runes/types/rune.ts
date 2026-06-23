export type CanonicalRuneId =
  | "fehu"
  | "uruz"
  | "thurisaz"
  | "ansuz"
  | "raido"
  | "kenaz"
  | "gebo"
  | "wunjo"
  | "hagalaz"
  | "nauthiz"
  | "isa"
  | "jera"
  | "eihwaz"
  | "perthro"
  | "algiz"
  | "sowilo"
  | "tiwaz"
  | "berkano"
  | "ehwaz"
  | "mannaz"
  | "laguz"
  | "ingwaz"
  | "dagaz"
  | "othala";

export type SupportedRuneLocale = "en" | "ru";

export type DateOnlyParts = {
  year: number;
  month: number;
  day: number;
};

export type DailyRuneSelectionInput = {
  personalDayNumber: number;
  forDate: DateOnlyParts;
  locale: SupportedRuneLocale;
};

export type DailyRuneSelection = {
  runeId: CanonicalRuneId;
  runeIndex: number;
  dateKey: string;
  seed: number;
};

export type TodayRuneModule = {
  messages: { ru: string[]; en: string[] };
  actions: { ru: string[]; en: string[] };
};

export type TodayRuneContent = {
  title: string;
  short: string;
  guidance: string;
  action: string;
};

export type RuneTranslationFields = {
  title: string;
  short: string;
  deep: string;
  action: string;
  warning: string;
  affirmation: string;
  reflection: string;
};

export type RuneDeepContent = {
  runeId: CanonicalRuneId;
  title: string;
  short: string;
  deep: string;
  action: string;
  warning: string;
  affirmation: string;
  reflection: string;
};

export type DailyRuneResult = {
  selection: DailyRuneSelection;
  content: TodayRuneContent;
  assetPath: string;
};

export type DailyRuneLoadResult =
  | { status: "ready"; result: DailyRuneResult }
  | { status: "missing-profile-data" }
  | { status: "error"; reason: string };

export type RuneContentAccess = {
  premiumActive: boolean;
  freeFields: (keyof RuneTranslationFields)[];
  premiumFields: (keyof RuneTranslationFields)[];
};

export type RuneDetailResult = {
  runeId: CanonicalRuneId;
  content: RuneDeepContent;
  access: RuneContentAccess;
  showPremiumLock: boolean;
  source: "firestore" | "fallback" | "minimal";
};

export type RuneDetailLoadResult =
  | { status: "ready"; detail: RuneDetailResult }
  | { status: "not-found" }
  | { status: "error"; reason: string };
