import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";

import { SUPPORT_EMAIL } from "@/features/trust/constants";
import { TrustPageShell } from "@/features/trust/components/trust-page-shell";
import { TrustSection } from "@/features/trust/components/trust-section";
import { routing } from "@/i18n/routing";
import type { SupportedLocale } from "@/config/app-config";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dataDeletion" });
  return { title: t("metaTitle") };
}

export default async function DataDeletionPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  if (!hasLocale(routing.locales, localeParam)) {
    notFound();
  }

  const locale = localeParam as SupportedLocale;
  setRequestLocale(locale);
  const t = await getTranslations("dataDeletion");
  const tCommon = await getTranslations("legal.common");

  return (
    <TrustPageShell
      title={t("title")}
      description={t("intro")}
      backLabel={tCommon("backToProfile")}
    >
      <TrustSection>
        <p>{t("requestBody")}</p>
        <p>{t("manualNote")}</p>
      </TrustSection>
      <TrustSection title={t("contactTitle")}>
        <p>{t("contactBody")}</p>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="inline-block text-accent-gold underline-offset-2 hover:underline"
        >
          {SUPPORT_EMAIL}
        </a>
      </TrustSection>
      <TrustSection title={t("includesTitle")}>
        <p>{t("includesBody")}</p>
      </TrustSection>
    </TrustPageShell>
  );
}
