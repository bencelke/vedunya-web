"use client";

import { useTranslations } from "next-intl";

import { MysticPlusPaywallLink } from "@/features/premium/components/mystic-plus-paywall-link";

type TodayMysticPlusPanelProps = {
  sectionNote?: string;
};

export function TodayMysticPlusPanel({ sectionNote }: TodayMysticPlusPanelProps) {
  const t = useTranslations("premium");
  const tPaywall = useTranslations("premium.paywall");

  return (
    <section className="mystic-today-section mystic-today-plus-panel space-y-4 text-center">
      <div className="mystic-today-divider mystic-today-divider--section" aria-hidden="true" />
      {sectionNote ? (
        <p className="mystic-today-caption">{sectionNote}</p>
      ) : null}
      <div className="space-y-3">
        <p className="mystic-today-overline">{t("productName")}</p>
        <p className="mx-auto max-w-[20rem] text-sm leading-[1.68] text-text-muted">
          {t("lockBody")}
        </p>
      </div>
      <MysticPlusPaywallLink
        label={tPaywall("unlockFullReading")}
        className="inline-flex"
      />
      <p className="text-xs text-text-subtle">
        <MysticPlusPaywallLink variant="text" label={tPaywall("openInPlus")} />
      </p>
    </section>
  );
}
