"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  sendPasswordReset,
  userHasPasswordProvider,
} from "@/features/auth/services/auth-service";
import { disablePushOnLogout } from "@/features/notifications/utils/push-subscription";
import { ProfileAccountSection } from "@/features/profile/components/profile-account-section";
import { ProfileCoursesSection } from "@/features/profile/components/profile-courses-section";
import { ProfileHeader } from "@/features/profile/components/profile-header";
import { ProfileLanguageSection } from "@/features/profile/components/profile-language-section";
import { ProfileLegalSection } from "@/features/profile/components/profile-legal-section";
import { ProfileLogoutSection } from "@/features/profile/components/profile-logout-section";
import { ProfilePersonalDetailsSection } from "@/features/profile/components/profile-personal-details-section";
import { ProfileRemindersSection } from "@/features/profile/components/profile-reminders-section";
import type { MysticPlusEntitlement } from "@/features/payments/types/payment";
import { ProfileSubscriptionSection } from "@/features/profile/components/profile-subscription-section";
import { ProfileSupportSection } from "@/features/profile/components/profile-support-section";
import { ProfileUniverseRequestSection } from "@/features/profile/components/profile-universe-request-section";
import { ShopifyPaymentStatusNotice } from "@/features/shopify/components/ShopifyPaymentStatusNotice";
import {
  formatDateOfBirth,
  profileUpdateSchema,
} from "@/features/profile/schemas/onboarding-schema";
import { updateUserProfileFields } from "@/features/profile/services/profile-bootstrap-service";
import type { ProfileSettingsSummary } from "@/features/profile/types/profile-settings-summary";
import type { ProfileSnapshot } from "@/features/profile/types/user-profile";
import type { PushStatusSummary } from "@/features/notifications/types/push";
import { useRouter } from "@/i18n/navigation";
import type { SupportedLocale } from "@/config/app-config";

type ProfileContentProps = {
  locale: SupportedLocale;
  profile: ProfileSnapshot;
  pushStatus: PushStatusSummary;
  hasActiveUniverseRequest: boolean;
  settingsSummary: ProfileSettingsSummary;
  mysticPlus: MysticPlusEntitlement | null;
  hasLivingTheRunesAccess: boolean;
  checkoutPending?: boolean;
};

export function ProfileContent({
  locale,
  profile,
  pushStatus,
  hasActiveUniverseRequest,
  settingsSummary,
  mysticPlus,
  hasLivingTheRunesAccess,
  checkoutPending = false,
}: ProfileContentProps) {
  const t = useTranslations("profile");
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const providers =
    profile.authProviders.length > 0
      ? profile.authProviders
      : user
        ? user.providerData.map((item) => item.providerId)
        : [];

  async function saveProfile(input: {
    displayName: string;
    dateOfBirth: string;
    language: SupportedLocale;
  }) {
    if (!user) {
      return;
    }

    const parsed = profileUpdateSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error("validation");
    }

    await updateUserProfileFields(user, parsed.data);
    setMessage(t("messageSaved"));
    router.refresh();
  }

  async function handlePersonalDetailsSave(input: {
    displayName: string;
    dateOfBirth: string;
  }) {
    await saveProfile({
      ...input,
      language: profile.language ?? locale,
    });
  }

  async function handleLanguageSave(language: SupportedLocale) {
    if (!profile.dateOfBirth || !profile.displayName) {
      setMessage(t("messageValidationError"));
      throw new Error("incomplete");
    }

    await saveProfile({
      displayName: profile.displayName ?? "",
      dateOfBirth: formatDateOfBirth(profile.dateOfBirth),
      language,
    });

    if (language !== locale) {
      router.replace("/profile", { locale: language });
    }
  }

  async function handlePasswordReset() {
    if (!profile.email) {
      return;
    }

    try {
      await sendPasswordReset(profile.email);
      setMessage(t("messageResetSent"));
    } catch {
      setMessage(t("messageSaveError"));
    }
  }

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);
    try {
      await disablePushOnLogout();
      await signOut();
      router.replace("/");
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <div className="mystic-reading-column space-y-6 px-[var(--spacing-page)] py-6">
      <ProfileHeader profile={profile} />

      {message ? (
        <p className="rounded-[var(--radius-card)] border border-border-subtle bg-surface-primary/80 px-4 py-3 text-sm text-text-muted backdrop-blur-sm">
          {message}
        </p>
      ) : null}

      {checkoutPending ? (
        <ShopifyPaymentStatusNotice status="pending" />
      ) : null}

      <ProfileAccountSection
        profile={profile}
        providers={providers}
        showResetPassword={Boolean(user && userHasPasswordProvider(user))}
        onResetPassword={() => void handlePasswordReset()}
      />

      <ProfilePersonalDetailsSection
        profile={profile}
        onSave={handlePersonalDetailsSave}
      />

      <ProfileLanguageSection
        profile={profile}
        routeLocale={locale}
        onSave={handleLanguageSave}
      />

      <ProfileUniverseRequestSection request={settingsSummary.universeRequest} />

      <ProfileRemindersSection
        locale={locale}
        pushStatus={pushStatus}
        hasActiveUniverseRequest={hasActiveUniverseRequest}
      />

      <ProfileSubscriptionSection profile={profile} mysticPlus={mysticPlus} />

      <ProfileCoursesSection
        course={settingsSummary.course}
        hasLivingTheRunesAccess={hasLivingTheRunesAccess}
      />

      <ProfileLegalSection />

      <ProfileSupportSection />

      <ProfileLogoutSection
        onLogout={() => void handleLogout()}
        loggingOut={loggingOut}
      />
    </div>
  );
}
