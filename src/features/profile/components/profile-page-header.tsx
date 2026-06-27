"use client";

import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";

export function ProfilePageHeader() {
  const t = useTranslations("profile.screen");
  const router = useRouter();

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/today");
  }

  return (
    <header className="mystic-profile-page-header pt-safe-top">
      <div className="flex min-h-12 items-center gap-2">
        <button
          type="button"
          onClick={handleBack}
          className="mystic-profile-back-btn touch-manipulation"
          aria-label={t("back")}
        >
          <ChevronLeft className="size-6" aria-hidden="true" />
        </button>
        <h1 className="text-lg font-semibold tracking-[-0.02em] text-text-primary">
          {t("pageTitle")}
        </h1>
      </div>
    </header>
  );
}
