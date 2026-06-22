import "server-only";

import { redirect } from "next/navigation";

import type { SupportedLocale } from "@/config/app-config";
import { getCurrentUser, requireUser } from "@/lib/auth/current-user";
import { getOnboardingRedirectPath, getTodayRedirectPath } from "@/lib/auth/paths";
import { getProfileSnapshot } from "@/features/profile/services/profile-repository";
import type { SessionUser } from "@/types/auth";

export async function requireCompleteProfile(
  locale: SupportedLocale,
): Promise<{ user: SessionUser; profileComplete: boolean }> {
  const user = await requireUser(locale);
  const snapshot = await getProfileSnapshot(user.uid);
  const profileComplete = snapshot?.profileComplete === true;

  if (!profileComplete) {
    redirect(getOnboardingRedirectPath(locale));
  }

  return { user, profileComplete: true };
}

export async function requireIncompleteProfile(
  locale: SupportedLocale,
): Promise<{ user: SessionUser }> {
  const user = await requireUser(locale);
  const snapshot = await getProfileSnapshot(user.uid);

  if (snapshot?.profileComplete === true) {
    redirect(getTodayRedirectPath(locale));
  }

  return { user };
}

export async function redirectAuthenticatedFromLogin(
  locale: SupportedLocale,
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    return;
  }

  const snapshot = await getProfileSnapshot(user.uid);
  if (snapshot?.profileComplete === true) {
    redirect(getTodayRedirectPath(locale));
  }

  redirect(getOnboardingRedirectPath(locale));
}
