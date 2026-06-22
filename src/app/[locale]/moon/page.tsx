import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";

import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { MobilePage } from "@/components/layout/mobile-page";
import { MoonErrorState } from "@/features/moon/components/moon-error-state";
import { MoonGuidanceSection } from "@/features/moon/components/moon-guidance-section";
import { TimezoneCookieSync } from "@/features/numerology/components/timezone-cookie-sync";
import { loadCurrentMoonGuidance } from "@/features/moon/services/load-current-moon-guidance";
import { routing } from "@/i18n/routing";
import type { SupportedLocale } from "@/config/app-config";

export const dynamic = "force-dynamic";

type MoonPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: MoonPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "moon" });

  return {
    title: t("metaTitle"),
  };
}

export default async function MoonPage({ params }: MoonPageProps) {
  const { locale: localeParam } = await params;

  if (!hasLocale(routing.locales, localeParam)) {
    notFound();
  }

  const locale = localeParam as SupportedLocale;
  setRequestLocale(locale);
  const t = await getTranslations("moon");
  const moon = await loadCurrentMoonGuidance(locale);

  return (
    <>
      <TimezoneCookieSync />
      <AppHeader showLogin={false} />
      <AppShell>
        <MobilePage title={t("heading")} description={t("description")}>
          {moon.status === "ready" ? (
            <MoonGuidanceSection guidance={moon.guidance} />
          ) : (
            <MoonErrorState />
          )}
        </MobilePage>
      </AppShell>
    </>
  );
}
