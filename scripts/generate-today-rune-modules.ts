import fs from "node:fs";
import path from "node:path";

const FLUTTER_RUNES_DIR = path.resolve(
  "C:/Users/1/development/mystic_app/lib/core/runes",
);
const OUTPUT = path.resolve(
  "src/features/runes/content/today-rune-modules.generated.ts",
);

const RUNE_FILES = [
  "fehu",
  "uruz",
  "thurisaz",
  "ansuz",
  "raido",
  "kenaz",
  "gebo",
  "wunjo",
  "hagalaz",
  "nauthiz",
  "isa",
  "jera",
  "eihwaz",
  "perthro",
  "algiz",
  "sowilo",
  "tiwaz",
  "berkano",
  "ehwaz",
  "mannaz",
  "laguz",
  "ingwaz",
  "dagaz",
  "othala",
];

type LocaleBlock = { ru: string[]; en: string[] };

function extractStringArrays(content: string, key: "messages" | "actions"): LocaleBlock {
  const blockMatch = content.match(new RegExp(`${key}:\\s*\\{([\\s\\S]*?)\\n\\s*\\},`, "m"));
  if (!blockMatch) {
    throw new Error(`Missing ${key}`);
  }

  const parseLocale = (locale: "ru" | "en"): string[] => {
    const localeMatch = blockMatch[1].match(
      new RegExp(`'${locale}':\\s*\\[([\\s\\S]*?)\\],`, "m"),
    );
    if (!localeMatch) {
      return [];
    }
    return [...localeMatch[1].matchAll(/'((?:\\'|[^'])*)'/g)].map((m) =>
      m[1].replace(/\\'/g, "'"),
    );
  };

  return { ru: parseLocale("ru"), en: parseLocale("en") };
}

const modules: Record<
  string,
  { messages: LocaleBlock; actions: LocaleBlock }
> = {};

for (const runeId of RUNE_FILES) {
  const filePath = path.join(FLUTTER_RUNES_DIR, `${runeId}.dart`);
  const content = fs.readFileSync(filePath, "utf8");
  modules[runeId] = {
    messages: extractStringArrays(content, "messages"),
    actions: extractStringArrays(content, "actions"),
  };
}

const file = `/** Generated from Flutter lib/core/runes/*.dart — do not edit by hand. */
import type { TodayRuneModule } from "@/features/runes/types/rune";

export const TODAY_RUNE_MODULES: Record<string, TodayRuneModule> = ${JSON.stringify(modules, null, 2)} as Record<string, TodayRuneModule>;
`;

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, file, "utf8");
console.log(`Wrote ${OUTPUT}`);
