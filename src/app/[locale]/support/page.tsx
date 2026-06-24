import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";

import { SUPPORT_EMAIL } from "@/features/trust/constants";
import { TrustPageShell } from "@/features/trust/components/trust-page-shell";
import { TrustSection } from "@/features/trust/components/trust-section";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import type { SupportedLocale } from "@/config/app-config";

const SUPPORT_TOPICS = [
  "account",
  "login",
  "courses",
  "notifications",
  "payments",
  "deletion",
] as const;

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "support" });
  return { title: t("metaTitle") };
}

export default async function SupportPage({ params }: PageProps) {
  const { locale: localeParam } = await params;
  if (!hasLocale(routing.locales, localeParam)) {
    notFound();
  }

  const locale = localeParam as SupportedLocale;
  setRequestLocale(locale);
  const t = await getTranslations("support");
  const tCommon = await getTranslations("legal.common");

  return (
    <TrustPageShell
      title={t("title")}
      description={t("intro")}
      backLabel={tCommon("backToProfile")}
    >
      {SUPPORT_TOPICS.map((key) => (
        <TrustSection key={key} title={t(`topics.${key}.title`)}>
          <p>{t(`topics.${key}.body`)}</p>
        </TrustSection>
      ))}
      <TrustSection title={t("contactTitle")}>
        <p>{t("contactBody")}</p>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="inline-block text-accent-gold underline-offset-2 hover:underline"
        >
          {SUPPORT_EMAIL}
        </a>
        <p className="pt-2">
          <Link
            href="/account/data-deletion"
            className="text-accent-gold underline-offset-2 hover:underline"
          >
            {t("deletionLink")}
          </Link>
        </p>
      </TrustSection>
    </TrustPageShell>
  );
}
