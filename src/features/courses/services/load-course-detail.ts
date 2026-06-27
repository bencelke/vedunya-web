import "server-only";

import type { SupportedLocale } from "@/config/app-config";
import {
  resolveCourseIdFromSlug,
} from "@/features/courses/constants/course-ids";
import { getLocalCourseSummaryBySlug } from "@/features/courses/content/local-course-catalog";
import {
  getCourseLesson,
  getCourseLessonSummaries,
  getLessonCountForCourseSlug,
  isKnownCourseLessonId,
} from "@/features/courses/services/course-content-registry";
import { readCourseProgress } from "@/features/courses/repositories/course-progress-repository";
import {
  isPremiumUser,
  resolveCourseAccess,
} from "@/features/courses/services/resolve-course-access";
import {
  filterValidCompletedLessonIds,
  resolveResumeLessonId,
} from "@/features/courses/services/resolve-course-resume";
import { loadUserEntitlements } from "@/features/payments/server/entitlement-repository";
import { getProfileSnapshot } from "@/features/profile/services/profile-repository";
import { getCurrentUser } from "@/lib/auth/current-user";

export async function loadCourseDetail(slug: string, locale: SupportedLocale) {
  const courseId = resolveCourseIdFromSlug(slug);
  if (!courseId) return null;

  const summary = getLocalCourseSummaryBySlug(slug, locale);
  if (!summary) return null;

  const lessons = getCourseLessonSummaries(slug, locale);
  const lessonCount = getLessonCountForCourseSlug(slug);

  const sessionUser = await getCurrentUser();
  const profile = sessionUser
    ? await getProfileSnapshot(sessionUser.uid)
    : null;
  const progress = sessionUser
    ? await readCourseProgress(sessionUser.uid, courseId)
    : null;
  const entitlements = sessionUser
    ? await loadUserEntitlements(sessionUser.uid)
    : null;

  const validIds = new Set(lessons.map((lesson) => lesson.id));
  const completedIds = progress
    ? filterValidCompletedLessonIds(progress.completedLessonIds, validIds)
    : [];

  const access = resolveCourseAccess({
    accessType: summary.accessType,
    status: summary.status,
    productId: summary.productId,
    courseId: summary.id,
    profile,
    isPremiumUser: isPremiumUser(profile),
    ownedCourseIds: entitlements?.ownedCourseIds,
  });

  return {
    summary: {
      ...summary,
      lessonCount: lessonCount || summary.lessonCount,
    },
    lessons,
    progress: progress
      ? {
          ...progress,
          completedLessonIds: completedIds,
        }
      : null,
    access,
    resumeLessonId: resolveResumeLessonId({ lessons, progress }),
  };
}

export async function loadLesson(input: {
  slug: string;
  lessonId: string;
  locale: SupportedLocale;
}) {
  const courseId = resolveCourseIdFromSlug(input.slug);
  if (!courseId || !isKnownCourseLessonId(input.slug, input.lessonId)) {
    return null;
  }

  const detail = await loadCourseDetail(input.slug, input.locale);
  if (!detail) return null;

  const lesson = getCourseLesson(input.slug, input.lessonId, input.locale);
  if (!lesson) return null;

  const lessonIds = detail.lessons.map((item) => item.id);
  const currentIndex = lessonIds.indexOf(input.lessonId);
  const previousLessonId = currentIndex > 0 ? lessonIds[currentIndex - 1] : null;
  const nextLessonId =
    currentIndex >= 0 && currentIndex < lessonIds.length - 1
      ? lessonIds[currentIndex + 1]
      : null;

  const isCompleted = detail.progress?.completedLessonIds.includes(
    input.lessonId,
  );

  return {
    course: detail.summary,
    access: detail.access,
    progress: detail.progress,
    lesson,
    previousLessonId,
    nextLessonId,
    isCompleted: Boolean(isCompleted),
  };
}
