import { setRequestLocale } from "next-intl/server";

import { FinalCta } from "@/components/landing/final-cta";
import { HowItWorks } from "@/components/landing/how-it-works";
import { LandingHero } from "@/components/landing/landing-hero";
import { ValuePreview } from "@/components/landing/value-preview";
import { AppHeader } from "@/components/layout/app-header";
import { Container } from "@/components/ui/container";

type LandingPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LandingPage({ params }: LandingPageProps) {
  const { locale } = await params;
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
