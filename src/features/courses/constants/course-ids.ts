export const LIVING_THE_RUNES_COURSE_ID = "runes_24_inner_strength" as const;
export const LIVING_THE_RUNES_SLUG = "living-the-runes" as const;
export const LIVING_THE_RUNES_PRODUCT_ID =
  "course_runes_24_inner_strength" as const;
export const LIVING_THE_RUNES_LESSON_COUNT = 28 as const;

export const RUNES_FIRST_STEPS_COURSE_ID = "runes-first-steps" as const;
export const RUNES_FIRST_STEPS_SLUG = "runes-first-steps" as const;
export const RUNES_FIRST_STEPS_LESSON_COUNT = 1 as const;

export type LivingTheRunesCourseId = typeof LIVING_THE_RUNES_COURSE_ID;
export type LivingTheRunesSlug = typeof LIVING_THE_RUNES_SLUG;
export type RunesFirstStepsCourseId = typeof RUNES_FIRST_STEPS_COURSE_ID;
export type RunesFirstStepsSlug = typeof RUNES_FIRST_STEPS_SLUG;

export const COURSE_ID_BY_SLUG: Record<string, string> = {
  [LIVING_THE_RUNES_SLUG]: LIVING_THE_RUNES_COURSE_ID,
  [RUNES_FIRST_STEPS_SLUG]: RUNES_FIRST_STEPS_COURSE_ID,
};

export const COURSE_SLUG_BY_ID: Record<string, string> = {
  [LIVING_THE_RUNES_COURSE_ID]: LIVING_THE_RUNES_SLUG,
  [RUNES_FIRST_STEPS_COURSE_ID]: RUNES_FIRST_STEPS_SLUG,
};

export const LOCAL_COURSE_SLUG_ORDER = [
  RUNES_FIRST_STEPS_SLUG,
  LIVING_THE_RUNES_SLUG,
] as const;

export function resolveCourseIdFromSlug(slug: string): string | null {
  return COURSE_ID_BY_SLUG[slug.trim()] ?? null;
}

export function resolveCourseSlugFromId(courseId: string): string | null {
  return COURSE_SLUG_BY_ID[courseId.trim()] ?? null;
}

export function isKnownCourseSlug(slug: string): boolean {
  return slug.trim() in COURSE_ID_BY_SLUG;
}
