import type { CourseLessonSummary } from "@/features/courses/types/course";

import { LessonRow, type LessonRowState } from "./lesson-row";

type LessonListProps = {
  courseSlug: string;
  lessons: CourseLessonSummary[];
  completedLessonIds: string[];
  currentLessonId: string | null;
  canOpenLessons: boolean;
  completedLabel: string;
  currentLabel: string;
  lockedLabel: string;
  getLessonIconAlt: (lesson: CourseLessonSummary) => string;
};

function resolveLessonState(input: {
  lesson: CourseLessonSummary;
  index: number;
  lessons: CourseLessonSummary[];
  completedLessonIds: string[];
  currentLessonId: string | null;
  canOpenLessons: boolean;
}): LessonRowState {
  if (!input.canOpenLessons) {
    return "locked";
  }

  if (input.completedLessonIds.includes(input.lesson.id)) {
    return "completed";
  }

  if (input.lesson.id === input.currentLessonId) {
    return "current";
  }

  return "available";
}

function resolveStatusLabel(
  state: LessonRowState,
  labels: {
    completedLabel: string;
    currentLabel: string;
    lockedLabel: string;
  },
): string {
  switch (state) {
    case "completed":
      return labels.completedLabel;
    case "current":
      return labels.currentLabel;
    case "locked":
      return labels.lockedLabel;
    default:
      return "";
  }
}

export function LessonList({
  courseSlug,
  lessons,
  completedLessonIds,
  currentLessonId,
  canOpenLessons,
  completedLabel,
  currentLabel,
  lockedLabel,
  getLessonIconAlt,
}: LessonListProps) {
  return (
    <ol className="grid min-w-0 gap-3">
      {lessons.map((lesson, index) => {
        const state = resolveLessonState({
          lesson,
          index,
          lessons,
          completedLessonIds,
          currentLessonId,
          canOpenLessons,
        });

        return (
          <li key={lesson.id} className="min-w-0">
            <LessonRow
              lesson={lesson}
              courseSlug={courseSlug}
              state={state}
              statusLabel={resolveStatusLabel(state, {
                completedLabel,
                currentLabel,
                lockedLabel,
              })}
              iconAlt={getLessonIconAlt(lesson)}
            />
          </li>
        );
      })}
    </ol>
  );
}
