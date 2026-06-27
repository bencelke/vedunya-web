"use client";

import { useState } from "react";
import {
  AtSign,
  Apple,
  Bell,
  FileText,
  Globe,
  HelpCircle,
  Info,
  LogOut,
  Pencil,
  RefreshCw,
  Shield,
  Sparkles,
  Star,
  Stars,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Container } from "@/components/ui/container";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  sendPasswordReset,
  userHasPasswordProvider,
} from "@/features/auth/services/auth-service";
import { NotificationSettingsCard } from "@/features/notifications/components/notification-settings-card";
import { PwaInstallSection } from "@/features/pwa/components/pwa-install-section";
import { disablePushOnLogout } from "@/features/notifications/utils/push-subscription";
import { ProfileActionRow } from "@/features/profile/components/profile-action-row";
import { ProfileCosmicPanel } from "@/features/profile/components/profile-cosmic-panel";
import { ProfileEditPanel } from "@/features/profile/components/profile-edit-panel";
import { ProfileHero } from "@/features/profile/components/profile-hero";
import { ProfilePageHeader } from "@/features/profile/components/profile-page-header";
import { ProfileSectionLabel } from "@/features/profile/components/profile-section-label";
import {
  formatDateOfBirth,
  profileUpdateSchema,
} from "@/features/profile/schemas/onboarding-schema";
import { updateUserProfileFields } from "@/features/profile/services/profile-bootstrap-service";
import type { ProfileSnapshot } from "@/features/profile/types/user-profile";
import type { PushStatusSummary } from "@/features/notifications/types/push";
import { hasPremiumEntitlement } from "@/features/premium/utils/resolve-premium-display-status";
import type { MysticPlusEntitlement } from "@/features/payments/types/payment";
import { ShopifyPaymentStatusNotice } from "@/features/shopify/components/ShopifyPaymentStatusNotice";
import { TRUST_ROUTES } from "@/features/trust/constants";
import { useRouter } from "@/i18n/navigation";
import type { SupportedLocale } from "@/config/app-config";

type ProfileContentProps = {
  locale: SupportedLocale;
  profile: ProfileSnapshot;
  pushStatus: PushStatusSummary;
  hasActiveUniverseRequest: boolean;
  mysticPlus: MysticPlusEntitlement | null;
  checkoutPending?: boolean;
};

function hasProvider(providers: string[], providerId: string): boolean {
  return providers.includes(providerId);
}

export function ProfileContent({
  locale,
  profile,
  pushStatus,
  hasActiveUniverseRequest,
  mysticPlus,
  checkoutPending = false,
}: ProfileContentProps) {
  const t = useTranslations("profile");
  const tScreen = useTranslations("profile.screen");
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

  const providers =
    profile.authProviders.length > 0
      ? profile.authProviders
      : user
        ? user.providerData.map((item) => item.providerId)
        : [];

  const hasMysticPlus = hasPremiumEntitlement(profile, mysticPlus);
  const googleConnected = hasProvider(providers, "google.com");
  const appleConnected = hasProvider(providers, "apple.com");

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
    <Container narrow className="mystic-profile-page pb-6 pt-2">
      <ProfilePageHeader />
      <ProfileHero profile={profile} hasMysticPlus={hasMysticPlus} />

      {message ? (
        <p className="mt-4 rounded-[var(--radius-card)] border border-border-subtle bg-surface-primary/80 px-4 py-3 text-sm text-text-muted">
          {message}
        </p>
      ) : null}

      {checkoutPending ? (
        <div className="mt-4">
          <ShopifyPaymentStatusNotice status="pending" />
        </div>
      ) : null}

      <div className="mt-8 space-y-8">
        <section aria-label={tScreen("sections.account")}>
          <ProfileSectionLabel title={tScreen("sections.account")} />
          <ProfileCosmicPanel>
            {profile.email ? (
              <ProfileActionRow
                icon={AtSign}
                label={profile.email}
                showChevron={false}
                disabled
              />
            ) : null}
            <ProfileActionRow
              icon={Pencil}
              label={tScreen("rows.editProfile")}
              subtitle={tScreen("rows.editProfileSubtitle")}
              onClick={() => {
                setEditProfileOpen((open) => !open);
                setLanguageOpen(false);
              }}
            />
            <ProfileActionRow
              icon={Apple}
              label={tScreen("rows.apple")}
              subtitle={
                appleConnected
                  ? tScreen("rows.providerConnected")
                  : tScreen("rows.providerComingSoon")
              }
              disabled={!appleConnected}
              showChevron={false}
            />
            <ProfileActionRow
              icon={Globe}
              label={tScreen("rows.google")}
              subtitle={
                googleConnected
                  ? tScreen("rows.providerConnected")
                  : tScreen("rows.providerComingSoon")
              }
              disabled={!googleConnected}
              showChevron={false}
            />
            <ProfileActionRow
              icon={RefreshCw}
              label={tScreen("rows.restorePurchases")}
              subtitle={tScreen("rows.restoreComingSoon")}
              disabled
              showChevron={false}
            />
            <ProfileActionRow
              icon={LogOut}
              label={loggingOut ? t("logout.submitting") : tScreen("rows.logout")}
              isDestructive
              showChevron={false}
              disabled={loggingOut}
              onClick={() => void handleLogout()}
            />
          </ProfileCosmicPanel>
          {editProfileOpen ? (
            <ProfileEditPanel
              profile={profile}
              routeLocale={locale}
              onSavePersonalDetails={handlePersonalDetailsSave}
              onSaveLanguage={handleLanguageSave}
            />
          ) : null}
          {user && userHasPasswordProvider(user) ? (
            <button
              type="button"
              onClick={() => void handlePasswordReset()}
              className="mt-3 text-sm text-text-muted underline-offset-4 hover:text-text-primary hover:underline"
            >
              {t("account.resetPassword")}
            </button>
          ) : null}
        </section>

        <section aria-label={tScreen("sections.mysticPlus")}>
          <ProfileSectionLabel title={tScreen("sections.mysticPlus")} />
          <p className="mb-3 text-sm leading-relaxed text-text-muted">
            {tScreen("mysticPlus.description")}
          </p>
          <ProfileCosmicPanel>
            <ProfileActionRow
              icon={Sparkles}
              label={tScreen("rows.unlockMysticPlus")}
              subtitle={tScreen("rows.unlockMysticPlusSubtitle")}
              href="/plus"
            />
            <ProfileActionRow
              icon={Star}
              label={tScreen("rows.subscription")}
              subtitle={
                hasMysticPlus
                  ? tScreen("rows.subscriptionActive")
                  : tScreen("rows.subscriptionInactive")
              }
              href="/plus"
            />
          </ProfileCosmicPanel>
        </section>

        <section aria-label={tScreen("sections.preferences")}>
          <ProfileSectionLabel title={tScreen("sections.preferences")} />
          <ProfileCosmicPanel>
            <ProfileActionRow
              icon={Stars}
              label={tScreen("rows.universeRequest")}
              subtitle={tScreen("rows.universeRequestSubtitle")}
              href="/today"
            />
            <ProfileActionRow
              icon={Bell}
              label={tScreen("rows.notifications")}
              subtitle={tScreen("rows.notificationsSubtitle")}
              onClick={() => setNotificationsOpen((open) => !open)}
            />
            <ProfileActionRow
              icon={Globe}
              label={tScreen("rows.language")}
              subtitle={tScreen("rows.languageSubtitle")}
              onClick={() => {
                setLanguageOpen((open) => !open);
                setEditProfileOpen(false);
              }}
            />
          </ProfileCosmicPanel>
          {notificationsOpen ? (
            <div className="space-y-4 pt-4" id="profile-notifications">
              <PwaInstallSection />
              <NotificationSettingsCard
                locale={locale}
                initialStatus={pushStatus}
                hasActiveUniverseRequest={hasActiveUniverseRequest}
              />
            </div>
          ) : null}
          {languageOpen ? (
            <div className="pt-4">
              <ProfileEditPanel
                profile={profile}
                routeLocale={locale}
                onSavePersonalDetails={handlePersonalDetailsSave}
                onSaveLanguage={handleLanguageSave}
              />
            </div>
          ) : null}
        </section>

        <section aria-label={tScreen("sections.appLegal")}>
          <ProfileSectionLabel title={tScreen("sections.appLegal")} />
          <ProfileCosmicPanel>
            <ProfileActionRow
              icon={Info}
              label={tScreen("rows.about")}
              subtitle={tScreen("rows.aboutSubtitle")}
              href={TRUST_ROUTES.about}
            />
            <ProfileActionRow
              icon={Shield}
              label={tScreen("rows.privacy")}
              subtitle={tScreen("rows.privacySubtitle")}
              href={TRUST_ROUTES.privacy}
            />
            <ProfileActionRow
              icon={FileText}
              label={tScreen("rows.terms")}
              subtitle={tScreen("rows.termsSubtitle")}
              href={TRUST_ROUTES.terms}
            />
            <ProfileActionRow
              icon={HelpCircle}
              label={tScreen("rows.support")}
              subtitle={tScreen("rows.supportSubtitle")}
              href={TRUST_ROUTES.support}
            />
          </ProfileCosmicPanel>
        </section>
      </div>
    </Container>
  );
}
