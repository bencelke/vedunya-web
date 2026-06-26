import { Moon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { MoonPhaseVisual } from "@/features/moon/components/moon-phase-visual";
import { MysticRuneSigil } from "@/features/runes/components/mystic-rune-sigil";
import type {
  DailyGuidanceMoonSection,
  DailyGuidanceRuneSection,
} from "@/features/daily-guidance/types/daily-guidance-view-model";
import { isGuidanceReady } from "@/features/daily-guidance/types/daily-guidance-view-model";
import type { MoonPhase4Id } from "@/features/moon/types/moon";
import type { CanonicalRuneId } from "@/features/runes/types/rune";

type TodayRhythmStripProps = {
  rune: DailyGuidanceRuneSection;
  moon: DailyGuidanceMoonSection;
};

export async function TodayRhythmStrip({ rune, moon }: TodayRhythmStripProps) {
  const t = await getTranslations("dailyGuidance.rhythmStrip");

  const runeReady = isGuidanceReady(rune) ? rune.data : null;
  const moonReady = isGuidanceReady(moon) ? moon.data : null;

  return (
    <section
      aria-label={t("sectionLabel")}
      className="today-rhythm-strip flex flex-col gap-3"
    >
      {runeReady ? (
        <Link
          href={runeReady.href}
          className="mystic-rhythm-card group flex min-h-[4.75rem] items-center gap-4 px-4 py-3.5 transition-colors"
        >
          <MysticRuneSigil
            runeId={runeReady.runeId as CanonicalRuneId}
            alt={runeReady.title}
            size={32}
            className="!h-8 !w-8 shrink-0 opacity-90 transition-opacity group-hover:opacity-100"
          />
          <div className="min-w-0 space-y-1">
            <p className="mystic-eyebrow">{t("runeLabel")}</p>
            <p className="truncate text-base font-medium leading-tight text-text-primary">
              {runeReady.title}
            </p>
          </div>
        </Link>
      ) : (
        <div className="mystic-rhythm-card flex min-h-[4.75rem] items-center gap-4 px-4 py-3.5">
          <div className="h-8 w-8 shrink-0" aria-hidden="true" />
          <div className="space-y-1">
            <p className="mystic-eyebrow">{t("runeLabel")}</p>
            <p className="text-sm font-medium text-text-subtle">{t("unavailable")}</p>
          </div>
        </div>
      )}

      {moonReady ? (
        <Link
          href={moonReady.href}
          className="mystic-rhythm-card group flex min-h-[4.75rem] items-center gap-4 px-4 py-3.5 transition-colors"
        >
          <MoonPhaseVisual
            phase4Id={moonReady.phaseId as MoonPhase4Id}
            alt={moonReady.phaseTitle}
            size={32}
            className="!h-8 !w-8 shrink-0"
          />
          <div className="min-w-0 space-y-1">
            <p className="mystic-eyebrow">{t("moonLabel")}</p>
            <p className="truncate text-base font-medium leading-tight text-text-primary">
              {moonReady.phaseTitle}
            </p>
          </div>
        </Link>
      ) : (
        <div className="mystic-rhythm-card flex min-h-[4.75rem] items-center gap-4 px-4 py-3.5">
          <Moon className="h-5 w-5 shrink-0 text-accent-gold/75" aria-hidden="true" />
          <div className="space-y-1">
            <p className="mystic-eyebrow">{t("moonLabel")}</p>
            <p className="text-sm font-medium text-text-subtle">{t("unavailable")}</p>
          </div>
        </div>
      )}
    </section>
  );
}
