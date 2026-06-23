"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

type PwaInstallPromptProps = {
  onInstall: () => void;
  onDismiss: () => void;
};

export function PwaInstallPrompt({ onInstall, onDismiss }: PwaInstallPromptProps) {
  const t = useTranslations("pwa");

  return (
    <div className="mystic-cosmic-card space-y-4 p-5">
      <div className="space-y-2">
        <h2 className="text-base font-medium text-text-primary">{t("installTitle")}</h2>
        <p className="text-sm leading-[1.72] text-text-muted">{t("installBody")}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button className="w-full sm:w-auto" onClick={onInstall}>
          {t("installAction")}
        </Button>
        <Button variant="ghost" className="w-full sm:w-auto" onClick={onDismiss}>
          {t("installDismiss")}
        </Button>
      </div>
    </div>
  );
}
