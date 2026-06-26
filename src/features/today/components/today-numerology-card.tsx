import { getTranslations } from "next-intl/server";

import { SectionUnavailable } from "@/features/daily-guidance/components/section-unavailable";
import type { DailyGuidanceNumerologySection } from "@/features/daily-guidance/types/daily-guidance-view-model";
import { isGuidanceReady } from "@/features/daily-guidance/types/daily-guidance-view-model";

type TodayNumerologyCardProps = {
  numerology: DailyGuidanceNumerologySection;
};

export async function TodayNumerologyCard({
  numerology,
}: TodayNumerologyCardProps) {
  const t = await getTranslations("dailyGuidance.numerologyCard");

  if (!isGuidanceReady(numerology)) {
    return (
      <SectionUnavailable
        label={t("label")}
        message={numerology.message}
      />
    );
  }

  const { number, title, summary, focus } = numerology.data;

  return (
    <section
      aria-labelledby="today-numerology-title"
      className="mystic-cosmic-card-elevated mystic-numerology-card relative overflow-hidden p-6"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[var(--glow-gold)] opacity-60"
      />
      <div className="relative space-y-5">
        <p className="mystic-eyebrow">{t("label")}</p>

        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-start sm:text-left">
          <div
            className="mystic-numerology-medallion shrink-0"
            aria-label={t("numberA11y", { number })}
          >
            <span className="mystic-numerology-medallion-value">{number}</span>
          </div>

          <div className="min-w-0 space-y-3">
            <h2
              id="today-numerology-title"
              className="text-[clamp(1.25rem,4.5vw,1.5rem)] font-medium leading-[1.2] tracking-[-0.02em] text-text-primary"
            >
              {title}
            </h2>
            {summary ? (
              <p className="text-[0.9375rem] leading-[1.72] text-text-muted">
                {summary}
              </p>
            ) : null}
          </div>
        </div>

        {focus ? (
          <div className="mystic-guidance-action rounded-[var(--radius-md)] border p-4">
            <p className="mystic-eyebrow">{t("focusLabel")}</p>
            <p className="mt-2 text-[0.9375rem] leading-[1.72] text-text-primary">
              {focus}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
