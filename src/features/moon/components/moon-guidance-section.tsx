import { useTranslations } from "next-intl";

import { LunarDayCard } from "@/features/moon/components/lunar-day-card";
import { MoonPhaseVisual } from "@/features/moon/components/moon-phase-visual";
import type { MoonGuidanceResult } from "@/features/moon/types/moon";

type MoonGuidanceSectionProps = {
  guidance: MoonGuidanceResult;
};

export function MoonGuidanceSection({ guidance }: MoonGuidanceSectionProps) {
  const t = useTranslations("moon");

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <MoonPhaseVisual
          phase4Id={guidance.calculation.phaseId}
          phase8Id={guidance.calculation.phase8Id}
          alt={t("phaseVisualA11y", { phase: guidance.phase.title })}
          size={160}
        />
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent-gold">
            {t("currentPhaseLabel")}
          </p>
          <h2 className="mt-2 text-2xl font-medium text-text-primary">
            {guidance.phase.title}
          </h2>
          <p className="mt-1 text-sm text-text-subtle">
            {t("lunarDayLabel", { day: guidance.calculation.lunarDay })}
          </p>
        </div>
      </div>

      <section className="rounded-[var(--radius-card)] border border-border-subtle bg-surface-elevated p-5">
        <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-accent-gold">
          {t("rhythmLabel")}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-text-muted">
          {guidance.phase.short}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-text-primary">
          {guidance.phase.guidance}
        </p>
      </section>

      {guidance.phase.action ? (
        <section className="rounded-[var(--radius-card)] border border-border-subtle bg-surface-primary p-5">
          <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-accent-gold">
            {t("actionLabel")}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-text-primary">
            {guidance.phase.action}
          </p>
        </section>
      ) : null}

      {guidance.phase.reflection ? (
        <section className="rounded-[var(--radius-card)] border border-border-subtle bg-surface-primary p-5">
          <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-text-subtle">
            {t("reflectionLabel")}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-text-muted">
            {guidance.phase.reflection}
          </p>
        </section>
      ) : null}

      <LunarDayCard
        lunarDay={guidance.calculation.lunarDay}
        content={guidance.lunarDayContent}
      />

      <p className="text-xs leading-relaxed text-text-subtle">{t("infoNote")}</p>
    </div>
  );
}
