import {
  LIVING_THE_RUNES_SLUG,
  RUNES_FIRST_STEPS_SLUG,
} from "@/features/courses/constants/course-ids";

export const FOUNDATION_LESSON_ICON = "/assets/courses/living-the-runes/foundation-lesson.svg";

export const COURSE_COVER_BY_SLUG: Record<string, string> = {
  [LIVING_THE_RUNES_SLUG]: "/assets/courses/living-the-runes/cover.png",
  [RUNES_FIRST_STEPS_SLUG]: "/assets/courses/runes-first-steps/cover.jpg",
};

export function getCourseCoverPath(slug: string): string | null {
  return COURSE_COVER_BY_SLUG[slug.trim()] ?? null;
}

export function getLessonIconPath(input: {
  order: number;
  runeId?: string | null;
}): string {
  if (input.order <= 4 || !input.runeId) {
    return FOUNDATION_LESSON_ICON;
  }
  return `/assets/runes/symbols/${input.runeId}.svg`;
}
