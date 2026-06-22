import { useTranslations } from "next-intl";

import {
  Card,
  CardBody,
  CardLabel,
  CardTitle,
} from "@/components/ui/card";
import type { MoonLocalizedContent } from "@/features/moon/types/moon";

type LunarDayCardProps = {
  lunarDay: number;
  content: MoonLocalizedContent | null;
};

export function LunarDayCard({ lunarDay, content }: LunarDayCardProps) {
  const t = useTranslations("moon");

  if (!content) {
    return (
      <Card>
        <CardLabel>{t("lunarDayLabel", { day: lunarDay })}</CardLabel>
        <CardBody>{t("lunarDayMissing")}</CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardLabel>{t("lunarDayLabel", { day: lunarDay })}</CardLabel>
      {content.title ? <CardTitle>{content.title}</CardTitle> : null}
      <CardBody>{content.short}</CardBody>
      {content.action ? (
        <p className="mt-4 text-sm text-text-primary">{content.action}</p>
      ) : null}
    </Card>
  );
}
