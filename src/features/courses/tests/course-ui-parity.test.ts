import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { getCourseCoverPath } from "@/features/courses/constants/course-assets";
import {
  LIVING_THE_RUNES_LESSON_COUNT,
  LIVING_THE_RUNES_SLUG,
} from "@/features/courses/constants/course-ids";
import { getLivingTheRunesLessonSummaries } from "@/features/courses/content/living-the-runes-runtime";
import { mergeCourseCatalog } from "@/features/courses/services/merge-course-catalog";
import {
  COURSE_PURCHASE_FLOW_WIRED,
  resolveCourseAccess,
} from "@/features/courses/services/resolve-course-access";
import { resolveRuneId } from "@/features/runes/constants/rune-aliases";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";

const WEB_ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(resolve(WEB_ROOT, relativePath), "utf8");
}

describe("Courses UI parity", () => {
  it("uses mystic today column on courses routes", () => {
    const catalog = readSource("src/features/courses/components/courses-screen.tsx");
    const detail = readSource(
      "src/features/courses/components/course-detail-screen.tsx",
    );
    const lesson = readSource(
      "src/features/courses/components/lesson-reader-screen.tsx",
    );
    expect(catalog).toContain("mystic-today-column");
    expect(detail).toContain("mystic-today-column");
    expect(lesson).toContain("mystic-today-column");
  });

  it("uses cosmic cards for course catalog and lesson rows", () => {
    const card = readSource("src/features/courses/components/course-card.tsx");
    const row = readSource("src/features/courses/components/lesson-row.tsx");
    expect(card).toContain("mystic-cosmic-card-elevated");
    expect(row).toContain("mystic-cosmic-card");
  });

  it("does not expose Feed or Admin in courses screens", () => {
    const source = readSource("src/features/courses/components/courses-screen.tsx");
    expect(source).not.toContain("/feed");
    expect(source).not.toContain("/admin");
  });
});

describe("Courses catalog fallback", () => {
  it("shows Living the Runes from local fallback when Sanity is empty", () => {
    const courses = mergeCourseCatalog("en", []);
    expect(courses).toHaveLength(1);
    expect(courses[0]?.slug).toBe(LIVING_THE_RUNES_SLUG);
    expect(courses[0]?.lessonCount).toBe(28);
  });

  it("has course cover asset for Living the Runes", () => {
    const cover = getCourseCoverPath(LIVING_THE_RUNES_SLUG);
    expect(cover).toContain("living-the-runes/cover.png");
  });

  it("lists 28 lessons in runtime content", () => {
    expect(getLivingTheRunesLessonSummaries("en")).toHaveLength(
      LIVING_THE_RUNES_LESSON_COUNT,
    );
    expect(LIVING_THE_RUNES_LESSON_COUNT).toBe(28);
  });
});

describe("Courses access locking", () => {
  it("does not unlock paid course for Mystic Premium alone", () => {
    const access = resolveCourseAccess({
      accessType: "paid",
      status: "available",
      productId: "course_runes_24_inner_strength",
      profile: null,
      isPremiumUser: true,
    });
    expect(access.canOpenLessons).toBe(false);
    expect(access.isPaidLocked).toBe(true);
  });

  it("does not wire fake checkout", () => {
    expect(COURSE_PURCHASE_FLOW_WIRED).toBe(false);
  });

  it("shows honest coming soon state for locked paid course", () => {
    const access = resolveCourseAccess({
      accessType: "paid",
      status: "available",
      productId: "course_runes_24_inner_strength",
      profile: null,
      isPremiumUser: false,
    });
    expect(access.showComingSoon).toBe(true);
    expect(access.showPurchaseUnavailable).toBe(true);
  });
});

describe("Courses localization", () => {
  it("includes polished EN course labels", () => {
    expect(en.courses.catalogEyebrow).toContain("Knowledge paths");
    expect(en.courses.resumePath).toContain("Resume path");
    expect(en.courses.comingSoonCourseMessage).toContain("open soon");
  });

  it("includes polished RU course labels", () => {
    expect(ru.courses.catalogEyebrow).toContain("Пути знания");
    expect(ru.courses.resumePath).toContain("пути");
    expect(ru.courses.comingSoonCourseMessage).toContain("скоро");
  });
});

describe("Courses lesson route integrity", () => {
  it("preserves raidho alias unrelated to course routes", () => {
    expect(resolveRuneId("raidho")).toBe("raido");
  });

  it("lesson reader links back to course", () => {
    const source = readSource(
      "src/features/courses/components/lesson-reader-screen.tsx",
    );
    expect(source).toContain("LessonNavigation");
    expect(source).toContain("backLabel");
  });
});
