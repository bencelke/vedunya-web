import { NextRequest, NextResponse } from "next/server";

import {
  mergeCourseProgressComplete,
  mergeCourseProgressOpen,
  toSafeCourseProgress,
} from "@/features/courses/repositories/course-progress-repository";
import {
  progressCompleteRequestSchema,
  progressOpenRequestSchema,
} from "@/features/courses/schemas/course-progress-schema";
import { resolveCourseProgressGate } from "@/features/courses/server/resolve-course-progress-gate";
import { verifySessionCookie } from "@/lib/auth/session";
import { jsonError } from "@/lib/auth/request-guards";

type RouteContext = {
  params: Promise<{ courseId: string }>;
};

async function getVerifiedUid(): Promise<string | null> {
  const session = await verifySessionCookie();
  return session.status === "authenticated" ? session.user.uid : null;
}

export async function POST(
  request: NextRequest,
  context: RouteContext,
): Promise<Response> {
  const { courseId } = await context.params;

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

  const gate = await resolveCourseProgressGate({
    uid,
    courseId,
    lessonId: parsed.data.lessonId,
  });

  if (!gate.ok) {
    if (gate.reason === "course_not_found" || gate.reason === "invalid_lesson") {
      return jsonError("Course not found.", 404);
    }
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

  const gate = await resolveCourseProgressGate({
    uid,
    courseId,
    lessonId: parsed.data.lessonId,
  });

  if (!gate.ok) {
    if (gate.reason === "course_not_found" || gate.reason === "invalid_lesson") {
      return jsonError("Course not found.", 404);
    }
    return jsonError("Course access required.", 403);
  }

  try {
    const progress = await mergeCourseProgressComplete({
      uid,
      courseId,
      lessonId: parsed.data.lessonId,
      totalLessonCount: gate.totalLessonCount,
    });
    return NextResponse.json({ progress: toSafeCourseProgress(progress) });
  } catch {
    return jsonError("Unable to update progress.", 503);
  }
}
