import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { redirect } from "@/i18n/navigation";
import { hasLocale } from "next-intl";

import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { MobilePage } from "@/components/layout/mobile-page";
import { normalizeRuneKey, resolveRuneId } from "@/features/runes/constants/rune-aliases";
import { RuneDetailScreen } from "@/features/runes/components/rune-detail-screen";
import { loadRuneDetail } from "@/features/runes/services/load-rune-detail";
import { routing } from "@/i18n/routing";
import type { SupportedLocale } from "@/config/app-config";

export const dynamic = "force-dynamic";

type RuneDetailPageProps = {
  params: Promise<{ locale: string; runeId: string }>;
};

export async function generateMetadata({
  params,
}: RuneDetailPageProps): Promise<Metadata> {
  const { locale, runeId } = await params;
  const canonical = resolveRuneId(runeId);
  const t = await getTranslations({ locale, namespace: "runes" });

  if (!canonical) {
    return { title: t("invalidRune") };
  }

  const loaded = await loadRuneDetail(canonical, locale as SupportedLocale);
  if (loaded.status === "ready") {
    return { title: loaded.detail.content.title };
  }

  return { title: t("invalidRune") };
}

export default async function RuneDetailPage({ params }: RuneDetailPageProps) {
  const { locale: localeParam, runeId: rawRuneId } = await params;

  if (!hasLocale(routing.locales, localeParam)) {
    notFound();
  }

  const locale = localeParam as SupportedLocale;
  setRequestLocale(locale);

  const normalized = normalizeRuneKey(rawRuneId);
  const canonical = resolveRuneId(rawRuneId);

  if (!canonical) {
    notFound();
  }

  if (normalized !== rawRuneId.trim().toLowerCase()) {
    redirect({ href: `/runes/${canonical}`, locale });
  }

  const t = await getTranslations("runes");
  const loaded = await loadRuneDetail(canonical, locale);

  if (loaded.status === "not-found") {
    notFound();
  }

  return (
    <>
      <AppHeader showLogin={false} />
      <AppShell>
        <MobilePage className="mystic-today-column py-6 pt-safe-top">
          <RuneDetailScreen
            loaded={loaded}
            backLabel={t("backToToday")}
            focusLabel={t("focusLabel")}
            symbolAlt={t("symbolA11y", {
              rune:
                loaded.status === "ready"
                  ? loaded.detail.content.title
                  : canonical,
            })}
          />
        </MobilePage>
      </AppShell>
    </>
  );
}
