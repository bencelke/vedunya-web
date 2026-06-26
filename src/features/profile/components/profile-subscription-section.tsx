"use client";

import { useTranslations } from "next-intl";

import { MysticPlusPaywallLink } from "@/features/premium/components/mystic-plus-paywall-link";
import { MYSTIC_PLUS_PRICING } from "@/features/premium/mystic-plus-pricing";
import { ProfileSectionCard } from "@/features/profile/components/profile-section-card";
import {
  hasPremiumEntitlement,
  resolvePremiumActiveNoteKey,
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
  const t = useTranslations("profile.subscription");
  const tPaywall = useTranslations("premium.paywall");
  const hasAccess = hasPremiumEntitlement(profile, mysticPlus);
  const displayStatus = resolvePremiumDisplayStatus(profile, mysticPlus);

  const statusLabel = hasAccess ? t("statusActive") : t("statusFree");
  const activeNoteKey = resolvePremiumActiveNoteKey(displayStatus);

  return (
    <ProfileSectionCard
      label={t("label")}
      title={t("title")}
      description={t("description")}
      className="border-accent-gold/15"
    >
      {!hasAccess ? (
        <p className="text-xs text-text-subtle">
          {t("pricingFromMonthly", { price: MYSTIC_PLUS_PRICING.monthly.label })}
        </p>
      ) : null}
      <p className={`text-sm font-medium text-text-primary ${hasAccess ? "" : "mt-3"}`}>
        {statusLabel}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-text-muted">
        {hasAccess ? tPaywall(activeNoteKey) : t("webNote")}
      </p>
      <div className="mt-4">
        <MysticPlusPaywallLink label={hasAccess ? tPaywall("ctaActive") : t("openPlus")} />
      </div>
    </ProfileSectionCard>
  );
}
