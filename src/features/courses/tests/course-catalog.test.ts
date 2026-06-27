import { describe, expect, it } from "vitest";

import { LIVING_THE_RUNES_SLUG } from "@/features/courses/constants/course-ids";
import { mergeCourseCatalog } from "@/features/courses/services/merge-course-catalog";
import type { SanityCatalogItem } from "@/features/courses/schemas/course-schema";

const livingSanityItem: SanityCatalogItem = {
  id: "living-the-runes",
  slug: "living-the-runes",
  titleEn: "Living the Runes",
  titleRu: "Проживание Рун",
  excerptEn: "Sanity excerpt",
  excerptRu: "Sanity excerpt RU",
  accessType: "paidCourse",
  productId: "course_runes_24_inner_strength",
  lessonCount: 24,
  published: true,
};

describe("course catalog merge", () => {
  it("falls back to local catalog when Sanity is empty", () => {
    const courses = mergeCourseCatalog("en", []);
    expect(courses).toHaveLength(2);
    expect(courses[0]?.slug).toBe("runes-first-steps");
    expect(courses[1]?.slug).toBe(LIVING_THE_RUNES_SLUG);
    expect(courses[1]?.lessonCount).toBe(28);
  });

  it("deduplicates living-the-runes and keeps runtime lesson count 28", () => {
    const courses = mergeCourseCatalog("en", [
      livingSanityItem,
      { ...livingSanityItem, titleEn: "Duplicate" },
    ]);
    expect(courses.filter((c) => c.slug === LIVING_THE_RUNES_SLUG)).toHaveLength(1);
    const living = courses.find((course) => course.slug === LIVING_THE_RUNES_SLUG);
    expect(living?.lessonCount).toBe(28);
  });

  it("uses malformed Sanity safely via merge with local fallback metadata", () => {
    const courses = mergeCourseCatalog("ru", [
      {
        ...livingSanityItem,
        titleRu: "",
        lessonCount: 24,
      },
    ]);
    const living = courses.find((course) => course.slug === LIVING_THE_RUNES_SLUG);
    expect(living?.title.length).toBeGreaterThan(0);
    expect(living?.lessonCount).toBe(28);
  });
});
