"use client";

import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import type { ProfileSnapshot } from "@/features/profile/types/user-profile";

type ProfileHeroProps = {
  profile: ProfileSnapshot;
  hasMysticPlus: boolean;
};

function resolveDisplayName(
  profile: ProfileSnapshot,
  fallback: string,
): string {
  const trimmed = profile.displayName?.trim();
  if (trimmed) {
    return trimmed;
  }

  const email = profile.email?.trim();
  if (email) {
    const prefix = email.split("@")[0]?.trim();
    if (prefix) {
      return prefix;
    }
  }

  return fallback;
}

export function ProfileHero({ profile, hasMysticPlus }: ProfileHeroProps) {
  const t = useTranslations("profile.screen.hero");
  const displayName = resolveDisplayName(profile, t("fallbackName"));
  const email = profile.email?.trim();

  return (
    <section className="mystic-profile-hero">
      <div className="flex items-start gap-4">
        <div className="mystic-profile-hero-avatar" aria-hidden="true">
          <Sparkles className="size-[30px] text-accent-gold/90" />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-xl font-semibold tracking-[-0.02em] text-text-primary">
            {displayName}
          </p>
          {email ? (
            <p className="text-[0.8125rem] leading-snug text-text-muted">{email}</p>
          ) : null}
          <p className="pt-1 text-sm leading-relaxed text-text-muted">{t("subtitle")}</p>
          <Link
            href="/plus"
            prefetch={false}
            className="mystic-profile-hero-chip touch-manipulation"
          >
            {hasMysticPlus ? t("plusActiveChip") : t("unlockPlus")}
          </Link>
        </div>
      </div>
    </section>
  );
}
