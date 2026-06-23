import { Geist } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  setRequestLocale,
} from "next-intl/server";
import { hasLocale } from "next-intl";
import type { Metadata, Viewport } from "next";

import { appConfig } from "@/config/app-config";
import { pwaConfig } from "@/config/pwa";
import { AuthProvider } from "@/features/auth/components/auth-provider";
import { DevServiceWorkerCleanup } from "@/components/pwa/dev-service-worker-cleanup";
import { DevServiceWorkerCleanupScript } from "@/components/pwa/dev-service-worker-cleanup-script";
import { PwaRegistrar } from "@/components/pwa/pwa-registrar";
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
  await params;

  return {
    title: {
      default: appConfig.name,
      template: `%s · ${appConfig.shortName}`,
    },
    description: pwaConfig.description,
    applicationName: appConfig.shortName,
    manifest: "/manifest.webmanifest",
    metadataBase: new URL(appConfig.productionUrl),
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: appConfig.shortName,
    },
    icons: {
      icon: [
        { url: pwaConfig.icons.icon192, sizes: "192x192", type: "image/png" },
        { url: pwaConfig.icons.icon512, sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: pwaConfig.icons.appleTouchIcon, sizes: "180x180" }],
    },
    formatDetection: {
      telephone: false,
    },
  };
}

export const viewport: Viewport = {
  themeColor: pwaConfig.themeColor,
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
      <head>
        <DevServiceWorkerCleanupScript />
      </head>
      <body className="min-h-full antialiased">
        <NextIntlClientProvider messages={messages}>
          <AuthProvider
            configured={clientConfigured}
            adminConfigured={adminConfigured}
          >
            {children}
            <DevServiceWorkerCleanup />
            <PwaRegistrar />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
