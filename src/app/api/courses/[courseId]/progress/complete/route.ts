import { NextRequest, NextResponse } from "next/server";

import {
  LIVING_THE_RUNES_COURSE_ID,
  LIVING_THE_RUNES_LESSON_COUNT,
} from "@/features/courses/constants/course-ids";
import { isLivingTheRunesLessonId } from "@/features/courses/content/living-the-runes-runtime";
import {
  mergeCourseProgressComplete,
  toSafeCourseProgress,
} from "@/features/courses/repositories/course-progress-repository";
import { progressCompleteRequestSchema } from "@/features/courses/schemas/course-progress-schema";
import {
  isPremiumUser,
  resolveLivingTheRunesAccess,
} from "@/features/courses/services/resolve-course-access";
import { loadOwnedCourseIds } from "@/features/payments/server/load-payment-access";
import { getProfileSnapshot } from "@/features/profile/services/profile-repository";
import { jsonError } from "@/lib/auth/request-guards";
import { verifySessionCookie } from "@/lib/auth/session";

type RouteContext = { params: Promise<{ courseId: string }> };

export async function POST(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  const { courseId } = await context.params;
  if (courseId !== LIVING_THE_RUNES_COURSE_ID) {
    return jsonError("Course not found.", 404);
  }

  const session = await verifySessionCookie();
  if (session.status !== "authenticated") {
    return jsonError("Authentication required.", 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const parsed = progressCompleteRequestSchema.safeParse(body);
  if (!parsed.success || !isLivingTheRunesLessonId(parsed.data.lessonId)) {
    return jsonError("Invalid lesson.", 400);
  }

  const profile = await getProfileSnapshot(session.user.uid);
  const ownedCourseIds = await loadOwnedCourseIds(session.user.uid);
  const access = resolveLivingTheRunesAccess(
    profile,
    isPremiumUser(profile),
    ownedCourseIds,
  );
  if (!access.canOpenLessons) {
    return jsonError("Course access required.", 403);
  }

  try {
    const progress = await mergeCourseProgressComplete({
      uid: session.user.uid,
      courseId,
      lessonId: parsed.data.lessonId,
      totalLessonCount: LIVING_THE_RUNES_LESSON_COUNT,
    });
    return NextResponse.json({ progress: toSafeCourseProgress(progress) });
  } catch {
    return jsonError("Unable to update progress.", 503);
  }
}
