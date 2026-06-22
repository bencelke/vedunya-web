import { calculateMoonContext } from "../src/features/moon/engine/calculate-moon-context";
import { fallbackMoonPhaseById } from "../src/features/moon/content/moon-phase-fallback.en";
import { localizeMoonPhaseContent } from "../src/features/moon/services/moon-content-service";

type CliArgs = {
  date: string;
  timezone: string;
  locale: "en" | "ru";
};

function parseArgs(argv: string[]): CliArgs {
  const args: Partial<CliArgs> = {
    timezone: "UTC",
    locale: "en",
  };

  for (const arg of argv) {
    if (arg.startsWith("--date=")) {
      args.date = arg.slice("--date=".length);
    } else if (arg.startsWith("--timezone=")) {
      args.timezone = arg.slice("--timezone=".length);
    } else if (arg.startsWith("--locale=")) {
      const locale = arg.slice("--locale=".length);
      if (locale === "en" || locale === "ru") {
        args.locale = locale;
      }
    }
  }

  if (!args.date) {
    throw new Error(
      "Usage: npx tsx scripts/moon-check.ts --date=ISO_DATETIME --timezone=IANA [--locale=en|ru]",
    );
  }

  return args as CliArgs;
}

async function main(): Promise<number> {
  const args = parseArgs(process.argv.slice(2));
  const calculation = calculateMoonContext({
    calculationInstant: new Date(args.date),
    timezone: args.timezone,
  });
  const phaseRecord = fallbackMoonPhaseById(calculation.phaseId);
  const phase = localizeMoonPhaseContent(phaseRecord, args.locale, true);

  console.log(
    JSON.stringify(
      {
        inputDate: args.date,
        timezone: args.timezone,
        locale: args.locale,
        julianDate: Number(calculation.julianDate.toFixed(6)),
        moonAgeDays: Number(calculation.moonAgeDays.toFixed(6)),
        lunarDay: calculation.lunarDay,
        phase8Id: calculation.phase8Id,
        phase4Id: calculation.phaseId,
        contentSource: { phase: "fallback", lunarDay: "missing" },
        phaseTitle: phase.title,
      },
      null,
      2,
    ),
  );

  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Unexpected failure.");
    process.exit(1);
  });
