import { getTranslations } from "next-intl/server";

import { SectionUnavailable } from "@/features/daily-guidance/components/section-unavailable";
import type { DailyGuidanceRuneSection } from "@/features/daily-guidance/types/daily-guidance-view-model";
import { isGuidanceReady } from "@/features/daily-guidance/types/daily-guidance-view-model";
import { Link } from "@/i18n/navigation";
import { MysticRuneSigil } from "@/features/runes/components/mystic-rune-sigil";
import type { CanonicalRuneId } from "@/features/runes/types/rune";

type TodayRuneSectionProps = {
  rune: DailyGuidanceRuneSection;
};

export async function TodayRuneSection({ rune }: TodayRuneSectionProps) {
  const t = await getTranslations("dailyGuidance.todaySections");

  if (!isGuidanceReady(rune)) {
    return (
      <SectionUnavailable label={t("runeTitle")} message={rune.message} />
    );
  }

  const { runeId, title, summary, href } = rune.data;

  return (
    <section aria-labelledby="today-rune-title" className="mystic-today-section">
      <div className="mystic-today-divider mystic-today-divider--section" aria-hidden="true" />
      <div className="space-y-1 text-center">
        <p className="mystic-today-overline">{t("runeTitle")}</p>
        <p className="mystic-today-caption">{t("runeSubtitle")}</p>
      </div>

      <div className="flex flex-col items-center gap-5 pt-6">
        <Link href={href} className="group block" aria-label={t("viewRune")}>
          <MysticRuneSigil
            runeId={runeId as CanonicalRuneId}
            alt={title}
            size={200}
            className="transition-transform duration-200 group-hover:scale-[1.02]"
          />
        </Link>

        <div className="max-w-[20rem] space-y-3 text-center">
          <h2
            id="today-rune-title"
            className="text-[clamp(1.25rem,4.5vw,1.5rem)] font-medium leading-[1.2] tracking-[-0.02em] text-text-primary"
          >
            {title}
          </h2>
          {summary ? (
            <p className="text-[0.9375rem] leading-[1.72] text-text-muted">{summary}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
