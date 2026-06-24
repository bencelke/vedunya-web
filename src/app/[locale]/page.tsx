import { setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { hasLocale } from "next-intl";

import { SignedOutRootRedirect } from "@/features/auth/components/signed-out-root-redirect";
import { getProfileSnapshot } from "@/features/profile/services/profile-repository";
import type { SupportedLocale } from "@/config/app-config";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  getOnboardingRedirectPath,
  getTodayRedirectPath,
} from "@/lib/auth/paths";
import { routing } from "@/i18n/routing";

type RootPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function RootPage({ params }: RootPageProps) {
  const { locale: localeParam } = await params;

  if (!hasLocale(routing.locales, localeParam)) {
    notFound();
  }

  const locale = localeParam as SupportedLocale;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (user) {
    const profile = await getProfileSnapshot(user.uid);
    if (profile?.profileComplete === true) {
      redirect(getTodayRedirectPath(locale));
    }
    redirect(getOnboardingRedirectPath(locale));
  }

  return <SignedOutRootRedirect />;
}
