import { useTranslations } from "next-intl";

import {
  Card,
  CardBody,
  CardLabel,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { RuneSymbol } from "@/features/runes/components/rune-symbol";
import type { DailyRuneResult } from "@/features/runes/types/rune";

type DailyRuneCardProps = {
  result: DailyRuneResult;
};

export function DailyRuneCard({ result }: DailyRuneCardProps) {
  const t = useTranslations("runes");

  return (
    <Card elevated className="border-accent-gold/15 bg-surface-elevated">
      <div className="flex items-start gap-4">
        <RuneSymbol
          runeId={result.selection.runeId}
          alt={t("symbolA11y", { rune: result.content.title })}
          size={72}
        />
        <div className="min-w-0 flex-1">
          <CardLabel>{t("dailyLabel")}</CardLabel>
          <CardTitle>{result.content.title}</CardTitle>
        </div>
      </div>
      <CardBody className="mt-4">{result.content.short}</CardBody>
      {result.content.action ? (
        <div className="mt-5 border-t border-border-subtle pt-5">
          <h4 className="text-xs font-medium uppercase tracking-[0.14em] text-accent-gold">
            {t("actionLabel")}
          </h4>
          <p className="mt-2 text-sm leading-relaxed text-text-primary">
            {result.content.action}
          </p>
        </div>
      ) : null}
      <Link
        href={`/runes/${result.selection.runeId}`}
        className="mt-5 inline-flex text-sm font-medium text-accent-gold underline-offset-4 hover:underline"
      >
        {t("viewMeaning")}
      </Link>
    </Card>
  );
}
