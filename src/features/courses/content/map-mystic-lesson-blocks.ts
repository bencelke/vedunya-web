import type { SupportedLocale } from "@/config/app-config";
import type { MysticCourseBlockSource } from "@/features/courses/content/mystic-course-content.types";
import type { CourseContentBlock } from "@/features/courses/types/course";

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function mapBlock(
  block: MysticCourseBlockSource,
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

export function mapMysticLessonBlocks(
  blocks: MysticCourseBlockSource[],
  locale: SupportedLocale,
): CourseContentBlock[] {
  return blocks.flatMap((block) => mapBlock(block, locale));
}
