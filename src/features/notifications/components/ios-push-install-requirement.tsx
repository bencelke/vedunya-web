"use client";

import { useTranslations } from "next-intl";

import { Card } from "@/components/ui/card";

export function IosPushInstallRequirement() {
  const t = useTranslations("notifications");

  return (
    <Card className="border-accent-gold/20 bg-surface-elevated/90">
      <p className="text-sm font-medium text-text-primary">{t("iosInstallTitle")}</p>
      <p className="mt-2 text-sm leading-relaxed text-text-muted">{t("iosInstallBody")}</p>
    </Card>
  );
}
