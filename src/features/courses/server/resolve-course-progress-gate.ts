import "server-only";

import type { SupportedLocale } from "@/config/app-config";
import { resolveCourseSlugFromId } from "@/features/courses/constants/course-ids";
import { getLocalCourseSummaryById } from "@/features/courses/content/local-course-catalog";
import {
  getLessonCountForCourseId,
  isKnownCourseLessonId,
} from "@/features/courses/services/course-content-registry";
import {
  isPremiumUser,
  resolveCourseAccess,
} from "@/features/courses/services/resolve-course-access";
import type { CourseAccessState } from "@/features/courses/types/course";
import { loadOwnedCourseIds } from "@/features/payments/server/load-payment-access";
import { getProfileSnapshot } from "@/features/profile/services/profile-repository";

export async function resolveCourseProgressGate(input: {
  uid: string;
  courseId: string;
  lessonId: string;
  locale?: SupportedLocale;
}): Promise<
  | {
      ok: true;
      slug: string;
      access: CourseAccessState;
      totalLessonCount: number;
    }
  | { ok: false; reason: "course_not_found" | "invalid_lesson" | "forbidden" }
> {
  const slug = resolveCourseSlugFromId(input.courseId);
  if (!slug) {
    return { ok: false, reason: "course_not_found" };
  }

  if (!isKnownCourseLessonId(slug, input.lessonId)) {
    return { ok: false, reason: "invalid_lesson" };
  }

  const summary = getLocalCourseSummaryById(
    input.courseId,
    input.locale ?? "en",
  );
  if (!summary) {
    return { ok: false, reason: "course_not_found" };
  }

  const profile = await getProfileSnapshot(input.uid);
  const ownedCourseIds = await loadOwnedCourseIds(input.uid);
  const access = resolveCourseAccess({
    accessType: summary.accessType,
    status: summary.status,
    productId: summary.productId,
    courseId: summary.id,
    profile,
    isPremiumUser: isPremiumUser(profile),
    ownedCourseIds,
  });

  if (!access.canOpenLessons) {
    return { ok: false, reason: "forbidden" };
  }

  return {
    ok: true,
    slug,
    access,
    totalLessonCount: getLessonCountForCourseId(input.courseId),
  };
}
