import { NextRequest, NextResponse } from "next/server";

import {
  LIVING_THE_RUNES_COURSE_ID,
  LIVING_THE_RUNES_LESSON_COUNT,
} from "@/features/courses/constants/course-ids";
import {
  isLivingTheRunesLessonId,
} from "@/features/courses/content/living-the-runes-runtime";
import {
  mergeCourseProgressComplete,
  mergeCourseProgressOpen,
  toSafeCourseProgress,
} from "@/features/courses/repositories/course-progress-repository";
import {
  progressCompleteRequestSchema,
  progressOpenRequestSchema,
} from "@/features/courses/schemas/course-progress-schema";
import {
  isPremiumUser,
  resolveLivingTheRunesAccess,
} from "@/features/courses/services/resolve-course-access";
import { getProfileSnapshot } from "@/features/profile/services/profile-repository";
import { verifySessionCookie } from "@/lib/auth/session";
import { jsonError } from "@/lib/auth/request-guards";

type RouteContext = {
  params: Promise<{ courseId: string }>;
};

function assertCourseId(courseId: string): boolean {
  return courseId === LIVING_THE_RUNES_COURSE_ID;
}

async function getVerifiedUid(): Promise<string | null> {
  const session = await verifySessionCookie();
  return session.status === "authenticated" ? session.user.uid : null;
}

export async function POST(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  const { courseId } = await context.params;
  if (!assertCourseId(courseId)) {
    return jsonError("Course not found.", 404);
  }

  const uid = await getVerifiedUid();
  if (!uid) {
    return jsonError("Authentication required.", 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const parsed = progressOpenRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid lesson.", 400);
  }

  if (!isLivingTheRunesLessonId(parsed.data.lessonId)) {
    return jsonError("Invalid lesson.", 404);
  }

  const profile = await getProfileSnapshot(uid);
  const access = resolveLivingTheRunesAccess(profile, isPremiumUser(profile));
  if (!access.canOpenLessons) {
    return jsonError("Course access required.", 403);
  }

  try {
    const progress = await mergeCourseProgressOpen({
      uid,
      courseId,
      lessonId: parsed.data.lessonId,
    });
    return NextResponse.json({ progress: toSafeCourseProgress(progress) });
  } catch {
    return jsonError("Unable to update progress.", 503);
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  const { courseId } = await context.params;
  if (!assertCourseId(courseId)) {
    return jsonError("Course not found.", 404);
  }

  const uid = await getVerifiedUid();
  if (!uid) {
    return jsonError("Authentication required.", 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body.", 400);
  }

  const parsed = progressCompleteRequestSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid lesson.", 400);
  }

  if (!isLivingTheRunesLessonId(parsed.data.lessonId)) {
    return jsonError("Invalid lesson.", 404);
  }

  const profile = await getProfileSnapshot(uid);
  const access = resolveLivingTheRunesAccess(profile, isPremiumUser(profile));
  if (!access.canOpenLessons) {
    return jsonError("Course access required.", 403);
  }

  try {
    const progress = await mergeCourseProgressComplete({
      uid,
      courseId,
      lessonId: parsed.data.lessonId,
      totalLessonCount: LIVING_THE_RUNES_LESSON_COUNT,
    });
    return NextResponse.json({ progress: toSafeCourseProgress(progress) });
  } catch {
    return jsonError("Unable to update progress.", 503);
  }
}
