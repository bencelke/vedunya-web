"use client";

import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Card, CardLabel } from "@/components/ui/card";
import type { SupportedLocale } from "@/config/app-config";
import { IosPushInstallRequirement } from "@/features/notifications/components/ios-push-install-requirement";
import { NotificationPermissionState } from "@/features/notifications/components/notification-permission-state";
import { ReminderPreferenceForm } from "@/features/notifications/components/reminder-preference-form";
import { TestNotificationButton } from "@/features/notifications/components/test-notification-button";
import { usePushNotifications } from "@/features/notifications/hooks/use-push-notifications";

import type { PushStatusSummary } from "@/features/notifications/types/push";

type NotificationSettingsCardProps = {
  locale: SupportedLocale;
  initialStatus: PushStatusSummary;
};

export function NotificationSettingsCard({
  locale,
  initialStatus,
}: NotificationSettingsCardProps) {
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

  const showIosRequirement = status.requiresInstalledPwa;
  const canEnable =
    !showIosRequirement &&
    status.pushSupported &&
    status.configured &&
    status.permission !== "denied";
  const canDisable = status.subscribed || preferences.enabled;
  const canEditPreferences = preferences.enabled && status.subscribed;
  const canTest =
    canEditPreferences && status.permission === "granted" && status.configured;

  return (
    <section className="space-y-3">
      <Card elevated className="bg-surface-elevated/90 backdrop-blur-sm">
        <CardLabel>{t("sectionLabel")}</CardLabel>
        <h2 className="mt-2 text-base font-medium text-text-primary">{t("title")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">{t("description")}</p>

        <div className="mt-4 space-y-3">
          <NotificationPermissionState
            permission={status.permission}
            pushSupported={status.pushSupported}
            configured={status.configured}
            subscribed={status.subscribed}
          />

          {showIosRequirement ? <IosPushInstallRequirement /> : null}

          {error ? (
            <p className="text-sm text-accent-gold">{resolveErrorMessage(t, error)}</p>
          ) : null}

          <div className="flex flex-col gap-3">
            {canEnable && !preferences.enabled ? (
              <Button
                type="button"
                className="w-full"
                disabled={busy}
                onClick={() => {
                  void enableReminders();
                }}
              >
                {busy ? t("enabling") : t("enableAction")}
              </Button>
            ) : null}

            {canDisable ? (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                disabled={busy}
                onClick={() => {
                  void disableReminders();
                }}
              >
                {busy ? t("disabling") : t("disableAction")}
              </Button>
            ) : null}
          </div>

          {status.permission === "denied" ? (
            <p className="text-xs leading-relaxed text-text-subtle">{t("deniedRecovery")}</p>
          ) : null}

          {lastSuccessAt || lastFailureAt ? (
            <div className="space-y-1 text-xs text-text-subtle">
              {lastSuccessAt ? <p>{t("lastSuccess", { time: formatStatusTime(lastSuccessAt, locale) })}</p> : null}
              {lastFailureAt ? <p>{t("lastFailure", { time: formatStatusTime(lastFailureAt, locale) })}</p> : null}
            </div>
          ) : null}
        </div>
      </Card>

      {canEditPreferences ? (
        <Card elevated className="bg-surface-elevated/90 backdrop-blur-sm">
          <CardLabel>{t("preferencesLabel")}</CardLabel>
          <div className="mt-3">
            <ReminderPreferenceForm
              key={preferences.updatedAt}
              preferences={preferences}
              disabled={busy}
              onSave={savePreferences}
            />
          </div>
        </Card>
      ) : null}

      {canTest ? (
        <Card elevated className="bg-surface-elevated/90 backdrop-blur-sm">
          <TestNotificationButton disabled={!canTest} busy={busy} onSend={sendTestNotification} />
        </Card>
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
