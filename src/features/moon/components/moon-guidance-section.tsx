import { useTranslations } from "next-intl";

import { MysticPlusLockCard } from "@/features/premium/components/mystic-plus-lock-card";
import { MoonHero } from "@/features/moon/components/moon-hero";
import { MoonLunarDayCard } from "@/features/moon/components/moon-lunar-day-card";
import { MoonPhaseCard } from "@/features/moon/components/moon-phase-card";
import type { MoonGuidanceResult } from "@/features/moon/types/moon";

type MoonGuidanceSectionProps = {
  guidance: MoonGuidanceResult;
};

export function MoonGuidanceSection({ guidance }: MoonGuidanceSectionProps) {
  const t = useTranslations("moon");
  const { premiumActive, showPremiumLock } = guidance;

  return (
    <div className="space-y-8">
      <MoonHero
        guidance={guidance}
        rhythmLabel={t("heading")}
        lunarDayLabel={t("lunarDayLabel", {
          day: guidance.calculation.lunarDay,
        })}
        phaseVisualAlt={t("phaseVisualA11y", { phase: guidance.phase.title })}
      />

      <MoonPhaseCard
        phase={guidance.phase}
        meaningLabel={t("meaningLabel")}
        practiceLabel={t("practiceLabel")}
        reflectionLabel={t("reflectionLabel")}
        premiumActive={premiumActive}
      />

      <MoonLunarDayCard
        lunarDayLabel={t("lunarDayLabel", {
          day: guidance.calculation.lunarDay,
        })}
        sectionLabel={t("lunarDaySectionLabel")}
        missingLabel={t("lunarDayMissing")}
        actionLabel={t("actionLabel")}
        reflectionLabel={t("reflectionLabel")}
        content={guidance.lunarDayContent}
        premiumActive={premiumActive}
      />

      {showPremiumLock ? <MysticPlusLockCard /> : null}

      <p className="text-xs leading-relaxed text-text-subtle">{t("infoNote")}</p>
    </div>
  );
}
