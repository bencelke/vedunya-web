import { Geist } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { hasLocale } from "next-intl";
import type { Metadata, Viewport } from "next";

import { appConfig } from "@/config/app-config";
import { AuthProvider } from "@/features/auth/components/auth-provider";
import { routing } from "@/i18n/routing";
import { validateFirebaseConfig } from "@/lib/firebase/config";
import { validateFirebaseAdminConfig } from "@/lib/firebase-admin/config";

import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing.hero" });

  return {
    title: {
      default: appConfig.name,
      template: `%s · ${appConfig.shortName}`,
    },
    description: t("supporting"),
    applicationName: appConfig.shortName,
    manifest: "/manifest.webmanifest",
    metadataBase: new URL(appConfig.productionUrl),
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: appConfig.shortName,
    },
    formatDetection: {
      telephone: false,
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#08070b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const clientConfigured = validateFirebaseConfig().configured;
  const adminConfigured = validateFirebaseAdminConfig().configured;

  return (
    <html lang={locale} className={`${geistSans.variable} h-full`}>
      <body className="min-h-full antialiased">
        <NextIntlClientProvider messages={messages}>
          <AuthProvider
            configured={clientConfigured}
            adminConfigured={adminConfigured}
          >
            {children}
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
