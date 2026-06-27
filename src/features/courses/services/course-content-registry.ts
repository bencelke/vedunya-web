import type { SupportedLocale } from "@/config/app-config";
import {
  LIVING_THE_RUNES_LESSON_COUNT,
  LIVING_THE_RUNES_SLUG,
  resolveCourseSlugFromId,
  RUNES_FIRST_STEPS_LESSON_COUNT,
  RUNES_FIRST_STEPS_SLUG,
} from "@/features/courses/constants/course-ids";
import {
  getLivingTheRunesLesson,
  getLivingTheRunesLessonSummaries,
  isLivingTheRunesLessonId,
} from "@/features/courses/content/living-the-runes-runtime";
import {
  getRunesFirstStepsLesson,
  getRunesFirstStepsLessonSummaries,
  isRunesFirstStepsLessonId,
} from "@/features/courses/content/runes-first-steps-runtime";
import type {
  CourseLesson,
  CourseLessonSummary,
} from "@/features/courses/types/course";

export function getLessonCountForCourseSlug(slug: string): number {
  switch (slug) {
    case LIVING_THE_RUNES_SLUG:
      return LIVING_THE_RUNES_LESSON_COUNT;
    case RUNES_FIRST_STEPS_SLUG:
      return RUNES_FIRST_STEPS_LESSON_COUNT;
    default:
      return 0;
  }
}

export function getLessonCountForCourseId(courseId: string): number {
  const slug = resolveCourseSlugFromId(courseId);
  return slug ? getLessonCountForCourseSlug(slug) : 0;
}

export function getCourseLessonSummaries(
  slug: string,
  locale: SupportedLocale,
): CourseLessonSummary[] {
  switch (slug) {
    case LIVING_THE_RUNES_SLUG:
      return getLivingTheRunesLessonSummaries(locale);
    case RUNES_FIRST_STEPS_SLUG:
      return getRunesFirstStepsLessonSummaries(locale);
    default:
      return [];
  }
}

export function getCourseLesson(
  slug: string,
  lessonId: string,
  locale: SupportedLocale,
): CourseLesson | null {
  switch (slug) {
    case LIVING_THE_RUNES_SLUG:
      return getLivingTheRunesLesson(lessonId, locale);
    case RUNES_FIRST_STEPS_SLUG:
      return getRunesFirstStepsLesson(lessonId, locale);
    default:
      return null;
  }
}

export function isKnownCourseLessonId(slug: string, lessonId: string): boolean {
  switch (slug) {
    case LIVING_THE_RUNES_SLUG:
      return isLivingTheRunesLessonId(lessonId);
    case RUNES_FIRST_STEPS_SLUG:
      return isRunesFirstStepsLessonId(lessonId);
    default:
      return false;
  }
}
