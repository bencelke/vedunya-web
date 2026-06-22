import type { SupportedLocale } from "@/config/app-config";
import {
  LIVING_THE_RUNES_COURSE_ID,
  LIVING_THE_RUNES_LESSON_COUNT,
  LIVING_THE_RUNES_SLUG,
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

  const lessonCount =
    slug === LIVING_THE_RUNES_SLUG
      ? LIVING_THE_RUNES_LESSON_COUNT
      : localFallback?.lessonCount ?? item.lessonCount ?? LIVING_THE_RUNES_LESSON_COUNT;

  return {
    id:
      slug === LIVING_THE_RUNES_SLUG
        ? LIVING_THE_RUNES_COURSE_ID
        : item.id.trim() || localFallback?.id || slug,
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
      lessonCount:
        mapped.slug === LIVING_THE_RUNES_SLUG
          ? LIVING_THE_RUNES_LESSON_COUNT
          : mapped.lessonCount,
    });
  }

  return Array.from(bySlug.values()).sort((a, b) =>
    a.slug.localeCompare(b.slug),
  );
}
