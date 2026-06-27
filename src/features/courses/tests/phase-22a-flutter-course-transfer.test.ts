import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getCourseCoverPath } from "@/features/courses/constants/course-assets";
import {
  LIVING_THE_RUNES_COURSE_ID,
  LIVING_THE_RUNES_SLUG,
  RUNES_FIRST_STEPS_COURSE_ID,
  RUNES_FIRST_STEPS_SLUG,
} from "@/features/courses/constants/course-ids";
import { runesFirstStepsCourseMeta } from "@/features/courses/content/runes-first-steps.generated";
import {
  getRunesFirstStepsLesson,
  getRunesFirstStepsLessonSummaries,
} from "@/features/courses/content/runes-first-steps-runtime";
import {
  getLivingTheRunesLessonSummaries,
} from "@/features/courses/content/living-the-runes-runtime";
import { mergeCourseCatalog } from "@/features/courses/services/merge-course-catalog";
import { resolveCourseAccess } from "@/features/courses/services/resolve-course-access";

function readSource(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), "utf8");
}

function readPublicAsset(relativePath: string): boolean {
  try {
    readFileSync(resolve(process.cwd(), "public", relativePath));
    return true;
  } catch {
    return false;
  }
}

describe("Phase 22A — Flutter course transfer", () => {
  it("renders transferred courses on RU and EN catalog fallbacks", () => {
    const ru = mergeCourseCatalog("ru", []);
    const en = mergeCourseCatalog("en", []);

    expect(ru).toHaveLength(2);
    expect(en).toHaveLength(2);
    expect(ru[0]?.slug).toBe(RUNES_FIRST_STEPS_SLUG);
    expect(en[0]?.slug).toBe(RUNES_FIRST_STEPS_SLUG);
  });

  it("uses RU titles on RU route and EN titles on EN route for Runes: First Steps", () => {
    const ru = mergeCourseCatalog("ru", []).find(
      (course) => course.slug === RUNES_FIRST_STEPS_SLUG,
    );
    const en = mergeCourseCatalog("en", []).find(
      (course) => course.slug === RUNES_FIRST_STEPS_SLUG,
    );

    expect(ru?.title).toBe(runesFirstStepsCourseMeta.titleRu);
    expect(en?.title).toBe(runesFirstStepsCourseMeta.titleEn);
  });

  it("lists Runes: First Steps before Living the Runes", () => {
    const courses = mergeCourseCatalog("en", []);
    expect(courses.map((course) => course.slug)).toEqual([
      RUNES_FIRST_STEPS_SLUG,
      LIVING_THE_RUNES_SLUG,
    ]);
  });

  it("renders lesson count and ordered lesson list for Runes: First Steps", () => {
    const summaries = getRunesFirstStepsLessonSummaries("en");
    expect(summaries).toHaveLength(1);
    expect(summaries[0]?.id).toBe("how-to-begin-working-with-runes");
    expect(summaries[0]?.order).toBe(1);
  });

  it("renders exact Flutter lesson title and body in lesson reader data", () => {
    const lesson = getRunesFirstStepsLesson("how-to-begin-working-with-runes", "en");
    expect(lesson?.title).toBe("How to Begin Working with Runes");
    expect(lesson?.body.some((block) => block.type === "heading")).toBe(true);
    expect(
      lesson?.body.some(
        (block) =>
          block.type === "paragraph" &&
          block.text.includes("For a beginner, runes are first of all a language"),
      ),
    ).toBe(true);
  });

  it("does not expose paid Living the Runes body without entitlement", () => {
    const access = resolveCourseAccess({
      accessType: "paid",
      status: "available",
      productId: "course_runes_24_inner_strength",
      courseId: LIVING_THE_RUNES_COURSE_ID,
      profile: null,
      isPremiumUser: false,
      ownedCourseIds: new Set(),
    });
    expect(access.canOpenLessons).toBe(false);
    expect(access.isPaidLocked).toBe(true);
  });

  it("unlocks owned paid course through ownedCourses entitlement", () => {
    const access = resolveCourseAccess({
      accessType: "paid",
      status: "available",
      productId: "course_runes_24_inner_strength",
      courseId: LIVING_THE_RUNES_COURSE_ID,
      profile: null,
      isPremiumUser: false,
      ownedCourseIds: new Set([LIVING_THE_RUNES_COURSE_ID]),
    });
    expect(access.canOpenLessons).toBe(true);
    expect(access.isPurchased).toBe(true);
  });

  it("allows free Runes: First Steps without purchase", () => {
    const access = resolveCourseAccess({
      accessType: "free",
      status: "available",
      courseId: RUNES_FIRST_STEPS_COURSE_ID,
      profile: null,
      isPremiumUser: false,
    });
    expect(access.canOpenLessons).toBe(true);
    expect(access.isPaidLocked).toBe(false);
  });

  it("supports progress completion for both course IDs via shared gate", () => {
    const gate = readSource(
      "src/features/courses/server/resolve-course-progress-gate.ts",
    );
    expect(gate).toContain("resolveCourseAccess");
    expect(gate).toContain("isKnownCourseLessonId");
    expect(gate).not.toContain("grantShopifyCourseEntitlement");
  });

  it("resolves copied asset paths for both courses", () => {
    expect(getCourseCoverPath(RUNES_FIRST_STEPS_SLUG)).toContain(
      "runes-first-steps/cover.jpg",
    );
    expect(getCourseCoverPath(LIVING_THE_RUNES_SLUG)).toContain(
      "living-the-runes/cover.png",
    );
    expect(
      readPublicAsset("assets/courses/runes-first-steps/cover.jpg"),
    ).toBe(true);
    expect(readPublicAsset("assets/courses/living-the-runes/cover.png")).toBe(
      true,
    );
  });

  it("does not show undefined EN/RU lesson fields for transferred free course", () => {
    for (const locale of ["en", "ru"] as const) {
      const lesson = getRunesFirstStepsLesson(
        "how-to-begin-working-with-runes",
        locale,
      );
      expect(lesson?.title).toBeTruthy();
      expect(lesson?.title).not.toContain("undefined");
      for (const block of lesson?.body ?? []) {
        if ("text" in block) {
          expect(block.text).not.toContain("undefined");
        }
        if ("prompt" in block) {
          expect(block.prompt).not.toContain("undefined");
        }
      }
    }
  });

  it("preserves Shopify ownedCourses entitlement path", () => {
    const entitlements = readSource(
      "src/features/payments/server/entitlement-repository.ts",
    );
    expect(entitlements).toContain("ownedCourses");
    expect(entitlements).toContain('provider: "shopify"');
  });

  it("lists 28 Living the Runes lessons from Flutter port", () => {
    expect(getLivingTheRunesLessonSummaries("en")).toHaveLength(28);
  });

  it("loads lessons through course content registry for both slugs", () => {
    const registry = readSource(
      "src/features/courses/services/course-content-registry.ts",
    );
    expect(registry).toContain(RUNES_FIRST_STEPS_SLUG);
    expect(registry).toContain(LIVING_THE_RUNES_SLUG);
  });
});
