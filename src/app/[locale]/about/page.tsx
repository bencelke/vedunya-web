import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";

import { TrustPageShell } from "@/features/trust/components/trust-page-shell";
import { TrustSection } from "@/features/trust/components/trust-section";
import { routing } from "@/i18n/routing";
import type { SupportedLocale } from "@/config/app-config";

const ABOUT_SECTIONS = ["practice", "brand", "web"] as const;

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("metaTitle") };
}

export default async function AboutPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  if (!hasLocale(routing.locales, localeParam)) {
    notFound();
  }

  const locale = localeParam as SupportedLocale;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const tCommon = await getTranslations("legal.common");

  return (
    <TrustPageShell
      title={t("title")}
      description={t("intro")}
      backLabel={tCommon("backToProfile")}
    >
      {ABOUT_SECTIONS.map((key) => (
        <TrustSection key={key} title={t(`sections.${key}.title`)}>
          <p>{t(`sections.${key}.body`)}</p>
        </TrustSection>
      ))}
    </TrustPageShell>
  );
}
