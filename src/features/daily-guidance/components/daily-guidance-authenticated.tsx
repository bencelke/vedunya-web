import { getTranslations } from "next-intl/server";

import { DailyRuneSummary } from "@/features/daily-guidance/components/daily-rune-summary";
import { MoonRhythmSummary } from "@/features/daily-guidance/components/moon-rhythm-summary";
import { PersonalDayIndicator } from "@/features/daily-guidance/components/personal-day-indicator";
import { PrimaryGuidanceCard } from "@/features/daily-guidance/components/primary-guidance-card";
import type { DailyGuidanceViewModel } from "@/features/daily-guidance/types/daily-guidance-view-model";

type DailyGuidanceAuthenticatedProps = {
  guidance: DailyGuidanceViewModel;
};

export async function DailyGuidanceAuthenticated({
  guidance,
}: DailyGuidanceAuthenticatedProps) {
  const t = await getTranslations("dailyGuidance");
  const tMoon = await getTranslations("moon");
  const tRunes = await getTranslations("runes");

  const moonPhaseTitle =
    guidance.moon.status === "ready" ? guidance.moon.data.phaseTitle : "";

  return (
    <div className="space-y-5">
      <PrimaryGuidanceCard
        primary={guidance.primary}
        actionLabel={t("actionLabel")}
      />
      <PersonalDayIndicator
        numerology={guidance.numerology}
        label={t("personalDayLabel")}
      />
      <MoonRhythmSummary
        moon={guidance.moon}
        label={t("moonRhythmLabel")}
        lunarDayLabel={
          guidance.moon.status === "ready"
            ? tMoon("lunarDayLabel", { day: guidance.moon.data.lunarDay })
            : ""
        }
        viewDetailsLabel={t("viewMoonDetails")}
        phaseVisualAlt={tMoon("phaseVisualA11y", { phase: moonPhaseTitle })}
      />
      <DailyRuneSummary
        rune={guidance.rune}
        label={t("runeFocusLabel")}
        actionLabel={tRunes("actionLabel")}
        viewDetailsLabel={t("viewRuneDetails")}
        symbolAlt={
          guidance.rune.status === "ready"
            ? tRunes("symbolA11y", { rune: guidance.rune.data.title })
            : ""
        }
      />
      {guidance.reflection ? (
        <p className="px-1 text-sm leading-relaxed text-text-subtle">
          {guidance.reflection}
        </p>
      ) : null}
    </div>
  );
}
