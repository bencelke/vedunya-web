"use client";

import { Bell } from "lucide-react";
import { useTranslations } from "next-intl";

import type { SupportedLocale } from "@/config/app-config";
import { InstallMysticCard } from "@/features/pwa/components/install-mystic-card";
import { Link } from "@/i18n/navigation";
import { NotificationPermissionState } from "@/features/notifications/components/notification-permission-state";
import { ReminderPreferenceForm } from "@/features/notifications/components/reminder-preference-form";
import { TestNotificationButton } from "@/features/notifications/components/test-notification-button";
import { usePushNotifications } from "@/features/notifications/hooks/use-push-notifications";
import type { PushStatusSummary } from "@/features/notifications/types/push";

type NotificationSettingsPanelProps = {
  locale: SupportedLocale;
  initialStatus: PushStatusSummary;
  hasActiveUniverseRequest: boolean;
};

export function NotificationSettingsPanel({
  locale,
  initialStatus,
  hasActiveUniverseRequest,
}: NotificationSettingsPanelProps) {
  const t = useTranslations("notifications");
  const {
    status,
    preferences,
    lastSuccessAt,
    lastFailureAt,
    error,
    busy,
    enableReminders,
    disableReminders,
    savePreferences,
    sendTestNotification,
  } = usePushNotifications(locale, initialStatus);

  if (!status || !preferences) {
    return null;
  }

  const needsInstall = status.requiresInstalledPwa;
  const canEnable =
    !needsInstall &&
    status.pushSupported &&
    status.configured &&
    status.permission !== "denied";
  const canDisable = status.subscribed || preferences.enabled;
  const canEditPreferences = preferences.enabled && status.subscribed;
  const showSchedulerDeliveryNote =
    canEditPreferences &&
    (!status.schedulerConfigured || !status.schedulerCoverageAdequate);
  const canTest =
    canEditPreferences && status.permission === "granted" && status.configured;

  return (
    <section className="space-y-4" aria-label={t("panelTitle")}>
      <div className="flex items-center gap-2">
        <Bell className="size-5 text-accent-gold/85" aria-hidden="true" />
        <h3 className="text-base font-medium text-text-primary">{t("panelTitle")}</h3>
      </div>

      <InstallMysticCard alwaysShow />

      <p className="text-center">
        <Link
          href="/install"
          className="text-sm text-text-muted underline-offset-4 hover:text-text-primary hover:underline"
        >
          {t("installEducationLink")}
        </Link>
      </p>

      <div className="mystic-profile-panel space-y-4 p-4">
        <NotificationPermissionState
          permission={status.permission}
          pushSupported={status.pushSupported}
          configured={status.configured}
          subscribed={status.subscribed}
        />

        {needsInstall ? (
          <p className="text-sm leading-relaxed text-text-muted">{t("iosInstallBody")}</p>
        ) : null}

        {error ? (
          <p className="text-sm text-accent-gold">{resolveErrorMessage(t, error)}</p>
        ) : null}

        {canEnable && !preferences.enabled ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              void enableReminders();
            }}
            className="mystic-profile-hero-chip w-full touch-manipulation disabled:opacity-60"
          >
            {busy ? t("enabling") : t("enableAction")}
          </button>
        ) : null}

        {canDisable ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              void disableReminders();
            }}
            className="w-full rounded-[var(--radius-pill)] border border-border-subtle px-4 py-2.5 text-sm text-text-muted touch-manipulation disabled:opacity-60"
          >
            {busy ? t("disabling") : t("disableAction")}
          </button>
        ) : null}

        {status.permission === "denied" ? (
          <p className="text-xs leading-relaxed text-text-subtle">{t("deniedRecovery")}</p>
        ) : null}

        {lastSuccessAt || lastFailureAt ? (
          <div className="space-y-1 text-xs text-text-subtle">
            {lastSuccessAt ? (
              <p>{t("lastSuccess", { time: formatStatusTime(lastSuccessAt, locale) })}</p>
            ) : null}
            {lastFailureAt ? (
              <p>{t("lastFailure", { time: formatStatusTime(lastFailureAt, locale) })}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      {canEditPreferences ? (
        <div className="mystic-profile-panel p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-accent-gold/80">
            {t("preferencesLabel")}
          </p>
          <ReminderPreferenceForm
            key={preferences.updatedAt}
            preferences={preferences}
            hasActiveUniverseRequest={hasActiveUniverseRequest}
            disabled={busy}
            hideMidday
            showSchedulerDeliveryNote={showSchedulerDeliveryNote}
            onSave={savePreferences}
          />
        </div>
      ) : !canEditPreferences && !needsInstall && status.configured ? (
        <p className="text-sm leading-relaxed text-text-muted">{t("togglesLockedHint")}</p>
      ) : null}

      {canTest ? (
        <div className="mystic-profile-panel p-4">
          <TestNotificationButton
            disabled={!canTest}
            busy={busy}
            onSend={sendTestNotification}
          />
        </div>
      ) : null}
    </section>
  );
}

function formatStatusTime(value: string, locale: SupportedLocale): string {
  try {
    return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function resolveErrorMessage(
  t: ReturnType<typeof useTranslations<"notifications">>,
  error: string,
): string {
  const knownErrors = [
    "status_failed",
    "install_required",
    "dev_unavailable",
    "not_configured",
    "permission_denied",
    "permission_blocked",
    "subscribe_failed",
    "preferences_failed",
    "enable_failed",
    "disable_failed",
    "no_subscription",
    "test_failed",
  ] as const;

  if ((knownErrors as readonly string[]).includes(error)) {
    return t(`errors.${error}` as `errors.${(typeof knownErrors)[number]}`);
  }

  return t("errors.enable_failed");
}
