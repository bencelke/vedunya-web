"use client";

import { useTranslations } from "next-intl";

import { ProfileSectionCard } from "@/features/profile/components/profile-section-card";
import { WEB_MYSTIC_PLUS_PAYMENT_WIRED } from "@/features/premium/constants";
import {
  hasPremiumEntitlement,
  resolvePremiumDisplayStatus,
} from "@/features/premium/utils/resolve-premium-display-status";
import type { ProfileSnapshot } from "@/features/profile/types/user-profile";

type ProfileSubscriptionSectionProps = {
  profile: ProfileSnapshot;
};

export function ProfileSubscriptionSection({ profile }: ProfileSubscriptionSectionProps) {
  const t = useTranslations("premium");
  const status = resolvePremiumDisplayStatus(profile);
  const hasAccess = hasPremiumEntitlement(profile);

  const statusLabel = hasAccess ? t("statusActive") : t("statusFree");

  const activeNoteKey =
    status === "owner"
      ? "profileActiveOwner"
      : status === "devOverride"
        ? "profileActiveDevOverride"
        : "profileActivePremium";

  return (
    <ProfileSectionCard
      label={t("productName")}
      title={t("productName")}
      description={t("positioning")}
      className="border-accent-gold/15"
    >
      <p className="text-sm font-medium text-text-primary">{statusLabel}</p>
      <p className="mt-3 text-sm leading-relaxed text-text-muted">
        {hasAccess ? t(activeNoteKey) : t("webComingSoon")}
      </p>
      {!hasAccess && !WEB_MYSTIC_PLUS_PAYMENT_WIRED ? (
        <button
          type="button"
          disabled
          className="mt-4 inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center rounded-[var(--radius-pill)] border border-border-subtle bg-surface-primary/60 px-4 text-sm text-text-subtle opacity-80"
        >
          {t("paymentComingLater")}
        </button>
      ) : null}
    </ProfileSectionCard>
  );
}
