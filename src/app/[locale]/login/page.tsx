import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

import { AuthScreen } from "@/features/auth/components/auth-screen";
import { redirectAuthenticatedFromLogin } from "@/lib/auth/require-user";
import type { SupportedLocale } from "@/config/app-config";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";

type LoginPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ mode?: string }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: LoginPageProps): Promise<Metadata> {
  const { locale } = await params;
  const { mode } = await searchParams;
  const t = await getTranslations({ locale, namespace: "auth" });
  return {
    title: mode === "register" ? t("registerMetaTitle") : t("loginMetaTitle"),
  };
}

export default async function LoginPage({
  params,
  searchParams,
}: LoginPageProps) {
  const { locale: localeParam } = await params;
  const { mode } = await searchParams;

  if (!hasLocale(routing.locales, localeParam)) {
    notFound();
  }

  const locale = localeParam as SupportedLocale;
  setRequestLocale(locale);
  await redirectAuthenticatedFromLogin(locale);

  const initialMode = mode === "register" ? "register" : "login";

  return <AuthScreen locale={locale} initialMode={initialMode} />;
}
