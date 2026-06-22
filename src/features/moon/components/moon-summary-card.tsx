import { useTranslations } from "next-intl";

import {
  Card,
  CardBody,
  CardLabel,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { MoonPhaseVisual } from "@/features/moon/components/moon-phase-visual";
import type { MoonGuidanceResult } from "@/features/moon/types/moon";

type MoonSummaryCardProps = {
  guidance: MoonGuidanceResult;
};

export function MoonSummaryCard({ guidance }: MoonSummaryCardProps) {
  const t = useTranslations("moon");

  return (
    <Card elevated className="border-accent-gold/15 bg-surface-elevated">
      <div className="flex items-start gap-4">
        <MoonPhaseVisual
          phase4Id={guidance.calculation.phaseId}
          phase8Id={guidance.calculation.phase8Id}
          alt={t("phaseVisualA11y", { phase: guidance.phase.title })}
          size={72}
        />
        <div className="min-w-0 flex-1">
          <CardLabel>{t("rhythmLabel")}</CardLabel>
          <CardTitle>{guidance.phase.title}</CardTitle>
          <p className="mt-1 text-xs text-text-subtle">
            {t("lunarDayLabel", { day: guidance.calculation.lunarDay })}
          </p>
        </div>
      </div>
      <CardBody className="mt-4">{guidance.phase.short}</CardBody>
      {guidance.phase.action ? (
        <p className="mt-4 text-sm leading-relaxed text-text-primary">
          {guidance.phase.action}
        </p>
      ) : null}
      <Link
        href="/moon"
        className="mt-5 inline-flex text-sm font-medium text-accent-gold underline-offset-4 hover:underline"
      >
        {t("viewDetails")}
      </Link>
    </Card>
  );
}
