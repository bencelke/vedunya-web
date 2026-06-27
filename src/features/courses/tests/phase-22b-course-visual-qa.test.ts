import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import {
  LIVING_THE_RUNES_COURSE_ID,
  LIVING_THE_RUNES_SLUG,
  RUNES_FIRST_STEPS_SLUG,
} from "@/features/courses/constants/course-ids";
import { getRunesFirstStepsLesson } from "@/features/courses/content/runes-first-steps-runtime";
import { mergeCourseCatalog } from "@/features/courses/services/merge-course-catalog";
import { resolveCourseAccess } from "@/features/courses/services/resolve-course-access";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

describe("Phase 22B — course visual QA and access polish", () => {
  it("shows free and paid access badges on catalog cards", () => {
    const card = readSource("src/features/courses/components/course-card.tsx");
    const badge = readSource(
      "src/features/courses/components/course-access-badge.tsx",
    );

    expect(card).toContain("CourseAccessBadge");
    expect(card).toContain("prefetch={false}");
    expect(card).toContain("touch-manipulation");
    expect(badge).toContain('t("accessFree")');
    expect(badge).toContain('t("accessPaid")');
    expect(en.courses.accessFree).toBe("Free");
    expect(ru.courses.accessFree).toBe("Бесплатно");
  });

  it("renders First Steps and Living the Runes RU/EN catalog titles", () => {
    const ruFirst = mergeCourseCatalog("ru", []).find(
      (course) => course.slug === RUNES_FIRST_STEPS_SLUG,
    );
    const enLiving = mergeCourseCatalog("en", []).find(
      (course) => course.slug === LIVING_THE_RUNES_SLUG,
    );

    expect(ruFirst?.title).toContain("Первые шаги");
    expect(enLiving?.title).toContain("Living the Runes");
    expect(ruFirst?.lessonCount).toBe(1);
    expect(enLiving?.lessonCount).toBe(28);
  });

  it("renders First Steps lesson body without undefined strings", () => {
    for (const locale of ["en", "ru"] as const) {
      const lesson = getRunesFirstStepsLesson(
        "how-to-begin-working-with-runes",
        locale,
      );
      expect(lesson?.body.length).toBeGreaterThan(0);
      const serialized = JSON.stringify(lesson);
      expect(serialized).not.toContain("undefined");
    }
  });

  it("blocks paid Living the Runes lesson body without entitlement", () => {
    const reader = readSource(
      "src/features/courses/components/lesson-reader-screen.tsx",
    );
    const access = resolveCourseAccess({
      accessType: "paid",
      status: "available",
      courseId: LIVING_THE_RUNES_COURSE_ID,
      profile: null,
      isPremiumUser: true,
      ownedCourseIds: new Set(),
    });

    expect(access.canOpenLessons).toBe(false);
    expect(reader).toContain("if (!canOpenLessons)");
    expect(reader).toContain("CourseAccessNotice");
    expect(reader).not.toContain("blocks.map");
  });

  it("opens free First Steps without purchase", () => {
    const access = resolveCourseAccess({
      accessType: "free",
      status: "available",
      courseId: "runes-first-steps",
      profile: null,
      isPremiumUser: false,
    });

    expect(access.canOpenLessons).toBe(true);
    expect(access.isPaidLocked).toBe(false);
  });

  it("marks complete through shared progress gate and course id", () => {
    const completeButton = readSource(
      "src/features/courses/components/lesson-complete-button.tsx",
    );
    const gate = readSource(
      "src/features/courses/server/resolve-course-progress-gate.ts",
    );

    expect(completeButton).toContain("/api/courses/${courseId}/progress/complete");
    expect(completeButton).toContain("setIsSubmitting(true)");
    expect(gate).toContain("resolveCourseAccess");
    expect(gate).not.toContain("grantShopifyCourseEntitlement");
  });

  it("uses tap-friendly navigation on lesson reader controls", () => {
    const nav = readSource(
      "src/features/courses/components/lesson-navigation.tsx",
    );
    const row = readSource("src/features/courses/components/lesson-row.tsx");
    const hero = readSource(
      "src/features/courses/components/course-detail-hero.tsx",
    );

    expect(nav).toContain("prefetch={false}");
    expect(nav).toContain("touch-manipulation");
    expect(row).toContain("prefetch={false}");
    expect(hero).toContain("prefetch={false}");
    expect(hero).toContain("active:scale-[0.98]");
  });

  it("documents known Flutter typo without rewriting lesson copy", () => {
    const lesson = getRunesFirstStepsLesson(
      "how-to-begin-working-with-runes",
      "ru",
    );
    const subtitle = lesson?.subtitle ?? "";
    expect(subtitle).toContain("Эта lesson помогает");
  });
});
