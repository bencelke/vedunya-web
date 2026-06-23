"use client";

import { PwaInstallPrompt } from "@/features/pwa/components/pwa-install-prompt";
import { IosInstallGuide } from "@/features/pwa/components/ios-install-guide";
import { InstalledAppHint } from "@/features/pwa/components/installed-app-hint";
import { usePwaInstall } from "@/features/pwa/hooks/use-pwa-install";
import { useTranslations } from "next-intl";

export function PwaInstallSection() {
  const t = useTranslations("pwa");
  const {
    showAndroidPrompt,
    showIosGuide,
    showInstalledHint,
    install,
    dismiss,
  } = usePwaInstall();

  if (!showAndroidPrompt && !showIosGuide && !showInstalledHint) {
    return null;
  }

  return (
    <section className="space-y-3">
      <p className="mystic-eyebrow">{t("sectionLabel")}</p>
      {showInstalledHint ? <InstalledAppHint /> : null}
      {showAndroidPrompt ? (
        <PwaInstallPrompt
          onInstall={() => {
            void install();
          }}
          onDismiss={dismiss}
        />
      ) : null}
      {showIosGuide ? <IosInstallGuide onDismiss={dismiss} /> : null}
    </section>
  );
}
