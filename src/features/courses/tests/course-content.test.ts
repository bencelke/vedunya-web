import { describe, expect, it } from "vitest";

import {
  LIVING_THE_RUNES_COURSE_ID,
  LIVING_THE_RUNES_LESSON_COUNT,
  LIVING_THE_RUNES_PRODUCT_ID,
  LIVING_THE_RUNES_SLUG,
} from "@/features/courses/constants/course-ids";
import {
  getLivingTheRunesLessonIds,
  livingTheRunesLessonsSource,
} from "@/features/courses/content/living-the-runes-runtime";
import { normalizeRuneKey } from "@/features/runes/constants/rune-aliases";
import { courseLessonSchema } from "@/features/courses/schemas/course-schema";
import { getLivingTheRunesLesson } from "@/features/courses/content/living-the-runes-runtime";

describe("living the runes content", () => {
  it("contains exactly 28 lessons", () => {
    expect(livingTheRunesLessonsSource).toHaveLength(28);
    expect(LIVING_THE_RUNES_LESSON_COUNT).toBe(28);
  });

  it("has unique lesson IDs and order 1–28", () => {
    const ids = livingTheRunesLessonsSource.map((lesson) => lesson.id);
    expect(new Set(ids).size).toBe(28);
    expect(ids[0]).toBe("living-01-what-it-means");
    expect(ids[27]).toBe("living-28-othala");
    expect(livingTheRunesLessonsSource.map((l) => l.order)).toEqual(
      Array.from({ length: 28 }, (_, i) => i + 1),
    );
  });

  it("maps raidho to canonical raido for rune lessons", () => {
    const raidhoLesson = livingTheRunesLessonsSource.find(
      (lesson) => lesson.id === "living-09-raidho",
    );
    expect(raidhoLesson?.runeKey).toBe("raidho");
    const lesson = getLivingTheRunesLesson("living-09-raidho", "en");
    expect(lesson?.runeId).toBe(normalizeRuneKey("raidho"));
    expect(lesson?.runeId).toBe("raido");
  });

  it("validates EN and RU lesson contracts", () => {
    for (const id of getLivingTheRunesLessonIds()) {
      for (const locale of ["en", "ru"] as const) {
        const lesson = getLivingTheRunesLesson(id, locale);
        expect(lesson).not.toBeNull();
        expect(courseLessonSchema.safeParse(lesson).success).toBe(true);
      }
    }
  });

  it("preserves audited identifiers", () => {
    expect(LIVING_THE_RUNES_COURSE_ID).toBe("runes_24_inner_strength");
    expect(LIVING_THE_RUNES_SLUG).toBe("living-the-runes");
    expect(LIVING_THE_RUNES_PRODUCT_ID).toBe("course_runes_24_inner_strength");
  });
});
