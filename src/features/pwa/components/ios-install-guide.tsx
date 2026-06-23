"use client";

import { useTranslations } from "next-intl";

type IosInstallGuideProps = {
  onDismiss: () => void;
};

export function IosInstallGuide({ onDismiss }: IosInstallGuideProps) {
  const t = useTranslations("pwa");

  return (
    <div className="mystic-cosmic-card space-y-4 p-5">
      <div className="space-y-2">
        <h2 className="text-base font-medium text-text-primary">{t("installTitle")}</h2>
        <p className="text-sm leading-[1.72] text-text-muted">{t("installBody")}</p>
        <p className="text-sm leading-[1.72] text-text-primary">{t("iosGuide")}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="text-sm font-medium text-text-muted underline-offset-4 hover:text-text-primary hover:underline"
      >
        {t("installDismiss")}
      </button>
    </div>
  );
}
