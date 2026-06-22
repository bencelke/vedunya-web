export type LiveFirebaseDiagnostic = {
  clientConfigured: boolean;
  adminConfigured: boolean;
  projectIdsMatch: boolean | null;
  authAdminReachable: boolean;
  firestoreAdminReachable: boolean;
  expectedCollectionsChecked: string[];
  errors: Array<{
    area: string;
    safeMessage: string;
  }>;
};

export type AuthDiagnostics = {
  authenticated: boolean;
  sessionVerified: boolean;
  publicProfileExists: boolean;
  privateProfileExists: boolean;
  dobPresent: boolean;
  profileComplete: boolean;
  localePresent: boolean;
  authProviderCount: number;
};

export type LiveContentDiagnostic = {
  runeContent: "firestore" | "fallback" | "unavailable";
  moonPhaseContent: "firestore" | "fallback" | "unavailable";
  lunarDayContent: "firestore" | "fallback" | "missing" | "unavailable";
};
