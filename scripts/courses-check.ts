import fs from "node:fs";
import path from "node:path";

import {
  LIVING_THE_RUNES_COURSE_ID,
  LIVING_THE_RUNES_PRODUCT_ID,
  LIVING_THE_RUNES_SLUG,
} from "../src/features/courses/constants/course-ids";
import {
  getLivingTheRunesLessonIds,
  LIVING_THE_RUNES_LESSON_COUNT,
} from "../src/features/courses/content/living-the-runes-runtime";
import { normalizeRuneKey } from "../src/features/runes/constants/rune-aliases";

function main() {
  const ids = getLivingTheRunesLessonIds();
  const unique = new Set(ids);
  const runeAssetsDir = path.resolve("public/assets/runes/symbols");
  const coverPath = path.resolve(
    "public/assets/courses/living-the-runes/cover.png",
  );

  const missingAssets: string[] = [];
  for (const lessonId of ids) {
    if (!lessonId.startsWith("living-")) continue;
    const runeMatch = lessonId.match(/^living-\d+-(.+)$/);
    if (!runeMatch || Number(lessonId.split("-")[1]) <= 4) continue;
    const runeId = normalizeRuneKey(runeMatch[1]!);
    const asset = path.join(runeAssetsDir, `${runeId}.svg`);
    if (!fs.existsSync(asset)) {
      missingAssets.push(runeId);
    }
  }

  const result = {
    ok:
      ids.length === 28 &&
      unique.size === 28 &&
      LIVING_THE_RUNES_LESSON_COUNT === 28 &&
      fs.existsSync(coverPath) &&
      missingAssets.length === 0,
    localLessonCount: ids.length,
    courseSlug: LIVING_THE_RUNES_SLUG,
    courseId: LIVING_THE_RUNES_COURSE_ID,
    productId: LIVING_THE_RUNES_PRODUCT_ID,
    firstLessonId: ids[0],
    lastLessonId: ids[ids.length - 1],
    uniqueLessonIds: unique.size,
    coverPresent: fs.existsSync(coverPath),
    missingRuneAssets: missingAssets,
  };

  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exit(1);
}

main();
