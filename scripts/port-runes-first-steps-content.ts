/**
 * Port Mystic Flutter `runes_first_steps_course_content.dart` → web TS module.
 * Run: npx tsx scripts/port-runes-first-steps-content.ts
 */
import fs from "node:fs";
import path from "node:path";

const DART_PATH = path.resolve(
  process.env.MYSTIC_APP_ROOT ?? "/Users/boris/Documents/mystic_app",
  "lib/data/course/runes_first_steps_course_content.dart",
);
const OUT_PATH = path.resolve(
  "src/features/courses/content/runes-first-steps.generated.ts",
);

type BlockType =
  | "chapterIntro"
  | "text"
  | "practice"
  | "reflection"
  | "completion";

type ParsedBlock = {
  type: BlockType;
  titleEn: string;
  titleRu: string;
  bodyEn: string;
  bodyRu: string;
};

type ParsedLesson = {
  id: string;
  sortOrder: number;
  titleEn: string;
  titleRu: string;
  summaryEn: string;
  summaryRu: string;
  blocks: ParsedBlock[];
};

type ParsedCourseMeta = {
  id: string;
  titleEn: string;
  titleRu: string;
  descriptionEn: string;
  descriptionRu: string;
  summaryEn: string;
  summaryRu: string;
};

function unescapeDartString(raw: string): string {
  return raw
    .replace(/\\'/g, "'")
    .replace(/\\n/g, "\n")
    .replace(/\\\\/g, "\\");
}

function collectDartStringLiterals(
  source: string,
  startIndex: number,
): { value: string; endIndex: number } {
  let i = startIndex;
  const parts: string[] = [];

  while (i < source.length) {
    while (i < source.length && /\s/.test(source[i]!)) i++;
    if (source[i] === "+") {
      i++;
      continue;
    }
    if (source[i] !== "'") break;

    i++;
    let chunk = "";
    while (i < source.length) {
      const ch = source[i]!;
      if (ch === "\\") {
        const next = source[i + 1];
        if (next === "'") {
          chunk += "'";
          i += 2;
          continue;
        }
        if (next === "n") {
          chunk += "\n";
          i += 2;
          continue;
        }
        if (next === "\\") {
          chunk += "\\";
          i += 2;
          continue;
        }
        chunk += ch;
        i++;
        continue;
      }
      if (ch === "'") {
        i++;
        parts.push(chunk);
        break;
      }
      chunk += ch;
      i++;
    }

    while (i < source.length && /\s/.test(source[i]!)) i++;
    if (source[i] === "+") {
      i++;
      continue;
    }
    if (source[i] === "'") {
      continue;
    }
    break;
  }

  return { value: parts.join(""), endIndex: i };
}

function readFieldString(
  source: string,
  field: string,
  from = 0,
): string {
  const marker = new RegExp(`${field}:\\s*`);
  const slice = source.slice(from);
  const match = slice.match(marker);
  if (!match || match.index === undefined) return "";
  const start = from + match.index + match[0].length;
  return unescapeDartString(collectDartStringLiterals(source, start).value);
}

function parseBlock(blockSource: string): ParsedBlock | null {
  const typeMatch = blockSource.match(/type:\s*PremiumBlockType\.(\w+)/);
  if (!typeMatch) return null;

  const type = typeMatch[1] as BlockType;
  return {
    type,
    titleRu: readFieldString(blockSource, "titleRu"),
    titleEn: readFieldString(blockSource, "titleEn"),
    bodyRu: readFieldString(blockSource, "bodyRu"),
    bodyEn: readFieldString(blockSource, "bodyEn"),
  };
}

function parseLesson(lessonSource: string): ParsedLesson | null {
  const idMatch = lessonSource.match(/id:\s*'([^']+)'/);
  if (!idMatch) return null;

  const sortOrderMatch = lessonSource.match(/sortOrder:\s*(\d+)/);
  const blocks: ParsedBlock[] = [];
  const blockRegex = /PremiumLessonBlock\(\s*([\s\S]*?)\n\s*\),/g;
  let blockMatch: RegExpExecArray | null;
  while ((blockMatch = blockRegex.exec(lessonSource)) !== null) {
    const parsed = parseBlock(blockMatch[0]!);
    if (parsed) blocks.push(parsed);
  }

  return {
    id: idMatch[1]!,
    sortOrder: sortOrderMatch ? Number(sortOrderMatch[1]) : 1,
    titleRu: readFieldString(lessonSource, "titleRu"),
    titleEn: readFieldString(lessonSource, "titleEn"),
    summaryRu: readFieldString(lessonSource, "summaryRu"),
    summaryEn: readFieldString(lessonSource, "summaryEn"),
    blocks,
  };
}

function tsString(value: string): string {
  return JSON.stringify(value);
}

function emitGenerated(meta: ParsedCourseMeta, lessons: ParsedLesson[]): string {
  const lines: string[] = [];
  lines.push("/** Auto-generated from Mystic Flutter — do not edit by hand. */");
  lines.push(
    'import type { MysticCourseLessonSource } from "./mystic-course-content.types";',
  );
  lines.push("");
  lines.push("export const RUNES_FIRST_STEPS_LESSON_COUNT = " + lessons.length + ";");
  lines.push("");
  lines.push("export const runesFirstStepsCourseMeta = {");
  lines.push(`  id: ${tsString(meta.id)},`);
  lines.push(`  titleEn: ${tsString(meta.titleEn)},`);
  lines.push(`  titleRu: ${tsString(meta.titleRu)},`);
  lines.push(`  descriptionEn: ${tsString(meta.descriptionEn)},`);
  lines.push(`  descriptionRu: ${tsString(meta.descriptionRu)},`);
  lines.push(`  summaryEn: ${tsString(meta.summaryEn)},`);
  lines.push(`  summaryRu: ${tsString(meta.summaryRu)},`);
  lines.push("} as const;");
  lines.push("");
  lines.push(
    "export const runesFirstStepsLessonsSource: MysticCourseLessonSource[] = [",
  );

  for (const lesson of lessons) {
    lines.push("  {");
    lines.push(`    id: ${tsString(lesson.id)},`);
    lines.push(`    order: ${lesson.sortOrder},`);
    lines.push(`    titleEn: ${tsString(lesson.titleEn)},`);
    lines.push(`    titleRu: ${tsString(lesson.titleRu)},`);
    lines.push(`    summaryEn: ${tsString(lesson.summaryEn)},`);
    lines.push(`    summaryRu: ${tsString(lesson.summaryRu)},`);
    lines.push("    runeKey: null,");
    lines.push("    blocks: [");
    for (const block of lesson.blocks) {
      lines.push("      {");
      lines.push(`        type: ${tsString(block.type)},`);
      lines.push(`        titleEn: ${tsString(block.titleEn)},`);
      lines.push(`        titleRu: ${tsString(block.titleRu)},`);
      lines.push(`        bodyEn: ${tsString(block.bodyEn)},`);
      lines.push(`        bodyRu: ${tsString(block.bodyRu)},`);
      lines.push("      },");
    }
    lines.push("    ],");
    lines.push("  },");
  }

  lines.push("];");
  lines.push("");
  return lines.join("\n");
}

function main() {
  const dart = fs.readFileSync(DART_PATH, "utf8");
  const meta: ParsedCourseMeta = {
    id: readFieldString(dart, "id"),
    titleRu: readFieldString(dart, "titleRu"),
    titleEn: readFieldString(dart, "titleEn"),
    descriptionRu: readFieldString(dart, "descriptionRu"),
    descriptionEn: readFieldString(dart, "descriptionEn"),
    summaryRu: readFieldString(dart, "summaryRu"),
    summaryEn: readFieldString(dart, "summaryEn"),
  };

  const lessonMatch = dart.match(
    /PremiumLessonContent\(\s*([\s\S]*?)\n\s*\),\s*\n\s*\],/,
  );
  if (!lessonMatch) {
    throw new Error("Could not find PremiumLessonContent in dart source");
  }

  const lesson = parseLesson(lessonMatch[0]!);
  if (!lesson) {
    throw new Error("Failed to parse lesson");
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, emitGenerated(meta, [lesson]), "utf8");
  console.log(
    JSON.stringify({
      ok: true,
      courseId: meta.id,
      lessonCount: 1,
      lessonId: lesson.id,
      blockCount: lesson.blocks.length,
      output: OUT_PATH,
    }),
  );
}

main();
