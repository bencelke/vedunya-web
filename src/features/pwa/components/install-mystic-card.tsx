"use client";

import { Download, Smartphone } from "lucide-react";
import { useTranslations } from "next-intl";

import { usePwaInstallState } from "@/features/pwa/use-pwa-install-state";

type InstallMysticCardProps = {
  /** Profile panel always shows install state; other surfaces may hide when installed. */
  alwaysShow?: boolean;
};

export function InstallMysticCard({ alwaysShow = true }: InstallMysticCardProps) {
  const t = useTranslations("pwa");
  const {
    isStandalone,
    showIosInstructions,
    showAndroidInstall,
    promptInstall,
  } = usePwaInstallState();

  if (!alwaysShow && isStandalone) {
    return null;
  }

  return (
    <div className="mystic-profile-panel p-4">
      <div className="flex items-start gap-3">
        <div className="mystic-profile-hero-avatar !h-11 !w-11 shrink-0">
          <Smartphone className="size-5 text-accent-gold/90" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-sm font-medium text-text-primary">{t("installTitle")}</p>

          {isStandalone ? (
            <p className="text-sm leading-relaxed text-text-muted">{t("installedHint")}</p>
          ) : showIosInstructions ? (
            <p className="text-sm leading-relaxed text-text-muted">{t("iosInstallFull")}</p>
          ) : showAndroidInstall ? (
            <>
              <p className="text-sm leading-relaxed text-text-muted">{t("installBody")}</p>
              <button
                type="button"
                onClick={() => {
                  void promptInstall();
                }}
                className="mystic-profile-hero-chip inline-flex items-center gap-2 touch-manipulation"
              >
                <Download className="size-3.5" aria-hidden="true" />
                {t("installAction")}
              </button>
            </>
          ) : (
            <p className="text-sm leading-relaxed text-text-muted">{t("installBody")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
