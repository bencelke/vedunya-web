import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";

import { MoonScreen } from "@/features/moon/components/moon-screen";
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
  const moon = await loadCurrentMoonGuidance(locale);

  return <MoonScreen moon={moon} />;
}
