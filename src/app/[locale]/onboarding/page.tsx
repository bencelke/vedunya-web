import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { hasLocale } from "next-intl";

import { IntroOnboardingGate } from "@/features/onboarding/components/intro-onboarding-gate";
import { OnboardingFlow } from "@/features/onboarding/components/onboarding-flow";
import { getProfileSnapshot } from "@/features/profile/services/profile-repository";
import type { SupportedLocale } from "@/config/app-config";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getTodayRedirectPath } from "@/lib/auth/paths";
import { routing } from "@/i18n/routing";

type OnboardingPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: OnboardingPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.onboarding" });
  return { title: t("metaTitle") };
}

export default async function OnboardingPage({ params }: OnboardingPageProps) {
  const { locale: localeParam } = await params;

  if (!hasLocale(routing.locales, localeParam)) {
    notFound();
  }

  const locale = localeParam as SupportedLocale;
  setRequestLocale(locale);

  const user = await getCurrentUser();

  if (!user) {
    return <IntroOnboardingGate />;
  }

  const profile = await getProfileSnapshot(user.uid);
  if (profile?.profileComplete === true) {
    redirect(getTodayRedirectPath(locale));
  }

  return <OnboardingFlow locale={locale} initialProfile={profile} />;
}
