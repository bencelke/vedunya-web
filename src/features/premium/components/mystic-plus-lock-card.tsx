"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { Lock } from "lucide-react";

type MysticPlusLockCardProps = {
  /** Override body for context-specific surfaces (moon, rune). Defaults to shared lock copy. */
  body?: string;
  /** Show a one-line section label above the body. */
  sectionNote?: string;
};

export function MysticPlusLockCard({ body, sectionNote }: MysticPlusLockCardProps) {
  const t = useTranslations("premium");

  return (
    <section className="mystic-cosmic-card space-y-4 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent-gold/25 bg-accent-gold-muted/50 text-accent-gold">
          <Lock className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h3 className="text-base font-medium text-text-primary">{t("lockTitle")}</h3>
          {sectionNote ? (
            <p className="text-xs leading-relaxed text-text-subtle">{sectionNote}</p>
          ) : null}
          <p className="text-sm leading-relaxed text-text-muted">{body ?? t("lockBody")}</p>
        </div>
      </div>
      <div className="space-y-3">
        <button
          type="button"
          disabled
          className="inline-flex min-h-12 w-full cursor-not-allowed items-center justify-center rounded-[var(--radius-pill)] border border-border-subtle bg-surface-primary/60 px-5 text-sm font-medium text-text-subtle opacity-80"
        >
          {t("paymentComingLater")}
        </button>
        <p className="text-center text-xs text-text-subtle">
          <Link href="/profile" className="text-accent-gold underline-offset-2 hover:underline">
            {t("profileLink")}
          </Link>
        </p>
      </div>
    </section>
  );
}
