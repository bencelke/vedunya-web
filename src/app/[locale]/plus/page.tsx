import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";

import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { MobilePage } from "@/components/layout/mobile-page";
import { loadUserEntitlements } from "@/features/payments/server/entitlement-repository";
import { MysticPlusPaywallScreen } from "@/features/premium/components/mystic-plus-paywall-screen";
import { getProfileSnapshot } from "@/features/profile/services/profile-repository";
import { getCurrentUser } from "@/lib/auth/current-user";
import { routing } from "@/i18n/routing";
import type { SupportedLocale } from "@/config/app-config";

export const dynamic = "force-dynamic";

type PlusPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: PlusPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "premium.paywall" });

  return {
    title: t("metaTitle"),
  };
}

export default async function PlusPage({ params }: PlusPageProps) {
  const { locale: localeParam } = await params;

  if (!hasLocale(routing.locales, localeParam)) {
    notFound();
  }

  const locale = localeParam as SupportedLocale;
  setRequestLocale(locale);

  const sessionUser = await getCurrentUser();
  const profile = sessionUser ? await getProfileSnapshot(sessionUser.uid) : null;
  const mysticPlus = sessionUser
    ? (await loadUserEntitlements(sessionUser.uid)).mysticPlus
    : null;

  return (
    <>
      <AppHeader showLogin={!sessionUser} />
      <AppShell>
        <MobilePage className="mystic-today-column py-6 pt-safe-top">
          <MysticPlusPaywallScreen profile={profile} mysticPlus={mysticPlus} />
        </MobilePage>
      </AppShell>
    </>
  );
}
