export type MysticCourseBlockType =
  | "chapterIntro"
  | "text"
  | "practice"
  | "reflection"
  | "completion";

export type MysticCourseBlockSource = {
  type: MysticCourseBlockType;
  titleEn: string;
  titleRu: string;
  bodyEn: string;
  bodyRu: string;
};

export type MysticCourseLessonSource = {
  id: string;
  order: number;
  titleEn: string;
  titleRu: string;
  summaryEn: string;
  summaryRu: string;
  runeKey: string | null;
  blocks: MysticCourseBlockSource[];
};
