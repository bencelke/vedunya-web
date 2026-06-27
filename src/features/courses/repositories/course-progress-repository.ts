import "server-only";

import { Timestamp } from "firebase-admin/firestore";

import {
  getLessonCountForCourseId,
} from "@/features/courses/services/course-content-registry";
import type { CourseProgress } from "@/features/courses/types/course-progress";
import { getFirebaseAdminFirestore } from "@/lib/firebase-admin/firestore";

const USERS_COLLECTION = "users";
const COURSE_PROGRESS_SUBCOLLECTION = "courseProgress";

function timestampToIso(value: unknown): string | null {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }
  return null;
}

function readStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function normalizeProgress(
  courseId: string,
  data: Record<string, unknown>,
): CourseProgress {
  const totalLessonCount = getLessonCountForCourseId(courseId);
  const completedLessonIds = readStringList(data.completedLessonIds);
  const progressPercent =
    typeof data.progressPercent === "number"
      ? Math.min(100, Math.max(0, data.progressPercent))
      : totalLessonCount > 0
        ? Math.round((completedLessonIds.length / totalLessonCount) * 100)
        : 0;

  const isCompleted =
    data.isCompleted === true ||
    (totalLessonCount > 0 && completedLessonIds.length >= totalLessonCount);

  return {
    courseId,
    completedLessonIds,
    lastOpenedLessonId:
      typeof data.lastLessonId === "string" && data.lastLessonId.trim()
        ? data.lastLessonId.trim()
        : null,
    completedAt: timestampToIso(data.completedAt),
    updatedAt: timestampToIso(data.updatedAt),
    progressPercent,
    isCompleted,
    isEnrolled: data.isEnrolled === true,
  };
}

export async function readCourseProgress(
  uid: string,
  courseId: string,
): Promise<CourseProgress | null> {
  const db = getFirebaseAdminFirestore();
  if (!db || !uid || !courseId) {
    return null;
  }

  const snap = await db
    .collection(USERS_COLLECTION)
    .doc(uid)
    .collection(COURSE_PROGRESS_SUBCOLLECTION)
    .doc(courseId)
    .get();

  if (!snap.exists) {
    return null;
  }

  const data = snap.data() ?? {};
  const resolvedCourseId =
    typeof data.courseId === "string" && data.courseId.trim()
      ? data.courseId.trim()
      : courseId;

  return normalizeProgress(resolvedCourseId, data);
}

export async function mergeCourseProgressOpen(input: {
  uid: string;
  courseId: string;
  lessonId: string;
}): Promise<CourseProgress> {
  const db = getFirebaseAdminFirestore();
  if (!db) {
    throw new Error("progress_unavailable");
  }

  const ref = db
    .collection(USERS_COLLECTION)
    .doc(input.uid)
    .collection(COURSE_PROGRESS_SUBCOLLECTION)
    .doc(input.courseId);

  await db.runTransaction(async (txn) => {
    const snap = await txn.get(ref);
    const existing = snap.data() ?? {};
    const payload: Record<string, unknown> = {
      courseId: input.courseId,
      lastLessonId: input.lessonId,
      lastOpenedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    if (existing.startedAt == null) {
      payload.startedAt = Timestamp.now();
      payload.isEnrolled = true;
    }

    txn.set(ref, payload, { merge: true });
  });

  const progress = await readCourseProgress(input.uid, input.courseId);
  if (!progress) {
    throw new Error("progress_unavailable");
  }
  return progress;
}

export async function mergeCourseProgressComplete(input: {
  uid: string;
  courseId: string;
  lessonId: string;
  totalLessonCount: number;
}): Promise<CourseProgress> {
  const db = getFirebaseAdminFirestore();
  if (!db) {
    throw new Error("progress_unavailable");
  }

  const ref = db
    .collection(USERS_COLLECTION)
    .doc(input.uid)
    .collection(COURSE_PROGRESS_SUBCOLLECTION)
    .doc(input.courseId);

  await db.runTransaction(async (txn) => {
    const snap = await txn.get(ref);
    const existing = snap.data() ?? {};
    const completed = readStringList(existing.completedLessonIds);
    if (!completed.includes(input.lessonId)) {
      completed.push(input.lessonId);
    }

    const percent =
      input.totalLessonCount > 0
        ? Math.min(
            100,
            Math.round((completed.length / input.totalLessonCount) * 100),
          )
        : 0;
    const isCourseDone =
      input.totalLessonCount > 0 &&
      completed.length >= input.totalLessonCount;

    const payload: Record<string, unknown> = {
      courseId: input.courseId,
      completedLessonIds: completed,
      progressPercent: percent,
      isCompleted: isCourseDone,
      updatedAt: Timestamp.now(),
      lastLessonId: input.lessonId,
      lastOpenedAt: Timestamp.now(),
    };

    if (existing.startedAt == null) {
      payload.startedAt = Timestamp.now();
      payload.isEnrolled = true;
    }

    if (isCourseDone && existing.completedAt == null) {
      payload.completedAt = Timestamp.now();
    }

    txn.set(ref, payload, { merge: true });
  });

  const progress = await readCourseProgress(input.uid, input.courseId);
  if (!progress) {
    throw new Error("progress_unavailable");
  }
  return progress;
}

export function toSafeCourseProgress(progress: CourseProgress) {
  return progress;
}
