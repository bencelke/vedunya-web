import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";

import { FinalCta } from "@/components/landing/final-cta";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LandingHero } from "@/components/landing/landing-hero";
import { ValuePreview } from "@/components/landing/value-preview";
import { AppHeader } from "@/components/layout/app-header";
import { Container } from "@/components/ui/container";
import type { SupportedLocale } from "@/config/app-config";
import { routing } from "@/i18n/routing";

type PreviewPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { locale: localeParam } = await params;

  if (!hasLocale(routing.locales, localeParam)) {
    notFound();
  }

  const locale = localeParam as SupportedLocale;
  setRequestLocale(locale);

  return (
    <>
      <AppHeader />
      <Container className="space-y-12 pb-16 pt-6">
        <LandingHero />
        <ValuePreview />
        <HowItWorks />
        <FinalCta />
      </Container>
    </>
  );
}
