import type { SupportedLocale } from "@/config/app-config";
import {
  LIVING_THE_RUNES_COURSE_ID,
  LIVING_THE_RUNES_LESSON_COUNT,
  LIVING_THE_RUNES_PRODUCT_ID,
  LIVING_THE_RUNES_SLUG,
} from "@/features/courses/constants/course-ids";
import { getCourseCoverPath } from "@/features/courses/constants/course-assets";
import type { CourseSummary } from "@/features/courses/types/course";

export function getLocalCourseCatalog(
  locale: SupportedLocale,
): CourseSummary[] {
  const isRu = locale === "ru";

  return [
    {
      id: LIVING_THE_RUNES_COURSE_ID,
      slug: LIVING_THE_RUNES_SLUG,
      title: isRu
        ? "Проживание Рун: 24 шага к внутренней силе"
        : "Living the Runes: 24 Steps to Inner Strength",
      description: isRu
        ? "Этот курс создан не для механического запоминания значений рун. Его задача — провести вас через каждую руну как через внутренний опыт: наблюдение, вопрос, действие и закрепление."
        : "This course is not about memorizing rune meanings mechanically. It is designed to guide you through each rune as an inner experience: observation, reflection, action, and integration.",
      coverAssetPath: getCourseCoverPath(LIVING_THE_RUNES_SLUG),
      lessonCount: LIVING_THE_RUNES_LESSON_COUNT,
      language: locale,
      accessType: "paid",
      status: "available",
      productId: LIVING_THE_RUNES_PRODUCT_ID,
    },
  ];
}

export function getLocalCourseSummaryBySlug(
  slug: string,
  locale: SupportedLocale,
): CourseSummary | null {
  return getLocalCourseCatalog(locale).find((course) => course.slug === slug) ?? null;
}

export function getLocalCourseSummaryById(
  courseId: string,
  locale: SupportedLocale,
): CourseSummary | null {
  return getLocalCourseCatalog(locale).find((course) => course.id === courseId) ?? null;
}
