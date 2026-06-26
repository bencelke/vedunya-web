import { getTranslations } from "next-intl/server";

import { SectionUnavailable } from "@/features/daily-guidance/components/section-unavailable";
import type { DailyGuidanceNumerologySection } from "@/features/daily-guidance/types/daily-guidance-view-model";
import { isGuidanceReady } from "@/features/daily-guidance/types/daily-guidance-view-model";

type TodayNumerologySectionProps = {
  numerology: DailyGuidanceNumerologySection;
};

export async function TodayNumerologySection({
  numerology,
}: TodayNumerologySectionProps) {
  const t = await getTranslations("dailyGuidance.todaySections");

  if (!isGuidanceReady(numerology)) {
    return (
      <SectionUnavailable label={t("numerologyTitle")} message={numerology.message} />
    );
  }

  const { number, title, summary, focus } = numerology.data;
  const headline = `${number} — ${title}`;

  return (
    <section
      aria-labelledby="today-numerology-title"
      className="mystic-today-section mystic-today-numerology"
    >
      <div className="mystic-today-divider mystic-today-divider--section" aria-hidden="true" />
      <p className="mystic-today-overline">{t("numerologyTitle")}</p>

      <div className="mt-4 space-y-3">
        <h2
          id="today-numerology-title"
          className="text-[clamp(1.125rem,4vw,1.375rem)] font-medium leading-[1.25] tracking-[-0.01em] text-text-primary"
        >
          {headline}
        </h2>
        {summary ? (
          <p className="text-[0.9375rem] leading-[1.72] text-text-muted">{summary}</p>
        ) : null}
        {focus ? (
          <p className="text-[0.875rem] leading-[1.65] text-text-subtle">{focus}</p>
        ) : null}
      </div>
    </section>
  );
}
