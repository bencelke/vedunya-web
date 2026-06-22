import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";

import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { ProfileContent } from "@/features/profile/components/profile-content";
import { getProfileSnapshot } from "@/features/profile/services/profile-repository";
import { requireUser } from "@/lib/auth/current-user";
import { routing } from "@/i18n/routing";
import type { SupportedLocale } from "@/config/app-config";

type ProfilePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.profile" });
  return { title: t("metaTitle") };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { locale: localeParam } = await params;

  if (!hasLocale(routing.locales, localeParam)) {
    notFound();
  }

  const locale = localeParam as SupportedLocale;
  setRequestLocale(locale);
  const user = await requireUser(locale);
  const profile = await getProfileSnapshot(user.uid);

  if (!profile) {
    notFound();
  }

  return (
    <>
      <AppHeader showLogin={false} />
      <AppShell>
        <ProfileContent locale={locale} profile={profile} />
      </AppShell>
    </>
  );
}
