import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";

import { TrustPageShell } from "@/features/trust/components/trust-page-shell";
import { TrustSection } from "@/features/trust/components/trust-section";
import { routing } from "@/i18n/routing";
import type { SupportedLocale } from "@/config/app-config";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.disclaimer" });
  return { title: t("metaTitle") };
}

export default async function DisclaimerPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  if (!hasLocale(routing.locales, localeParam)) {
    notFound();
  }

  const locale = localeParam as SupportedLocale;
  setRequestLocale(locale);
  const t = await getTranslations("legal.disclaimer");
  const tCommon = await getTranslations("legal.common");

  return (
    <TrustPageShell
      title={t("title")}
      backLabel={tCommon("backToProfile")}
    >
      <TrustSection>
        <p>{t("paragraph1")}</p>
        <p>{t("paragraph2")}</p>
        <p>{t("paragraph3")}</p>
      </TrustSection>
      <TrustSection title={tCommon("prototypeNoteTitle")}>
        <p>{tCommon("prototypeNote")}</p>
      </TrustSection>
    </TrustPageShell>
  );
}
