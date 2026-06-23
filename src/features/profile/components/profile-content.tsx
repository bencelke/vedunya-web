"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardLabel } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  sendPasswordReset,
  userHasPasswordProvider,
} from "@/features/auth/services/auth-service";
import { disablePushOnLogout } from "@/features/notifications/utils/push-subscription";
import {
  formatDateOfBirth,
  profileUpdateSchema,
} from "@/features/profile/schemas/onboarding-schema";
import { NotificationSettingsCard } from "@/features/notifications/components/notification-settings-card";
import type { PushStatusSummary } from "@/features/notifications/types/push";
import { PwaInstallSection } from "@/features/pwa/components/pwa-install-section";
import { formatAuthProviderLabel } from "@/features/profile/utils/format-auth-provider";
import { updateUserProfileFields } from "@/features/profile/services/profile-bootstrap-service";
import type { ProfileSnapshot } from "@/features/profile/types/user-profile";
import { Link, useRouter } from "@/i18n/navigation";
import type { SupportedLocale } from "@/config/app-config";

type ProfileContentProps = {
  locale: SupportedLocale;
  profile: ProfileSnapshot;
  pushStatus: PushStatusSummary;
};

export function ProfileContent({ locale, profile, pushStatus }: ProfileContentProps) {
  const t = useTranslations("auth.profile");
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile.displayName ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(
    profile.dateOfBirth ? formatDateOfBirth(profile.dateOfBirth) : "",
  );
  const [language, setLanguage] = useState<SupportedLocale>(
    profile.language ?? locale,
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSave() {
    if (!user) {
      return;
    }

    const parsed = profileUpdateSchema.safeParse({
      displayName,
      dateOfBirth,
      language,
    });

    if (!parsed.success) {
      setMessage(t("validationError"));
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      await updateUserProfileFields(user, parsed.data);
      setEditing(false);
      setMessage(t("saved"));
      router.refresh();
    } catch {
      setMessage(t("saveError"));
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordReset() {
    if (!profile.email) {
      return;
    }

    try {
      await sendPasswordReset(profile.email);
      setMessage(t("resetSent"));
    } catch {
      setMessage(t("saveError"));
    }
  }

  async function handleLogout() {
    await disablePushOnLogout();
    await signOut();
    router.replace("/");
    router.refresh();
  }

  const providers =
    profile.authProviders.length > 0
      ? profile.authProviders
      : user
        ? user.providerData.map((item) => item.providerId)
        : [];

  const accountStatus = profile.profileComplete ? t("statusComplete") : t("statusIncomplete");

  return (
    <div className="mystic-reading-column space-y-6 px-[var(--spacing-page)] py-6">
      <header className="space-y-2">
        <CardLabel>{t("eyebrow")}</CardLabel>
        <h1 className="text-[1.75rem] font-medium leading-tight text-text-primary">
          {profile.displayName ?? t("heading")}
        </h1>
        <p className="text-sm leading-relaxed text-text-muted">{t("description")}</p>
      </header>

      {message ? (
        <p className="rounded-[var(--radius-card)] border border-border-subtle bg-surface-primary/80 px-4 py-3 text-sm text-text-muted backdrop-blur-sm">
          {message}
        </p>
      ) : null}

      <Card elevated className="border-accent-gold/15 bg-surface-elevated/90 backdrop-blur-sm">
        <CardLabel>{t("accountStatus")}</CardLabel>
        <p className="mt-2 text-sm text-text-primary">{accountStatus}</p>
        <p className="mt-3 text-xs leading-relaxed text-text-subtle">
          {t("subscriptionPlaceholder")}
        </p>
      </Card>

      <PwaInstallSection />

      <NotificationSettingsCard locale={locale} initialStatus={pushStatus} />

      <Card elevated className="bg-surface-elevated/90 backdrop-blur-sm">
        {!editing ? (
          <div className="space-y-4">
            <ProfileRow label={t("name")} value={profile.displayName ?? t("notSet")} />
            <ProfileRow label={t("email")} value={profile.email ?? t("notSet")} />
            <ProfileRow
              label={t("birthDate")}
              value={
                profile.dateOfBirth
                  ? formatDateOfBirth(profile.dateOfBirth)
                  : t("notSet")
              }
            />
            <ProfileRow
              label={t("language")}
              value={profile.language === "ru" ? t("russian") : t("english")}
            />
            <ProfileRow
              label={t("providers")}
              value={
                providers.length > 0
                  ? providers.map(formatAuthProviderLabel).join(", ")
                  : t("notSet")
              }
            />
          </div>
        ) : (
          <div className="space-y-4">
            <Field
              id="profile-name"
              label={t("name")}
              value={displayName}
              onChange={setDisplayName}
            />
            <Field
              id="profile-dob"
              label={t("birthDate")}
              type="date"
              value={dateOfBirth}
              onChange={setDateOfBirth}
            />
            <div className="grid grid-cols-2 gap-3">
              {(["en", "ru"] as SupportedLocale[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setLanguage(option)}
                  className={`min-h-11 rounded-[var(--radius-card)] border px-3 text-sm ${
                    language === option
                      ? "border-accent-gold bg-accent-gold-muted text-accent-gold"
                      : "border-border-subtle text-text-muted"
                  }`}
                >
                  {option === "en" ? t("english") : t("russian")}
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      <div className="flex flex-col gap-3">
        {editing ? (
          <>
            <Button className="w-full" disabled={saving} onClick={handleSave}>
              {saving ? t("saving") : t("save")}
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setEditing(false)}
            >
              {t("cancel")}
            </Button>
          </>
        ) : (
          <Button variant="secondary" className="w-full" onClick={() => setEditing(true)}>
            {t("edit")}
          </Button>
        )}

        {user && userHasPasswordProvider(user) ? (
          <Button variant="ghost" className="w-full" onClick={handlePasswordReset}>
            {t("resetPassword")}
          </Button>
        ) : null}

        <Button variant="ghost" className="w-full" onClick={handleLogout}>
          {t("logout")}
        </Button>

        <Link
          href="/today"
          className="text-center text-sm text-text-muted underline-offset-4 hover:underline"
        >
          {t("backToToday")}
        </Link>
      </div>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 border-b border-border-subtle/60 pb-4 last:border-b-0 last:pb-0">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-text-subtle">
        {label}
      </p>
      <p className="text-sm text-text-primary">{value}</p>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
