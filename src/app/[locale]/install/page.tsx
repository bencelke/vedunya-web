import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";

import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { InstallEducationPage } from "@/features/pwa/components/install-education-page";
import { routing } from "@/i18n/routing";

type InstallPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: InstallPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pwa.installPage" });
  return { title: t("metaTitle") };
}

export default async function InstallPage({ params }: InstallPageProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <>
      <AppHeader showLogin />
      <AppShell>
        <InstallEducationPage />
      </AppShell>
    </>
  );
}
