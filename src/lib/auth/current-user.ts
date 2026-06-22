import "server-only";

import { redirect } from "next/navigation";

import type { SupportedLocale } from "@/config/app-config";
import {
  getLoginRedirectPath,
  getOnboardingRedirectPath,
  getTodayRedirectPath,
} from "@/lib/auth/paths";
import { verifySessionCookie } from "@/lib/auth/session";
import type { SessionUser } from "@/types/auth";

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await verifySessionCookie();
  return session.status === "authenticated" ? session.user : null;
}

export { getLoginRedirectPath } from "@/lib/auth/paths";

export async function requireUser(locale: SupportedLocale): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(getLoginRedirectPath(locale));
  }
  return user;
}

export async function redirectIfAuthenticated(
  locale: SupportedLocale,
  destination: "today" | "onboarding",
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    return;
  }

  redirect(
    destination === "onboarding"
      ? getOnboardingRedirectPath(locale)
      : getTodayRedirectPath(locale),
  );
}
