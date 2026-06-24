import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";

import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { ProfileContent } from "@/features/profile/components/profile-content";
import { loadUserEntitlements } from "@/features/payments/server/entitlement-repository";
import { LIVING_THE_RUNES_COURSE_ID } from "@/features/courses/constants/course-ids";
import { getPushStatusSummary } from "@/features/notifications/server/push-status";
import { loadProfileSettingsSummary } from "@/features/profile/server/load-profile-settings-summary";
import { getProfileSnapshot } from "@/features/profile/services/profile-repository";
import { readUniverseRequest } from "@/features/universe-request/server/universe-request-repository";
import { requireUser } from "@/lib/auth/current-user";
import { routing } from "@/i18n/routing";
import type { SupportedLocale } from "@/config/app-config";

type ProfilePageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ checkout?: string }>;
};

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "profile" });
  return { title: t("metaTitle") };
}

export default async function ProfilePage({
  params,
  searchParams,
}: ProfilePageProps) {
  const { locale: localeParam } = await params;
  const { checkout } = await searchParams;

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

  const [pushStatus, hasActiveUniverseRequest, settingsSummary, entitlements] =
    await Promise.all([
      getPushStatusSummary(user.uid, locale),
      readUniverseRequest(user.uid).then((request) => request !== null),
      loadProfileSettingsSummary({ uid: user.uid }),
      loadUserEntitlements(user.uid),
    ]);

  const hasLivingTheRunesAccess = entitlements.ownedCourseIds.has(
    LIVING_THE_RUNES_COURSE_ID,
  );

  return (
    <>
      <AppHeader showLogin={false} showProfile />
      <AppShell>
        <ProfileContent
          locale={locale}
          profile={profile}
          pushStatus={pushStatus}
          hasActiveUniverseRequest={hasActiveUniverseRequest}
          settingsSummary={settingsSummary}
          mysticPlus={entitlements.mysticPlus}
          hasLivingTheRunesAccess={hasLivingTheRunesAccess}
          checkoutPending={checkout === "pending"}
        />
      </AppShell>
    </>
  );
}
