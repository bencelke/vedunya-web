"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

export function OfflineActions() {
  const t = useTranslations("pwa");

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-pill)] bg-accent-gold px-6 text-sm font-medium text-page-bg"
      >
        {t("offlineRetry")}
      </button>
      <Link
        href="/today"
        className="inline-flex min-h-11 items-center justify-center text-sm font-medium text-accent-gold underline-offset-4 hover:underline"
      >
        {t("offlineBackToToday")}
      </Link>
    </div>
  );
}
