import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";

import { AppHeader } from "@/components/layout/app-header";
import { Container } from "@/components/ui/container";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { validateFirebaseConfig } from "@/lib/firebase/config";
import { validateFirebaseAdminConfig } from "@/lib/firebase-admin/config";

type ForgotPasswordPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: ForgotPasswordPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.forgotPassword" });
  return { title: t("metaTitle") };
}

export default async function ForgotPasswordPage({
  params,
}: ForgotPasswordPageProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const t = await getTranslations("auth.forgotPassword");
  const configured =
    validateFirebaseConfig().configured &&
    validateFirebaseAdminConfig().configured;

  return (
    <>
      <AppHeader showLogin={false} />
      <Container narrow className="space-y-6 py-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-medium text-text-primary">{t("heading")}</h1>
          <p className="text-sm leading-relaxed text-text-muted">{t("description")}</p>
        </header>
        {configured ? (
          <ForgotPasswordForm />
        ) : (
          <p className="text-sm text-text-muted">{t("configurationRequired")}</p>
        )}
        <Link href="/login" className="text-sm text-text-muted underline-offset-4 hover:underline">
          {t("backToLogin")}
        </Link>
      </Container>
    </>
  );
}
