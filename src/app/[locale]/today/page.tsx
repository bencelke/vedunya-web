import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";

import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { MobilePage } from "@/components/layout/mobile-page";
import { routing } from "@/i18n/routing";
import { DailyGuidanceExperience } from "@/features/daily-guidance/components/daily-guidance-experience";
import { loadDailyGuidance } from "@/features/daily-guidance/services/load-daily-guidance";
import { TimezoneCookieSync } from "@/features/numerology/components/timezone-cookie-sync";
import { getCurrentUser } from "@/lib/auth/current-user";
import type { SupportedLocale } from "@/config/app-config";

export const dynamic = "force-dynamic";

type TodayPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: TodayPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "today" });

  return {
    title: t("metaTitle"),
  };
}

export default async function TodayPage({ params }: TodayPageProps) {
  const { locale: localeParam } = await params;

  if (!hasLocale(routing.locales, localeParam)) {
    notFound();
  }

  const locale = localeParam as SupportedLocale;
  setRequestLocale(locale);

  const sessionUser = await getCurrentUser();
  const model = await loadDailyGuidance(locale);

  return (
    <>
      <TimezoneCookieSync />
      <AppHeader showLogin={!sessionUser} showProfile={Boolean(sessionUser)} />
      <AppShell>
        <MobilePage className="mystic-today-column py-6 pt-safe-top">
          <DailyGuidanceExperience model={model} />
        </MobilePage>
      </AppShell>
    </>
  );
}
