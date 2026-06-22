import { useTranslations } from "next-intl";

import {
  Card,
  CardBody,
  CardLabel,
  CardTitle,
} from "@/components/ui/card";
import type { PersonalDayResult } from "@/features/numerology/types/numerology";

type PersonalDayCardProps = {
  result: PersonalDayResult;
};

export function PersonalDayCard({ result }: PersonalDayCardProps) {
  const t = useTranslations("numerology");

  return (
    <Card
      elevated
      className="overflow-hidden border-accent-gold/20 bg-surface-elevated"
      aria-labelledby="personal-day-title"
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-accent-gold/30 bg-accent-gold-muted"
          aria-label={t("numberA11y", {
            number: result.calculation.personalDayNumber,
          })}
        >
          <span className="text-3xl font-medium tabular-nums text-accent-gold">
            {result.calculation.personalDayNumber}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <CardLabel>{t("personalDayLabel")}</CardLabel>
          <CardTitle id="personal-day-title">{result.content.title}</CardTitle>
          <p className="mt-1 text-xs text-text-subtle">{t("basedOnBirthDate")}</p>
        </div>
      </div>

      <CardBody className="mt-4">{result.content.summary}</CardBody>

      <PersonalDayDetails result={result} />
    </Card>
  );
}

function PersonalDayDetails({ result }: PersonalDayCardProps) {
  const t = useTranslations("numerology");

  return (
    <div className="mt-5 space-y-4 border-t border-border-subtle pt-5">
      <section>
        <h4 className="text-xs font-medium uppercase tracking-[0.14em] text-accent-gold">
          {t("actionLabel")}
        </h4>
        <p className="mt-2 text-sm leading-relaxed text-text-primary">
          {result.content.doAdvice}
        </p>
      </section>

      {result.content.avoidAdvice ? (
        <section>
          <h4 className="text-xs font-medium uppercase tracking-[0.14em] text-text-subtle">
            {t("reflectionLabel")}
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            {result.content.avoidAdvice}
          </p>
        </section>
      ) : null}
    </div>
  );
}
