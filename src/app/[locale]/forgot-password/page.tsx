import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";

import { AuthBrandHeader } from "@/features/auth/components/auth-brand-header";
import { AuthLanguageBar } from "@/features/auth/components/auth-language-bar";
import { AuthShell } from "@/features/auth/components/auth-shell";
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
  const tAuth = await getTranslations("auth");
  const configured =
    validateFirebaseConfig().configured &&
    validateFirebaseAdminConfig().configured;

  return (
    <AuthShell
      topBar={
        <AuthLanguageBar
          backHref="/login"
          backLabel={t("backToLogin")}
          tone="auth"
        />
      }
    >
      <div className="space-y-8">
        <AuthBrandHeader headline={t("heading")} subtitle={t("description")} />
        {configured ? (
          <ForgotPasswordForm />
        ) : (
          <p className="text-center text-sm leading-relaxed text-auth-text-muted">
            {tAuth("configuration.body")}
          </p>
        )}
        <p className="text-center">
          <Link
            href="/login"
            className="text-sm text-auth-text-muted underline-offset-4 hover:text-auth-text-primary hover:underline"
          >
            {t("backToLogin")}
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
