import "server-only";

import type { SupportedLocale } from "@/config/app-config";
import {
  readEnabledPushSubscriptions,
  readNotificationPreferences,
} from "@/features/notifications/repositories/push-repository";
import {
  getNotificationSchedulerStatus,
} from "@/features/notifications/server/scheduler-config";
import {
  getWebPushPublicKey,
  isWebPushConfigured,
} from "@/features/notifications/server/web-push-config";

import type { PushStatusSummary } from "@/features/notifications/types/push";

export async function getPushStatusSummary(
  uid: string,
  locale: SupportedLocale,
): Promise<PushStatusSummary> {
  const [preferences, subscriptions] = await Promise.all([
    readNotificationPreferences(uid, locale),
    readEnabledPushSubscriptions(uid),
  ]);

  const scheduler = getNotificationSchedulerStatus();

  return {
    configured: isWebPushConfigured(),
    publicKey: getWebPushPublicKey(),
    subscribed: subscriptions.length > 0,
    subscriptionCount: subscriptions.length,
    preferences,
    lastSuccessAt:
      subscriptions.find((item) => item.lastSuccessAt)?.lastSuccessAt ?? null,
    lastFailureAt:
      subscriptions.find((item) => item.lastFailureAt)?.lastFailureAt ?? null,
    schedulerConfigured: scheduler.schedulerConfigured,
    schedulerMode: scheduler.schedulerMode,
    schedulerCoverageAdequate: scheduler.schedulerCoverageAdequate,
  };
}
