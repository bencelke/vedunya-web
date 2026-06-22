export type LivingTheRunesSourceBlockType =
  | "chapterIntro"
  | "text"
  | "practice"
  | "reflection"
  | "completion";

export type LivingTheRunesBlockSource = {
  type: LivingTheRunesSourceBlockType;
  titleEn: string;
  titleRu: string;
  bodyEn: string;
  bodyRu: string;
};

export type LivingTheRunesLessonSource = {
  id: string;
  order: number;
  titleEn: string;
  titleRu: string;
  summaryEn: string;
  summaryRu: string;
  runeKey: string | null;
  blocks: LivingTheRunesBlockSource[];
};
