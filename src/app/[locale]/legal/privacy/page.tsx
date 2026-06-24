import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";

import { TrustPageShell } from "@/features/trust/components/trust-page-shell";
import { TrustSection } from "@/features/trust/components/trust-section";
import { routing } from "@/i18n/routing";
import type { SupportedLocale } from "@/config/app-config";

const PRIVACY_SECTIONS = [
  "collect",
  "use",
  "firebase",
  "profile",
  "request",
  "notifications",
  "courses",
  "payments",
  "cookies",
  "deletion",
  "contact",
] as const;

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.privacy" });
  return { title: t("metaTitle") };
}

export default async function PrivacyPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  if (!hasLocale(routing.locales, localeParam)) {
    notFound();
  }

  const locale = localeParam as SupportedLocale;
  setRequestLocale(locale);
  const t = await getTranslations("legal.privacy");
  const tCommon = await getTranslations("legal.common");

  return (
    <TrustPageShell
      title={t("title")}
      description={t("intro")}
      backLabel={tCommon("backToProfile")}
    >
      <TrustSection title={tCommon("prototypeNoteTitle")}>
        <p>{tCommon("prototypeNote")}</p>
      </TrustSection>
      {PRIVACY_SECTIONS.map((key) => (
        <TrustSection key={key} title={t(`sections.${key}.title`)}>
          <p>{t(`sections.${key}.body`)}</p>
        </TrustSection>
      ))}
    </TrustPageShell>
  );
}
