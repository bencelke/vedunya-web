import type { CourseProgress } from "@/features/courses/types/course-progress";
import type { CourseLessonSummary } from "@/features/courses/types/course";

export function filterValidCompletedLessonIds(
  completedLessonIds: string[],
  validLessonIds: Set<string>,
): string[] {
  return completedLessonIds.filter((id) => validLessonIds.has(id));
}

export function resolveResumeLessonId(input: {
  lessons: CourseLessonSummary[];
  progress: CourseProgress | null;
}): string | null {
  const total = input.lessons.length;
  if (total <= 0) return null;

  const validIds = new Set(input.lessons.map((lesson) => lesson.id));
  const completed = new Set(
    filterValidCompletedLessonIds(
      input.progress?.completedLessonIds ?? [],
      validIds,
    ),
  );

  if (completed.size >= total) {
    return input.lessons[0]?.id ?? null;
  }

  const lastId = input.progress?.lastOpenedLessonId;
  if (lastId && validIds.has(lastId) && !completed.has(lastId)) {
    return lastId;
  }

  const firstIncomplete = input.lessons.find((lesson) => !completed.has(lesson.id));
  return firstIncomplete?.id ?? input.lessons[0]?.id ?? null;
}

export function computeProgressPercent(
  completedCount: number,
  totalLessonCount: number,
): number {
  if (totalLessonCount <= 0) return 0;
  return Math.min(
    100,
    Math.round((completedCount / totalLessonCount) * 100),
  );
}

export function isCourseComplete(
  completedLessonIds: string[],
  validLessonIds: Set<string>,
  totalLessonCount: number,
): boolean {
  const completed = filterValidCompletedLessonIds(
    completedLessonIds,
    validLessonIds,
  );
  return totalLessonCount > 0 && completed.length >= totalLessonCount;
}
