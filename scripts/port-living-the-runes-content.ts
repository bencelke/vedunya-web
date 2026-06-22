/**
 * One-time port: Mystic Flutter `living_the_runes_course_content.dart` → web TS module.
 * Run: npx tsx scripts/port-living-the-runes-content.ts
 */
import fs from "node:fs";
import path from "node:path";

const DART_PATH = path.resolve(
  "C:/Users/1/development/mystic_app/lib/data/course/living_the_runes_course_content.dart",
);
const OUT_PATH = path.resolve(
  "src/features/courses/content/living-the-runes.generated.ts",
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
  runeKey: string | null;
  blocks: ParsedBlock[];
};

function unescapeDartString(raw: string): string {
  return raw
    .replace(/\\'/g, "'")
    .replace(/\\n/g, "\n")
    .replace(/\\\\/g, "\\");
}

function collectDartStringLiterals(source: string, startIndex: number): {
  value: string;
  endIndex: number;
} {
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

function readFieldString(source: string, field: string, from: number): {
  value: string;
  endIndex: number;
} | null {
  const marker = new RegExp(`${field}:\\s*`);
  const slice = source.slice(from);
  const match = slice.match(marker);
  if (!match || match.index === undefined) return null;
  const start = from + match.index + match[0].length;
  return collectDartStringLiterals(source, start);
}

function readFieldNumber(source: string, field: string): number | null {
  const match = source.match(new RegExp(`${field}:\\s*(\\d+)`));
  return match ? Number(match[1]) : null;
}

function readFieldOptionalString(source: string, field: string): string | null {
  const match = source.match(new RegExp(`${field}:\\s*'([^']+)'`));
  return match?.[1] ?? null;
}

function parseBlock(blockSource: string): ParsedBlock | null {
  const typeMatch = blockSource.match(
    /type:\s*PremiumBlockType\.(\w+)/,
  );
  if (!typeMatch) return null;

  const type = typeMatch[1] as BlockType;
  const titleRu = readFieldString(blockSource, "titleRu", 0)?.value ?? "";
  const titleEn = readFieldString(blockSource, "titleEn", 0)?.value ?? "";
  const bodyRu = readFieldString(blockSource, "bodyRu", 0)?.value ?? "";
  const bodyEn = readFieldString(blockSource, "bodyEn", 0)?.value ?? "";

  return {
    type,
    titleEn: unescapeDartString(titleEn),
    titleRu: unescapeDartString(titleRu),
    bodyEn: unescapeDartString(bodyEn),
    bodyRu: unescapeDartString(bodyRu),
  };
}

function parseLesson(fnSource: string): ParsedLesson | null {
  const idMatch = fnSource.match(/id:\s*'([^']+)'/);
  if (!idMatch) return null;

  const sortOrder = readFieldNumber(fnSource, "sortOrder") ?? 0;
  const titleRu = readFieldString(fnSource, "titleRu", 0)?.value ?? "";
  const titleEn = readFieldString(fnSource, "titleEn", 0)?.value ?? "";
  const summaryRu = readFieldString(fnSource, "summaryRu", 0)?.value ?? "";
  const summaryEn = readFieldString(fnSource, "summaryEn", 0)?.value ?? "";
  const runeKey = readFieldOptionalString(fnSource, "runeKey");

  const blocks: ParsedBlock[] = [];
  const blockRegex = /PremiumLessonBlock\(\s*([\s\S]*?)\n\s*\),/g;
  let blockMatch: RegExpExecArray | null;
  while ((blockMatch = blockRegex.exec(fnSource)) !== null) {
    const parsed = parseBlock(blockMatch[0]!);
    if (parsed) blocks.push(parsed);
  }

  return {
    id: idMatch[1]!,
    sortOrder,
    titleEn: unescapeDartString(titleEn),
    titleRu: unescapeDartString(titleRu),
    summaryEn: unescapeDartString(summaryEn),
    summaryRu: unescapeDartString(summaryRu),
    runeKey,
    blocks,
  };
}

function tsString(value: string): string {
  return JSON.stringify(value);
}

function emitGenerated(lessons: ParsedLesson[]): string {
  const lines: string[] = [];
  lines.push(`/** Auto-generated from Mystic Flutter — do not edit by hand. */`);
  lines.push(`import type { LivingTheRunesLessonSource } from "./living-the-runes.types";`);
  lines.push("");
  lines.push(`export const LIVING_THE_RUNES_LESSON_COUNT = ${lessons.length};`);
  lines.push("");
  lines.push(`export const livingTheRunesLessonsSource: LivingTheRunesLessonSource[] = [`);

  for (const lesson of lessons) {
    lines.push("  {");
    lines.push(`    id: ${tsString(lesson.id)},`);
    lines.push(`    order: ${lesson.sortOrder},`);
    lines.push(`    titleEn: ${tsString(lesson.titleEn)},`);
    lines.push(`    titleRu: ${tsString(lesson.titleRu)},`);
    lines.push(`    summaryEn: ${tsString(lesson.summaryEn)},`);
    lines.push(`    summaryRu: ${tsString(lesson.summaryRu)},`);
    lines.push(`    runeKey: ${lesson.runeKey ? tsString(lesson.runeKey) : "null"},`);
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
  const fnParts = dart.split(/PremiumLessonContent _buildLesson/g).slice(1);
  const lessons = fnParts
    .map((part) => parseLesson(part))
    .filter((lesson): lesson is ParsedLesson => lesson !== null)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (lessons.length !== 28) {
    throw new Error(`Expected 28 lessons, parsed ${lessons.length}`);
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, emitGenerated(lessons), "utf8");
  console.log(
    JSON.stringify({
      ok: true,
      lessonCount: lessons.length,
      firstLessonId: lessons[0]?.id,
      lastLessonId: lessons[lessons.length - 1]?.id,
      output: OUT_PATH,
    }),
  );
}

main();
