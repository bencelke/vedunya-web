import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { MobilePage } from "@/components/layout/mobile-page";
import { OfflineActions } from "@/features/pwa/components/offline-actions";

type OfflinePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: OfflinePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pwa" });
  return { title: t("offlineTitle") };
}

export default async function OfflinePage({ params }: OfflinePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pwa");

  return (
    <>
      <AppHeader showLogin={false} />
      <AppShell>
        <MobilePage className="mystic-today-column py-6 pt-safe-top">
          <div className="mystic-cosmic-card space-y-5 p-6 text-center">
            <h1 className="text-2xl font-medium text-text-primary">
              {t("offlineTitle")}
            </h1>
            <p className="text-sm leading-[1.72] text-text-muted">
              {t("offlineBody")}
            </p>
            <OfflineActions />
          </div>
        </MobilePage>
      </AppShell>
    </>
  );
}
