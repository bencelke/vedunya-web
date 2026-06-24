"use client";

import { useTranslations } from "next-intl";

import { ProfileSectionCard } from "@/features/profile/components/profile-section-card";
import {
  hasPremiumEntitlement,
  resolvePremiumDisplayStatus,
} from "@/features/premium/utils/resolve-premium-display-status";
import type { MysticPlusEntitlement } from "@/features/payments/types/payment";
import type { ProfileSnapshot } from "@/features/profile/types/user-profile";

type ProfileSubscriptionSectionProps = {
  profile: ProfileSnapshot;
  mysticPlus: MysticPlusEntitlement | null;
};

export function ProfileSubscriptionSection({
  profile,
  mysticPlus,
}: ProfileSubscriptionSectionProps) {
  const t = useTranslations("premium");
  const status = resolvePremiumDisplayStatus(profile, mysticPlus);
  const hasAccess = hasPremiumEntitlement(profile, mysticPlus);

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
    </ProfileSectionCard>
  );
}
