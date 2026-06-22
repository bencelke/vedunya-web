import type { SupportedLocale } from "@/config/app-config";

export type CourseAccessType = "free" | "paid" | "premium";
export type CourseStatus = "available" | "coming-soon";

export type CourseContentBlockType =
  | "heading"
  | "paragraph"
  | "bullet-list"
  | "numbered-list"
  | "quote"
  | "practice"
  | "reflection";

export type CourseContentBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "bullet-list"; items: string[] }
  | { type: "numbered-list"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "practice"; title: string; text: string }
  | { type: "reflection"; prompt: string };

export type CourseSummary = {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverAssetPath: string | null;
  lessonCount: number;
  estimatedDuration?: string;
  language: SupportedLocale;
  accessType: CourseAccessType;
  status: CourseStatus;
  productId?: string;
};

export type CourseLessonSummary = {
  id: string;
  order: number;
  title: string;
  subtitle?: string;
  runeId?: string;
};

export type CourseLesson = CourseLessonSummary & {
  body: CourseContentBlock[];
};

export type CourseDetail = {
  summary: CourseSummary;
  lessons: CourseLessonSummary[];
};

export type CourseAccessState = {
  canOpenLessons: boolean;
  isPurchased: boolean;
  isPremiumLocked: boolean;
  isPaidLocked: boolean;
  showComingSoon: boolean;
  showPurchaseUnavailable: boolean;
};

export type CourseCatalogItem = CourseSummary & {
  progressPercent: number | null;
  completedLessonCount: number | null;
  isCompleted: boolean | null;
  resumeLessonId: string | null;
  access: CourseAccessState;
};
