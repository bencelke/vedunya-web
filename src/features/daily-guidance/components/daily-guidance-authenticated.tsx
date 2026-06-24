import { getTranslations } from "next-intl/server";

import { MoonRhythmSummary } from "@/features/daily-guidance/components/moon-rhythm-summary";
import { PersonalDayIndicator } from "@/features/daily-guidance/components/personal-day-indicator";
import { PrimaryGuidanceCard } from "@/features/daily-guidance/components/primary-guidance-card";
import type { DailyGuidanceViewModel } from "@/features/daily-guidance/types/daily-guidance-view-model";
import { isGuidanceReady } from "@/features/daily-guidance/types/daily-guidance-view-model";
import { UniverseRequestSection } from "@/features/universe-request/components/universe-request-section";
import { MysticPlusLockCard } from "@/features/premium/components/mystic-plus-lock-card";
import { TodayActionCard } from "@/features/today/components/today-action-card";
import { TodayRuneAnchor } from "@/features/today/components/today-rune-anchor";

type DailyGuidanceAuthenticatedProps = {
  guidance: DailyGuidanceViewModel;
};

export async function DailyGuidanceAuthenticated({
  guidance,
}: DailyGuidanceAuthenticatedProps) {
  const t = await getTranslations("dailyGuidance");
  const tPremium = await getTranslations("premium");
  const tMoon = await getTranslations("moon");
  const tRunes = await getTranslations("runes");

  const moonPhaseTitle =
    guidance.moon.status === "ready" ? guidance.moon.data.phaseTitle : "";

  const runeReady = isGuidanceReady(guidance.rune) ? guidance.rune.data : null;
  const moonReady = isGuidanceReady(guidance.moon) ? guidance.moon.data : null;
  const showPremiumLock =
    !guidance.premiumActive &&
    Boolean(
      runeReady?.showPremiumDeepLock || moonReady?.showPremiumDeepLock,
    );

  return (
    <div className="space-y-8">
      <UniverseRequestSection model={guidance.universeRequest} />

      <PrimaryGuidanceCard
        primary={guidance.primary}
        actionLabel={t("actionLabel")}
      />

      <TodayRuneAnchor
        rune={guidance.rune}
        label={t("runeOfDayLabel")}
        viewDetailsLabel={t("viewRuneDetails")}
        symbolAlt={
          runeReady
            ? tRunes("symbolA11y", { rune: runeReady.title })
            : ""
        }
      />

      <div className="space-y-5">
        <MoonRhythmSummary
          moon={guidance.moon}
          label={t("moonRhythmLabel")}
          lunarDayLabel={
            moonReady
              ? tMoon("lunarDayLabel", { day: moonReady.lunarDay })
              : ""
          }
          viewDetailsLabel={t("viewMoonDetails")}
          phaseVisualAlt={tMoon("phaseVisualA11y", { phase: moonPhaseTitle })}
          deepLabel={t("deepMeaningLabel")}
          actionLabel={t("actionLabel")}
        />
        <PersonalDayIndicator
          numerology={guidance.numerology}
          label={t("dailyRhythmLabel")}
        />
      </div>

      {guidance.premiumActive && runeReady?.deep ? (
        <TodayActionCard
          label={t("runeDeepLabel")}
          body={runeReady.deep}
        />
      ) : null}

      {guidance.premiumActive && runeReady?.action ? (
        <TodayActionCard
          label={tRunes("actionLabel")}
          body={runeReady.action}
        />
      ) : null}

      {guidance.reflection ? (
        <section className="mystic-cosmic-card p-5">
          <p className="mystic-eyebrow">{t("reflectionLabel")}</p>
          <p className="mt-3 text-sm leading-[1.72] text-text-muted">
            {guidance.reflection}
          </p>
        </section>
      ) : null}

      {showPremiumLock ? (
        <div className="space-y-3">
          <p className="text-center text-xs leading-relaxed text-text-subtle">
            {tPremium("todayDepthNote")}
          </p>
          <MysticPlusLockCard />
        </div>
      ) : null}
    </div>
  );
}
