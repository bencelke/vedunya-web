"use client";

import { useState } from "react";
import { Download, Smartphone } from "lucide-react";
import { useTranslations } from "next-intl";

import { MysticBrandHeader } from "@/components/brand/mystic-brand-header";
import { MobilePage } from "@/components/layout/mobile-page";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { usePwaInstallState } from "@/features/pwa/use-pwa-install-state";
import { Link } from "@/i18n/navigation";

export function InstallEducationPage() {
  const t = useTranslations("pwa.installPage");
  const tAuth = useTranslations("auth");
  const { user, sessionReady, loading } = useAuth();
  const {
    isStandalone,
    showIosInstructions,
    showAndroidInstall,
    promptInstall,
    platform,
  } = usePwaInstallState();
  const [installOutcome, setInstallOutcome] = useState<
    "accepted" | "dismissed" | null
  >(null);
  const [installing, setInstalling] = useState(false);

  const isSignedIn = Boolean(user && sessionReady && !loading);

  async function handleInstallClick() {
    if (!showAndroidInstall) {
      return;
    }

    setInstalling(true);
    try {
      const accepted = await promptInstall();
      setInstallOutcome(accepted ? "accepted" : "dismissed");
    } finally {
      setInstalling(false);
    }
  }

  const steps = [t("step1"), t("step2"), t("step3"), t("step4")];

  return (
    <MobilePage className="mystic-today-column pb-28 pt-safe-top">
      <div className="space-y-8 py-4">
        <MysticBrandHeader wordmark={t("wordmark")} size="lg" showDivider />

        <div className="space-y-3 text-center">
          <h1 className="text-2xl font-medium tracking-tight text-text-primary">
            {t("title")}
          </h1>
          <p className="text-sm leading-[1.72] text-text-muted">{t("hero")}</p>
        </div>

        <section
          className="mystic-cosmic-card space-y-3 p-5"
          aria-labelledby="install-why"
        >
          <h2
            id="install-why"
            className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-gold/85"
          >
            {t("whyInstallTitle")}
          </h2>
          <p className="text-sm leading-relaxed text-text-muted">{t("whyInstallBody")}</p>
        </section>

        <section className="mystic-cosmic-card space-y-4 p-5" aria-labelledby="install-how">
          <h2 id="install-how" className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-gold/85">
            {t("howItWorksTitle")}
          </h2>
          <ol className="space-y-3 text-sm leading-relaxed text-text-muted">
            {steps.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-accent-gold/30 text-xs font-medium text-accent-gold/90">
                  {index + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section
          className="mystic-profile-panel space-y-4 p-5"
          aria-labelledby="install-platform"
        >
          <div className="flex items-start gap-3">
            <div className="mystic-profile-hero-avatar !h-11 !w-11 shrink-0">
              <Smartphone className="size-5 text-accent-gold/90" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              <h2
                id="install-platform"
                className="text-sm font-medium text-text-primary"
              >
                {isStandalone
                  ? t("installedTitle")
                  : showIosInstructions
                    ? t("platformIphoneTitle")
                    : platform === "android"
                      ? t("platformAndroidTitle")
                      : t("unsupportedBrowserTitle")}
              </h2>

              {isStandalone ? (
                <p className="text-sm leading-relaxed text-text-muted">
                  {t("installedState")}
                </p>
              ) : showIosInstructions ? (
                <p className="text-sm leading-relaxed text-text-muted">
                  {t("platformIphoneBody")}
                </p>
              ) : platform === "android" ? (
                <>
                  <p className="text-sm leading-relaxed text-text-muted">
                    {t("platformAndroidBody")}
                  </p>
                  {showAndroidInstall ? (
                    <button
                      type="button"
                      disabled={installing}
                      onClick={() => {
                        void handleInstallClick();
                      }}
                      className="mystic-profile-hero-chip inline-flex items-center gap-2 touch-manipulation disabled:opacity-60"
                    >
                      <Download className="size-3.5" aria-hidden="true" />
                      {installing ? t("installing") : t("installAction")}
                    </button>
                  ) : null}
                </>
              ) : (
                <p className="text-sm leading-relaxed text-text-muted">
                  {t("unsupportedBrowser")}
                </p>
              )}

              {installOutcome === "accepted" ? (
                <p className="text-sm text-accent-gold/90">{t("installAccepted")}</p>
              ) : null}
              {installOutcome === "dismissed" ? (
                <p className="text-sm text-text-subtle">{t("installDismissed")}</p>
              ) : null}
            </div>
          </div>
        </section>

        <p className="rounded-[var(--radius-card)] border border-border-subtle/70 bg-surface-primary/50 px-4 py-3 text-xs leading-relaxed text-text-subtle">
          {t("notificationNote")}
        </p>

        <section
          className="mystic-profile-panel space-y-3 p-5"
          aria-labelledby="install-remove"
        >
          <h2 id="install-remove" className="text-sm font-medium text-text-primary">
            {t("removeTitle")}
          </h2>
          <ul className="space-y-2 text-sm leading-relaxed text-text-muted">
            <li>{t("removeIphone")}</li>
            <li>{t("removeAndroid")}</li>
          </ul>
          <p className="text-xs leading-relaxed text-text-subtle">{t("removeAccountNote")}</p>
        </section>

        <div className="flex flex-col gap-3 pt-2">
          {isSignedIn ? (
            <>
              <Link
                href="/today"
                className="mystic-profile-hero-chip w-full text-center touch-manipulation"
              >
                {t("enterMystic")}
              </Link>
              <Link
                href="/profile"
                className="w-full rounded-[var(--radius-pill)] border border-border-subtle px-4 py-2.5 text-center text-sm text-text-muted touch-manipulation"
              >
                {t("profileLink")}
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className="mystic-profile-hero-chip w-full text-center touch-manipulation"
            >
              {t("continueLogin")}
            </Link>
          )}

          <Link
            href="/"
            className="text-center text-xs text-text-subtle underline-offset-4 hover:text-text-muted hover:underline"
          >
            {tAuth("backToLanding")}
          </Link>
        </div>
      </div>
    </MobilePage>
  );
}
