export type ProfileUniverseRequestSummary = {
  text: string;
  category: string | null;
};

export type ProfileCourseSummary = {
  slug: string;
  progressPercent: number | null;
  hasStarted: boolean;
};

export type ProfileSettingsSummary = {
  universeRequest: ProfileUniverseRequestSummary | null;
  course: ProfileCourseSummary | null;
};
