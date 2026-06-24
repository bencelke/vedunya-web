import "server-only";

import {
  LIVING_THE_RUNES_COURSE_ID,
  LIVING_THE_RUNES_LESSON_COUNT,
  LIVING_THE_RUNES_SLUG,
} from "@/features/courses/constants/course-ids";
import { readCourseProgress } from "@/features/courses/repositories/course-progress-repository";
import { computeProgressPercent } from "@/features/courses/services/resolve-course-resume";
import type { ProfileSettingsSummary } from "@/features/profile/types/profile-settings-summary";
import { readUniverseRequest } from "@/features/universe-request/server/universe-request-repository";

export async function loadProfileSettingsSummary(input: {
  uid: string;
}): Promise<ProfileSettingsSummary> {
  const [request, progress] = await Promise.all([
    readUniverseRequest(input.uid),
    readCourseProgress(input.uid, LIVING_THE_RUNES_COURSE_ID),
  ]);

  const completedCount = progress?.completedLessonIds.length ?? 0;
  const progressPercent = progress
    ? computeProgressPercent(completedCount, LIVING_THE_RUNES_LESSON_COUNT)
    : null;

  return {
    universeRequest: request
      ? {
          text: request.text,
          category: request.category,
        }
      : null,
    course: {
      slug: LIVING_THE_RUNES_SLUG,
      progressPercent,
      hasStarted: completedCount > 0 || Boolean(progress?.lastOpenedLessonId),
    },
  };
}
