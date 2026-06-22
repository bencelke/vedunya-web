import { calculatePersonalDay } from "../src/features/numerology/engine/calculate-personal-day";
import { buildDailyRuneResult } from "../src/features/runes/services/daily-rune-service";
import { selectDailyRune } from "../src/features/runes/engine/select-daily-rune";
import { parseDateKey } from "../src/features/runes/engine/date-key";

type CliArgs = {
  dob: string;
  date: string;
  locale: "en" | "ru";
};

function parseArgs(argv: string[]): CliArgs {
  const args: Partial<CliArgs> = { locale: "en" };
  for (const arg of argv) {
    if (arg.startsWith("--dob=")) args.dob = arg.slice(6);
    if (arg.startsWith("--date=")) args.date = arg.slice(7);
    if (arg.startsWith("--locale=")) {
      const locale = arg.slice(9);
      if (locale === "en" || locale === "ru") args.locale = locale;
    }
  }
  if (!args.dob || !args.date) {
    throw new Error(
      "Usage: npx tsx scripts/rune-check.ts --dob=YYYY-MM-DD --date=YYYY-MM-DD [--locale=en|ru]",
    );
  }
  return args as CliArgs;
}

const args = parseArgs(process.argv.slice(2));
const personalDay = calculatePersonalDay({
  birthDate: args.dob,
  calculationDate: args.date,
  locale: args.locale,
});
const forDate = parseDateKey(args.date);
const selection = selectDailyRune({
  personalDayNumber: personalDay.personalDayNumber,
  forDate,
  locale: args.locale,
});
const result = buildDailyRuneResult({
  personalDayNumber: personalDay.personalDayNumber,
  forDate,
  locale: args.locale,
});

console.log(
  JSON.stringify(
    {
      dob: args.dob,
      dateKey: args.date,
      locale: args.locale,
      personalDayNumber: personalDay.personalDayNumber,
      seed: selection.seed,
      runeIndex: selection.runeIndex,
      runeId: selection.runeId,
      title: result.content.title,
      assetPath: result.assetPath,
    },
    null,
    2,
  ),
);
