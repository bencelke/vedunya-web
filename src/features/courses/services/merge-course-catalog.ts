import type { SupportedLocale } from "@/config/app-config";
import {
  LIVING_THE_RUNES_COURSE_ID,
  LIVING_THE_RUNES_LESSON_COUNT,
  LIVING_THE_RUNES_SLUG,
  LOCAL_COURSE_SLUG_ORDER,
  RUNES_FIRST_STEPS_COURSE_ID,
  RUNES_FIRST_STEPS_LESSON_COUNT,
  RUNES_FIRST_STEPS_SLUG,
} from "@/features/courses/constants/course-ids";
import { getLocalCourseCatalog } from "@/features/courses/content/local-course-catalog";
import type { SanityCatalogItem } from "@/features/courses/schemas/course-schema";
import type { CourseSummary } from "@/features/courses/types/course";

function mapSanityAccessType(value: string): CourseSummary["accessType"] {
  switch (value) {
    case "paid":
    case "paidCourse":
      return "paid";
    case "premium":
      return "premium";
    default:
      return "free";
  }
}

function resolveLessonCount(slug: string, fallback: number): number {
  if (slug === LIVING_THE_RUNES_SLUG) return LIVING_THE_RUNES_LESSON_COUNT;
  if (slug === RUNES_FIRST_STEPS_SLUG) return RUNES_FIRST_STEPS_LESSON_COUNT;
  return fallback;
}

function resolveCourseId(slug: string, itemId: string, localFallback?: CourseSummary): string {
  if (slug === LIVING_THE_RUNES_SLUG) return LIVING_THE_RUNES_COURSE_ID;
  if (slug === RUNES_FIRST_STEPS_SLUG) return RUNES_FIRST_STEPS_COURSE_ID;
  return itemId.trim() || localFallback?.id || slug;
}

function mapSanityItem(
  item: SanityCatalogItem,
  locale: SupportedLocale,
): CourseSummary | null {
  const slug = item.slug.trim();
  if (!slug) return null;

  const isRu = locale === "ru";
  const localFallback = getLocalCourseCatalog(locale).find(
    (course) => course.slug === slug || course.id === item.id,
  );

  const lessonCount = resolveLessonCount(
    slug,
    localFallback?.lessonCount ?? item.lessonCount ?? 0,
  );

  return {
    id: resolveCourseId(slug, item.id, localFallback),
    slug,
    title: isRu ? item.titleRu || item.titleEn : item.titleEn || item.titleRu,
    description: isRu
      ? item.excerptRu || item.excerptEn
      : item.excerptEn || item.excerptRu,
    coverAssetPath: localFallback?.coverAssetPath ?? null,
    lessonCount,
    language: locale,
    accessType: mapSanityAccessType(item.accessType),
    status:
      item.isComingSoon || item.published === false ? "coming-soon" : "available",
    productId: item.productId ?? localFallback?.productId,
  };
}

function sortCourses(courses: CourseSummary[]): CourseSummary[] {
  return [...courses].sort((a, b) => {
    const ai = LOCAL_COURSE_SLUG_ORDER.indexOf(
      a.slug as (typeof LOCAL_COURSE_SLUG_ORDER)[number],
    );
    const bi = LOCAL_COURSE_SLUG_ORDER.indexOf(
      b.slug as (typeof LOCAL_COURSE_SLUG_ORDER)[number],
    );
    const aRank = ai === -1 ? Number.MAX_SAFE_INTEGER : ai;
    const bRank = bi === -1 ? Number.MAX_SAFE_INTEGER : bi;
    if (aRank !== bRank) return aRank - bRank;
    return a.slug.localeCompare(b.slug);
  });
}

export function mergeCourseCatalog(
  locale: SupportedLocale,
  sanityItems: SanityCatalogItem[],
): CourseSummary[] {
  const localItems = getLocalCourseCatalog(locale);
  const bySlug = new Map<string, CourseSummary>();

  for (const local of localItems) {
    bySlug.set(local.slug, local);
  }

  for (const item of sanityItems) {
    const mapped = mapSanityItem(item, locale);
    if (!mapped) continue;
    const existing = bySlug.get(mapped.slug);
    bySlug.set(mapped.slug, {
      ...existing,
      ...mapped,
      coverAssetPath: existing?.coverAssetPath ?? mapped.coverAssetPath,
      lessonCount: resolveLessonCount(mapped.slug, mapped.lessonCount),
    });
  }

  return sortCourses(Array.from(bySlug.values()));
}
