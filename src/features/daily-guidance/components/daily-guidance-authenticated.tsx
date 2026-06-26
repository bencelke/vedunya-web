import { getTranslations } from "next-intl/server";

import type { DailyGuidanceViewModel } from "@/features/daily-guidance/types/daily-guidance-view-model";
import { isGuidanceReady } from "@/features/daily-guidance/types/daily-guidance-view-model";
import { UniverseRequestSection } from "@/features/universe-request/components/universe-request-section";
import { TodayActionCard } from "@/features/today/components/today-action-card";
import { TodayMoonSection } from "@/features/today/components/today-moon-section";
import { TodayMysticPlusPanel } from "@/features/today/components/today-mystic-plus-panel";
import { TodayNumerologySection } from "@/features/today/components/today-numerology-section";
import { TodayRuneSection } from "@/features/today/components/today-rune-section";

type DailyGuidanceAuthenticatedProps = {
  guidance: DailyGuidanceViewModel;
};

export async function DailyGuidanceAuthenticated({
  guidance,
}: DailyGuidanceAuthenticatedProps) {
  const t = await getTranslations("dailyGuidance");
  const tPremium = await getTranslations("premium");
  const tRunes = await getTranslations("runes");

  const runeReady = isGuidanceReady(guidance.rune) ? guidance.rune.data : null;
  const moonReady = isGuidanceReady(guidance.moon) ? guidance.moon.data : null;
  const showPremiumLock =
    !guidance.premiumActive &&
    Boolean(
      runeReady?.showPremiumDeepLock || moonReady?.showPremiumDeepLock,
    );

  return (
    <div className="mystic-today-content space-y-8">
      <UniverseRequestSection model={guidance.universeRequest} />

      <TodayRuneSection rune={guidance.rune} />

      <TodayMoonSection moon={guidance.moon} />

      <TodayNumerologySection numerology={guidance.numerology} />

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
        <section className="mystic-today-section space-y-3">
          <div className="mystic-today-divider mystic-today-divider--section" aria-hidden="true" />
          <p className="mystic-today-overline">{t("reflectionLabel")}</p>
          <p className="text-[0.9375rem] leading-[1.72] text-text-muted">
            {guidance.reflection}
          </p>
        </section>
      ) : null}

      {showPremiumLock ? (
        <TodayMysticPlusPanel sectionNote={tPremium("todayDepthNote")} />
      ) : null}
    </div>
  );
}
