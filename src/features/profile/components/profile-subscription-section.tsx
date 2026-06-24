"use client";

import { useTranslations } from "next-intl";

import { MysticPlusPayPalButtons } from "@/features/payments/components/MysticPlusPayPalButtons";
import { PaymentStatusNotice } from "@/features/payments/components/PaymentStatusNotice";
import { ProfileSectionCard } from "@/features/profile/components/profile-section-card";
import {
  hasPremiumEntitlement,
  resolvePremiumDisplayStatus,
} from "@/features/premium/utils/resolve-premium-display-status";
import type { MysticPlusEntitlement } from "@/features/payments/types/payment";
import { isMysticPlusPending } from "@/features/payments/utils/entitlement-access";
import type { ProfileSnapshot } from "@/features/profile/types/user-profile";
import type { SupportedLocale } from "@/config/app-config";

type ProfileSubscriptionSectionProps = {
  locale: SupportedLocale;
  profile: ProfileSnapshot;
  mysticPlus: MysticPlusEntitlement | null;
  paypalConfigured: boolean;
};

export function ProfileSubscriptionSection({
  locale,
  profile,
  mysticPlus,
  paypalConfigured,
}: ProfileSubscriptionSectionProps) {
  const t = useTranslations("premium");
  const tPayments = useTranslations("payments");
  const status = resolvePremiumDisplayStatus(profile, mysticPlus);
  const hasAccess = hasPremiumEntitlement(profile, mysticPlus);
  const pending = isMysticPlusPending(mysticPlus);

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

      {pending ? <PaymentStatusNotice status="pending" /> : null}

      {!hasAccess ? (
        paypalConfigured ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm leading-relaxed text-text-muted">
              {tPayments("securePayPalNote")}
            </p>
            <MysticPlusPayPalButtons locale={locale} />
            <p className="text-xs leading-relaxed text-text-subtle">
              {tPayments("cancelSubscriptionNote")}
            </p>
          </div>
        ) : (
          <p className="mt-4 text-sm leading-relaxed text-text-muted">
            {tPayments("setupUnavailable")}
          </p>
        )
      ) : null}
    </ProfileSectionCard>
  );
}
