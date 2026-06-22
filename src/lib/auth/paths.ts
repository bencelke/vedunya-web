import type { SupportedLocale } from "@/config/app-config";

export function getLoginRedirectPath(locale: SupportedLocale): string {
  return `/${locale}/login`;
}

export function getOnboardingRedirectPath(locale: SupportedLocale): string {
  return `/${locale}/onboarding`;
}

export function getTodayRedirectPath(locale: SupportedLocale): string {
  return `/${locale}/today`;
}
