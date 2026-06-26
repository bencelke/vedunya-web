"use client";

import { useTranslations } from "next-intl";

import { MysticPlusPaywallLink } from "@/features/premium/components/mystic-plus-paywall-link";
import { Lock } from "lucide-react";

type MysticPlusLockCardProps = {
  /** Override body for context-specific surfaces (moon, rune). Defaults to shared lock copy. */
  body?: string;
  /** Show a one-line section label above the body. */
  sectionNote?: string;
};

export function MysticPlusLockCard({ body, sectionNote }: MysticPlusLockCardProps) {
  const t = useTranslations("premium");
  const tPaywall = useTranslations("premium.paywall");

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
        <MysticPlusPaywallLink label={tPaywall("unlockFullReading")} />
        <p className="text-center text-xs text-text-subtle">
          <MysticPlusPaywallLink variant="text" label={tPaywall("openInPlus")} />
        </p>
      </div>
    </section>
  );
}
