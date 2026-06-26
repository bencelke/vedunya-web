import { redirect } from "next/navigation";
import { hasLocale } from "next-intl";

import { routing } from "@/i18n/routing";
import type { SupportedLocale } from "@/config/app-config";

type MysticPlusAliasPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function MysticPlusAliasPage({ params }: MysticPlusAliasPageProps) {
  const { locale: localeParam } = await params;

  if (!hasLocale(routing.locales, localeParam)) {
    redirect("/en/plus");
  }

  const locale = localeParam as SupportedLocale;
  redirect(`/${locale}/plus`);
}
