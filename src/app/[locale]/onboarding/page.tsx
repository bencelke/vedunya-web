import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";

import { OnboardingFlow } from "@/features/auth/components/onboarding-flow";
import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { getProfileSnapshot } from "@/features/profile/services/profile-repository";
import { requireIncompleteProfile } from "@/lib/auth/require-user";
import { routing } from "@/i18n/routing";
import type { SupportedLocale } from "@/config/app-config";

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
  const { user } = await requireIncompleteProfile(locale);
  const profile = await getProfileSnapshot(user.uid);

  return (
    <>
      <AppHeader showLogin={false} />
      <AppShell>
        <OnboardingFlow locale={locale} initialProfile={profile} />
      </AppShell>
    </>
  );
}
