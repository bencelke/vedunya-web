import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  LIVING_THE_RUNES_COURSE_ID,
  LIVING_THE_RUNES_SLUG,
} from "@/features/courses/constants/course-ids";
import { getLivingTheRunesLesson } from "@/features/courses/content/living-the-runes-runtime";
import {
  resolveCourseAccess,
} from "@/features/courses/services/resolve-course-access";

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("Phase 22C — paid course owned-state contract", () => {
  it("uses users/{uid}/ownedCourses/{courseId} with status active", () => {
    const repo = readSource(
      "src/features/payments/server/entitlement-repository.ts",
    );

    expect(repo).toContain('const OWNED_COURSES_COLLECTION = "ownedCourses"');
    expect(repo).toContain('.collection(OWNED_COURSES_COLLECTION)');
    expect(repo).toContain('if (entitlement?.status === "active")');
    expect(repo).toContain("ownedCourseIds.add(doc.id)");
  });

  it("unlocks living-the-runes only with active ownedCourses entitlement", () => {
    const locked = resolveCourseAccess({
      accessType: "paid",
      status: "available",
      productId: "course_runes_24_inner_strength",
      courseId: LIVING_THE_RUNES_COURSE_ID,
      profile: null,
      isPremiumUser: true,
      ownedCourseIds: new Set(),
    });

    const owned = resolveCourseAccess({
      accessType: "paid",
      status: "available",
      productId: "course_runes_24_inner_strength",
      courseId: LIVING_THE_RUNES_COURSE_ID,
      profile: null,
      isPremiumUser: false,
      ownedCourseIds: new Set([LIVING_THE_RUNES_COURSE_ID]),
    });

    expect(locked.canOpenLessons).toBe(false);
    expect(locked.isPaidLocked).toBe(true);
    expect(owned.canOpenLessons).toBe(true);
    expect(owned.isPurchased).toBe(true);
    expect(owned.isPremiumLocked).toBe(false);
  });

  it("shows owned badge state when purchased", () => {
    const badge = readSource(
      "src/features/courses/components/course-access-badge.tsx",
    );

    expect(badge).toContain("isPurchased");
    expect(badge).toContain('t("accessOwned")');
  });

  it("allows lesson rows when canOpenLessons is true", () => {
    const row = readSource("src/features/courses/components/lesson-row.tsx");
    expect(row).toContain('if (isLocked)');
    expect(row).toContain("<Link");
  });

  it("blocks lesson body in reader when canOpenLessons is false", () => {
    const reader = readSource(
      "src/features/courses/components/lesson-reader-screen.tsx",
    );
    expect(reader).toContain("if (!canOpenLessons)");
    expect(reader).toContain("CourseAccessNotice");
  });

  it("stores progress under courseProgress with living-the-runes course id", () => {
    const progress = readSource(
      "src/features/courses/repositories/course-progress-repository.ts",
    );
    const gate = readSource(
      "src/features/courses/server/resolve-course-progress-gate.ts",
    );

    expect(progress).toContain('const COURSE_PROGRESS_SUBCOLLECTION = "courseProgress"');
    expect(gate).toContain("getLessonCountForCourseId");
    expect(LIVING_THE_RUNES_COURSE_ID).toBe("runes_24_inner_strength");
    expect(LIVING_THE_RUNES_SLUG).toBe("living-the-runes");
  });

  it("does not grant paid access from client-only helpers", () => {
    const gate = readSource(
      "src/features/courses/server/resolve-course-progress-gate.ts",
    );
    expect(gate).not.toContain("localStorage");
    expect(gate).not.toContain("grantShopifyCourseEntitlement");
  });

  it("documents manual QA Firestore minimum fields", () => {
    const repo = readSource(
      "src/features/payments/server/entitlement-repository.ts",
    );
    const types = readSource("src/features/payments/types/payment.ts");

    expect(types).toContain('"active" | "refunded" | "pending"');
    expect(repo).toContain("courseId: input.entitlement.courseId");
    expect(repo).toContain("status: input.entitlement.status");
  });
});

describe("Phase 22C — living-the-runes lesson content when entitled", () => {
  it("renders lesson body for entitled locale without undefined", () => {
    const lesson = getLivingTheRunesLesson("living-01-what-it-means", "en");
    expect(lesson?.title).toBe("What It Means to Live a Rune");
    expect(lesson?.body.length).toBeGreaterThan(0);
    expect(JSON.stringify(lesson)).not.toContain("undefined");
  });
});
