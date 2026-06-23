"use client";

import { useTranslations } from "next-intl";

export function InstalledAppHint() {
  const t = useTranslations("pwa");

  return (
    <div className="mystic-cosmic-card p-5">
      <p className="text-sm leading-[1.72] text-text-muted">{t("installedHint")}</p>
    </div>
  );
}
