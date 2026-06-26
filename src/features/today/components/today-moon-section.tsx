import { getTranslations } from "next-intl/server";

import { SectionUnavailable } from "@/features/daily-guidance/components/section-unavailable";
import type { DailyGuidanceMoonSection } from "@/features/daily-guidance/types/daily-guidance-view-model";
import { isGuidanceReady } from "@/features/daily-guidance/types/daily-guidance-view-model";
import { MoonPhaseVisual } from "@/features/moon/components/moon-phase-visual";
import { Link } from "@/i18n/navigation";
import type { MoonPhase4Id } from "@/features/moon/types/moon";

type TodayMoonSectionProps = {
  moon: DailyGuidanceMoonSection;
};

export async function TodayMoonSection({ moon }: TodayMoonSectionProps) {
  const t = await getTranslations("dailyGuidance.todaySections");
  const tMoon = await getTranslations("moon");

  if (!isGuidanceReady(moon)) {
    return (
      <SectionUnavailable label={t("moonTitle")} message={moon.message} />
    );
  }

  const { phaseId, phaseTitle, summary, href } = moon.data;

  return (
    <section aria-labelledby="today-moon-title" className="mystic-today-section">
      <div className="mystic-today-divider mystic-today-divider--section" aria-hidden="true" />
      <div className="space-y-1 text-center">
        <p className="mystic-today-overline">{t("moonTitle")}</p>
      </div>

      <div className="flex flex-col items-center gap-5 pt-6">
        <Link href={href} className="group block" aria-label={t("viewMoon")}>
          <MoonPhaseVisual
            phase4Id={phaseId as MoonPhase4Id}
            alt={tMoon("phaseVisualA11y", { phase: phaseTitle })}
            size={168}
            className="transition-transform duration-200 group-hover:scale-[1.02]"
          />
        </Link>

        <div className="max-w-[22rem] space-y-3 text-center">
          <h2
            id="today-moon-title"
            className="text-[clamp(1.25rem,4.5vw,1.5rem)] font-medium leading-[1.2] tracking-[-0.02em] text-text-primary"
          >
            {phaseTitle}
          </h2>
          {summary ? (
            <p className="text-[0.9375rem] leading-[1.72] text-text-muted">{summary}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
