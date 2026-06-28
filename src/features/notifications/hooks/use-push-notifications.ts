"use client";

import { useCallback, useState } from "react";

import type { SupportedLocale } from "@/config/app-config";
import type {
  NotificationPreferencesRecord,
  PushStatusResponse,
  PushStatusSummary,
} from "@/features/notifications/types/push";
import { isPwaEnabled } from "@/config/pwa";
import {
  disablePushOnDevice,
  getCurrentPushSubscription,
  postPushSubscribe,
  requestNotificationPermissionFromUserAction,
  serializePushSubscription,
  subscribeToPush,
} from "@/features/notifications/utils/push-subscription";
import {
  getNotificationPermission,
  isPushEnvironmentReady,
  requiresInstalledPwaForPush,
  resolveClientTimezone,
} from "@/features/notifications/utils/push-support";

type UsePushNotificationsResult = {
  status: PushStatusResponse;
  preferences: NotificationPreferencesRecord;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  error: string | null;
  busy: boolean;
  enableReminders: () => Promise<void>;
  disableReminders: () => Promise<void>;
  savePreferences: (
    preferences: NotificationPreferencesRecord,
  ) => Promise<void>;
  sendTestNotification: () => Promise<void>;
  refresh: () => Promise<void>;
};

function buildClientStatus(
  serverStatus: PushStatusSummary,
  permission: NotificationPermission | "unsupported",
): PushStatusResponse {
  return {
    configured: serverStatus.configured,
    subscribed: serverStatus.subscribed,
    permission,
    preferences: serverStatus.preferences,
    requiresInstalledPwa: requiresInstalledPwaForPush(),
    pushSupported: isPushEnvironmentReady(),
    schedulerConfigured: serverStatus.schedulerConfigured,
    schedulerMode: serverStatus.schedulerMode,
    schedulerCoverageAdequate: serverStatus.schedulerCoverageAdequate,
  };
}

export function usePushNotifications(
  locale: SupportedLocale,
  initialStatus: PushStatusSummary,
): UsePushNotificationsResult {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState(initialStatus);
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >(() => getNotificationPermission());

  const clientStatus = buildClientStatus(serverStatus, permission);

  const refresh = useCallback(async () => {
    setError(null);

    try {
      const response = await fetch(`/api/push/status?locale=${locale}`);
      if (!response.ok) {
        throw new Error("status_failed");
      }

      const data = (await response.json()) as PushStatusSummary;
      setServerStatus(data);
      setPermission(getNotificationPermission());
    } catch {
      setError("status_failed");
    }
  }, [locale]);

  const enableReminders = useCallback(async () => {
    if (!isPwaEnabled) {
      setError("dev_unavailable");
      return;
    }

    if (!isPushEnvironmentReady()) {
      setError("install_required");
      return;
    }

    if (!serverStatus.configured || !serverStatus.publicKey) {
      setError("not_configured");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const nextPermission = await requestNotificationPermissionFromUserAction();
      setPermission(nextPermission);

      if (nextPermission !== "granted") {
        setError(nextPermission === "denied" ? "permission_denied" : "permission_blocked");
        return;
      }

      const timezone = resolveClientTimezone();
      const subscription = await subscribeToPush({
        publicKey: serverStatus.publicKey,
        locale,
        timezone,
      });

      const payload = serializePushSubscription({
        subscription,
        locale,
        timezone,
      });

      const subscribeResponse = await postPushSubscribe(payload);
      if (!subscribeResponse.ok) {
        throw new Error("subscribe_failed");
      }

      const preferences: NotificationPreferencesRecord = {
        ...serverStatus.preferences,
        enabled: true,
        locale,
        timezone,
        updatedAt: new Date().toISOString(),
      };

      const preferencesResponse = await fetch("/api/push/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (!preferencesResponse.ok) {
        throw new Error("preferences_failed");
      }

      await refresh();
    } catch {
      setError("enable_failed");
    } finally {
      setBusy(false);
    }
  }, [locale, refresh, serverStatus]);

  const disableReminders = useCallback(async () => {
    setBusy(true);
    setError(null);

    try {
      await disablePushOnDevice();

      const preferences: NotificationPreferencesRecord = {
        ...serverStatus.preferences,
        enabled: false,
        locale,
        timezone: resolveClientTimezone(),
        updatedAt: new Date().toISOString(),
      };

      await fetch("/api/push/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      await refresh();
    } catch {
      setError("disable_failed");
    } finally {
      setBusy(false);
    }
  }, [locale, refresh, serverStatus]);

  const savePreferences = useCallback(
    async (preferences: NotificationPreferencesRecord) => {
      setBusy(true);
      setError(null);

      try {
        const response = await fetch("/api/push/preferences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...preferences,
            locale,
            timezone: preferences.timezone || resolveClientTimezone(),
            updatedAt: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          throw new Error("preferences_failed");
        }

        await refresh();
      } catch {
        setError("preferences_failed");
      } finally {
        setBusy(false);
      }
    },
    [locale, refresh],
  );

  const sendTestNotification = useCallback(async () => {
    setBusy(true);
    setError(null);

    try {
      const subscription = await getCurrentPushSubscription();
      if (!subscription) {
        setError("no_subscription");
        return;
      }

      const response = await fetch("/api/push/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          locale,
        }),
      });

      if (!response.ok) {
        throw new Error("test_failed");
      }

      await refresh();
    } catch {
      setError("test_failed");
    } finally {
      setBusy(false);
    }
  }, [locale, refresh]);

  return {
    status: clientStatus,
    preferences: clientStatus.preferences,
    lastSuccessAt: serverStatus.lastSuccessAt,
    lastFailureAt: serverStatus.lastFailureAt,
    error,
    busy,
    enableReminders,
    disableReminders,
    savePreferences,
    sendTestNotification,
    refresh,
  };
}
