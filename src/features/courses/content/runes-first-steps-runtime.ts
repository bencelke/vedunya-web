import type { SupportedLocale } from "@/config/app-config";
import { mapMysticLessonBlocks } from "@/features/courses/content/map-mystic-lesson-blocks";
import {
  runesFirstStepsLessonsSource,
  RUNES_FIRST_STEPS_LESSON_COUNT,
} from "@/features/courses/content/runes-first-steps.generated";
import type {
  CourseLesson,
  CourseLessonSummary,
} from "@/features/courses/types/course";

export function getRunesFirstStepsLessonSummaries(
  locale: SupportedLocale,
): CourseLessonSummary[] {
  return runesFirstStepsLessonsSource.map((lesson) => ({
    id: lesson.id,
    order: lesson.order,
    title: locale === "ru" ? lesson.titleRu : lesson.titleEn,
    subtitle: locale === "ru" ? lesson.summaryRu : lesson.summaryEn,
  }));
}

export function getRunesFirstStepsLesson(
  lessonId: string,
  locale: SupportedLocale,
): CourseLesson | null {
  const source = runesFirstStepsLessonsSource.find((lesson) => lesson.id === lessonId);
  if (!source) return null;

  return {
    id: source.id,
    order: source.order,
    title: locale === "ru" ? source.titleRu : source.titleEn,
    subtitle: locale === "ru" ? source.summaryRu : source.summaryEn,
    body: mapMysticLessonBlocks(source.blocks, locale),
  };
}

export function getRunesFirstStepsLessonIds(): string[] {
  return runesFirstStepsLessonsSource.map((lesson) => lesson.id);
}

export function isRunesFirstStepsLessonId(lessonId: string): boolean {
  return runesFirstStepsLessonsSource.some((lesson) => lesson.id === lessonId);
}

export { RUNES_FIRST_STEPS_LESSON_COUNT, runesFirstStepsLessonsSource };
