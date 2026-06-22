import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { redirect } from "@/i18n/navigation";
import { hasLocale } from "next-intl";

import { AppHeader } from "@/components/layout/app-header";
import { AppShell } from "@/components/layout/app-shell";
import { MobilePage } from "@/components/layout/mobile-page";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { normalizeRuneKey, resolveRuneId } from "@/features/runes/constants/rune-aliases";
import { RuneDetailContent } from "@/features/runes/components/rune-detail-content";
import { RuneErrorState } from "@/features/runes/components/rune-error-state";
import { RuneSymbol } from "@/features/runes/components/rune-symbol";
import { loadRuneDetail } from "@/features/runes/services/load-rune-detail";
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

  return {
    title: canonical ? runeId : t("invalidRune"),
  };
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
        <MobilePage>
          <Link
            href="/today"
            className="mb-6 inline-flex text-sm text-accent-gold underline-offset-4 hover:underline"
          >
            {t("backToToday")}
          </Link>

          {loaded.status === "ready" ? (
            <div className="mx-auto max-w-xl space-y-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <RuneSymbol
                  runeId={loaded.detail.runeId}
                  alt={t("symbolA11y", {
                    rune: loaded.detail.content.title,
                  })}
                  size={120}
                />
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent-gold">
                    {t("focusLabel")}
                  </p>
                  <h1 className="mt-2 text-2xl font-medium text-text-primary">
                    {loaded.detail.content.title}
                  </h1>
                </div>
              </div>
              <RuneDetailContent detail={loaded.detail} />
            </div>
          ) : (
            <RuneErrorState />
          )}
        </MobilePage>
      </AppShell>
    </>
  );
}
