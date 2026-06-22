import { describe, expect, it } from "vitest";

import {
  computeProgressPercent,
  filterValidCompletedLessonIds,
  isCourseComplete,
  resolveResumeLessonId,
} from "@/features/courses/services/resolve-course-resume";

const lessons = [
  { id: "living-01-what-it-means", order: 1, title: "One" },
  { id: "living-02-24-day-path", order: 2, title: "Two" },
  { id: "living-03-rune-journal", order: 3, title: "Three" },
];

describe("course progress resume", () => {
  it("resumes last opened incomplete lesson", () => {
    expect(
      resolveResumeLessonId({
        lessons,
        progress: {
          courseId: "runes_24_inner_strength",
          completedLessonIds: ["living-01-what-it-means"],
          lastOpenedLessonId: "living-03-rune-journal",
          completedAt: null,
          updatedAt: null,
          progressPercent: 33,
          isCompleted: false,
          isEnrolled: true,
        },
      }),
    ).toBe("living-03-rune-journal");
  });

  it("opens first incomplete when last opened is complete", () => {
    expect(
      resolveResumeLessonId({
        lessons,
        progress: {
          courseId: "runes_24_inner_strength",
          completedLessonIds: ["living-01-what-it-means"],
          lastOpenedLessonId: "living-01-what-it-means",
          completedAt: null,
          updatedAt: null,
          progressPercent: 33,
          isCompleted: false,
          isEnrolled: true,
        },
      }),
    ).toBe("living-02-24-day-path");
  });

  it("returns first lesson when all lessons are complete", () => {
    expect(
      resolveResumeLessonId({
        lessons,
        progress: {
          courseId: "runes_24_inner_strength",
          completedLessonIds: lessons.map((l) => l.id),
          lastOpenedLessonId: "living-03-rune-journal",
          completedAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
          progressPercent: 100,
          isCompleted: true,
          isEnrolled: true,
        },
      }),
    ).toBe("living-01-what-it-means");
  });

  it("opens first lesson when no progress exists", () => {
    expect(
      resolveResumeLessonId({
        lessons,
        progress: null,
      }),
    ).toBe("living-01-what-it-means");
  });

  it("ignores unknown legacy lesson IDs in UI calculations", () => {
    const valid = new Set(lessons.map((l) => l.id));
    expect(
      filterValidCompletedLessonIds(
        ["living-01-what-it-means", "legacy-lesson"],
        valid,
      ),
    ).toEqual(["living-01-what-it-means"]);
  });

  it("marks course complete only at full lesson count", () => {
    const valid = new Set(lessons.map((l) => l.id));
    expect(
      isCourseComplete(["living-01-what-it-means", "living-02-24-day-path"], valid, 3),
    ).toBe(false);
    expect(
      isCourseComplete(lessons.map((l) => l.id), valid, 3),
    ).toBe(true);
  });

  it("computes progress percent deterministically", () => {
    expect(computeProgressPercent(7, 28)).toBe(25);
    expect(computeProgressPercent(28, 28)).toBe(100);
  });
});
