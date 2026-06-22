import { buildPersonalDayResult } from "../src/features/numerology/services/personal-day-service";
import type { SupportedNumerologyLocale } from "../src/features/numerology/types/numerology";

type CliArgs = {
  dob: string;
  date: string;
  locale: SupportedNumerologyLocale;
};

function parseArgs(argv: string[]): CliArgs {
  const args: Partial<CliArgs> = {
    locale: "en",
  };

  for (const arg of argv) {
    if (arg.startsWith("--dob=")) {
      args.dob = arg.slice("--dob=".length);
    } else if (arg.startsWith("--date=")) {
      args.date = arg.slice("--date=".length);
    } else if (arg.startsWith("--locale=")) {
      const locale = arg.slice("--locale=".length);
      if (locale === "en" || locale === "ru") {
        args.locale = locale;
      }
    }
  }

  if (!args.dob || !args.date) {
    throw new Error(
      "Usage: npm run numerology:check -- --dob=YYYY-MM-DD --date=YYYY-MM-DD [--locale=en|ru]",
    );
  }

  return args as CliArgs;
}

function main(): number {
  const args = parseArgs(process.argv.slice(2));
  const result = buildPersonalDayResult({
    birthDate: args.dob,
    calculationDate: args.date,
    locale: args.locale,
  });

  if (!result) {
    console.error("Unable to calculate personal day for the supplied inputs.");
    return 1;
  }

  console.log(
    JSON.stringify(
      {
        birthDate: args.dob,
        calculationDate: args.date,
        locale: args.locale,
        rawValue: result.calculation.rawValue,
        personalDayNumber: result.calculation.personalDayNumber,
        contentKey: result.contentKey,
        title: result.content.title,
      },
      null,
      2,
    ),
  );

  return 0;
}

try {
  process.exit(main());
} catch (error) {
  console.error(error instanceof Error ? error.message : "Unexpected failure.");
  process.exit(1);
}
