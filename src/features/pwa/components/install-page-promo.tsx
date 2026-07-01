"use client";

import { Smartphone } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

export function InstallPagePromo() {
  const t = useTranslations("auth.installPromo");

  return (
    <div className="rounded-[var(--radius-card)] border border-auth-border/80 bg-auth-surface/40 px-4 py-4 text-left">
      <div className="flex items-start gap-3">
        <Smartphone
          className="mt-0.5 size-4 shrink-0 text-auth-accent-gold/85"
          aria-hidden="true"
        />
        <div className="min-w-0 space-y-2">
          <p className="text-sm font-medium text-auth-text-primary">{t("title")}</p>
          <p className="text-xs leading-relaxed text-auth-text-muted">{t("body")}</p>
          <Link
            href="/install"
            className="inline-flex text-sm font-medium text-auth-accent-gold underline-offset-4 hover:underline"
          >
            {t("link")}
          </Link>
        </div>
      </div>
    </div>
  );
}
