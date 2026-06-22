import type { SupportedLocale } from "@/config/app-config";
import { normalizeRuneKey } from "@/features/runes/constants/rune-aliases";
import type { LivingTheRunesBlockSource } from "@/features/courses/content/living-the-runes.types";
import {
  livingTheRunesLessonsSource,
  LIVING_THE_RUNES_LESSON_COUNT,
} from "@/features/courses/content/living-the-runes.generated";
import type {
  CourseContentBlock,
  CourseLesson,
  CourseLessonSummary,
} from "@/features/courses/types/course";

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function mapBlock(
  block: LivingTheRunesBlockSource,
  locale: SupportedLocale,
): CourseContentBlock[] {
  const title = locale === "ru" ? block.titleRu : block.titleEn;
  const body = locale === "ru" ? block.bodyRu : block.bodyEn;

  switch (block.type) {
    case "practice":
      return [{ type: "practice", title, text: body }];
    case "reflection":
      return [{ type: "reflection", prompt: body }];
    case "completion":
      return [
        { type: "heading", text: title },
        { type: "quote", text: body },
      ];
    case "chapterIntro":
    case "text":
    default:
      return [
        { type: "heading", text: title },
        ...splitParagraphs(body).map((text) => ({
          type: "paragraph" as const,
          text,
        })),
      ];
  }
}

function resolveCanonicalRuneId(runeKey: string | null): string | undefined {
  if (!runeKey) return undefined;
  const normalized = normalizeRuneKey(runeKey);
  return normalized || undefined;
}

export function getLivingTheRunesLessonSummaries(
  locale: SupportedLocale,
): CourseLessonSummary[] {
  return livingTheRunesLessonsSource.map((lesson) => ({
    id: lesson.id,
    order: lesson.order,
    title: locale === "ru" ? lesson.titleRu : lesson.titleEn,
    subtitle: locale === "ru" ? lesson.summaryRu : lesson.summaryEn,
    runeId: resolveCanonicalRuneId(lesson.runeKey),
  }));
}

export function getLivingTheRunesLesson(
  lessonId: string,
  locale: SupportedLocale,
): CourseLesson | null {
  const source = livingTheRunesLessonsSource.find((lesson) => lesson.id === lessonId);
  if (!source) return null;

  return {
    id: source.id,
    order: source.order,
    title: locale === "ru" ? source.titleRu : source.titleEn,
    subtitle: locale === "ru" ? source.summaryRu : source.summaryEn,
    runeId: resolveCanonicalRuneId(source.runeKey),
    body: source.blocks.flatMap((block) => mapBlock(block, locale)),
  };
}

export function getLivingTheRunesLessonIds(): string[] {
  return livingTheRunesLessonsSource.map((lesson) => lesson.id);
}

export function isLivingTheRunesLessonId(lessonId: string): boolean {
  return livingTheRunesLessonsSource.some((lesson) => lesson.id === lessonId);
}

export {
  LIVING_THE_RUNES_LESSON_COUNT,
  livingTheRunesLessonsSource,
};
