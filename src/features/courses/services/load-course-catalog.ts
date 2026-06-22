import "server-only";

import type { SupportedLocale } from "@/config/app-config";
import { LIVING_THE_RUNES_SLUG } from "@/features/courses/constants/course-ids";
import { getLivingTheRunesLessonSummaries } from "@/features/courses/content/living-the-runes-runtime";
import {
  fetchSanityCourseCatalog,
  mergeCourseCatalog,
} from "@/features/courses/repositories/course-catalog-repository";
import { readCourseProgress } from "@/features/courses/repositories/course-progress-repository";
import {
  isPremiumUser,
  resolveCourseAccess,
} from "@/features/courses/services/resolve-course-access";
import {
  computeProgressPercent,
  filterValidCompletedLessonIds,
  resolveResumeLessonId,
} from "@/features/courses/services/resolve-course-resume";
import type { CourseCatalogItem } from "@/features/courses/types/course";
import { getProfileSnapshot } from "@/features/profile/services/profile-repository";
import { getCurrentUser } from "@/lib/auth/current-user";

export async function loadCourseCatalog(
  locale: SupportedLocale,
): Promise<CourseCatalogItem[]> {
  const sanityItems = await fetchSanityCourseCatalog();
  const courses = mergeCourseCatalog(locale, sanityItems);
  const sessionUser = await getCurrentUser();
  const profile = sessionUser
    ? await getProfileSnapshot(sessionUser.uid)
    : null;
  const premium = isPremiumUser(profile);

  return Promise.all(
    courses.map(async (course) => {
      const access = resolveCourseAccess({
        accessType: course.accessType,
        status: course.status,
        productId: course.productId,
        profile,
        isPremiumUser: premium,
      });

      let progressPercent: number | null = null;
      let completedLessonCount: number | null = null;
      let isCompleted: boolean | null = null;
      let resumeLessonId: string | null = null;

      if (sessionUser) {
        const progress = await readCourseProgress(sessionUser.uid, course.id);
        if (progress) {
          const validIds = new Set(
            course.slug === LIVING_THE_RUNES_SLUG
              ? getLivingTheRunesLessonSummaries(locale).map((l) => l.id)
              : [],
          );
          const completed = filterValidCompletedLessonIds(
            progress.completedLessonIds,
            validIds,
          );
          completedLessonCount = completed.length;
          progressPercent = computeProgressPercent(
            completed.length,
            course.lessonCount,
          );
          isCompleted = progress.isCompleted;
          if (course.slug === LIVING_THE_RUNES_SLUG) {
            resumeLessonId = resolveResumeLessonId({
              lessons: getLivingTheRunesLessonSummaries(locale),
              progress,
            });
          }
        }
      }

      return {
        ...course,
        progressPercent,
        completedLessonCount,
        isCompleted,
        resumeLessonId,
        access,
      };
    }),
  );
}
