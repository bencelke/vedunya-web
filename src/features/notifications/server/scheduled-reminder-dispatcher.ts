import "server-only";

import {
  buildNotificationDeliveryDocId,
  hasNotificationDelivery,
  listEnabledNotificationPreferences,
  readEnabledPushSubscriptions,
  writeNotificationDelivery,
} from "@/features/notifications/repositories/push-repository";
import {
  getDueReminderTypes,
  getLocalTimeContext,
  isSchedulableReminderType,
  type SchedulableReminderType,
} from "@/features/notifications/server/reminder-due";
import { buildReminderNotificationPayload } from "@/features/notifications/server/send-web-push-notification";
import { sendWebPushToUser } from "@/features/notifications/server/send-web-push";
import { isWebPushConfigured } from "@/features/notifications/server/web-push-config";
import { readUniverseRequest } from "@/features/universe-request/server/universe-request-repository";

export type ScheduledReminderDispatchSummary = {
  ok: boolean;
  checkedUsers: number;
  sent: number;
  skipped: number;
  failed: number;
  expiredRemoved: number;
  dryRun: boolean;
  error?: string;
};

export type DispatchScheduledRemindersInput = {
  dryRun?: boolean;
  typeFilter?: string | null;
  now?: Date;
};

function emptySummary(dryRun: boolean): ScheduledReminderDispatchSummary {
  return {
    ok: true,
    checkedUsers: 0,
    sent: 0,
    skipped: 0,
    failed: 0,
    expiredRemoved: 0,
    dryRun,
  };
}

async function shouldSendUniverseRequestReminder(uid: string): Promise<boolean> {
  const request = await readUniverseRequest(uid);
  return request !== null;
}

export async function dispatchScheduledReminders(
  input: DispatchScheduledRemindersInput = {},
): Promise<ScheduledReminderDispatchSummary> {
  const dryRun = input.dryRun === true;
  const summary = emptySummary(dryRun);
  const now = input.now ?? new Date();
  const typeFilter =
    input.typeFilter && isSchedulableReminderType(input.typeFilter)
      ? input.typeFilter
      : null;

  if (!isWebPushConfigured()) {
    return {
      ...summary,
      ok: false,
      error: "web_push_not_configured",
    };
  }

  const users = await listEnabledNotificationPreferences();

  for (const { uid, preferences } of users) {
    summary.checkedUsers += 1;

    if (preferences.enabled !== true) {
      summary.skipped += 1;
      continue;
    }

    const dueTypes = getDueReminderTypes(preferences, now, typeFilter);
    if (dueTypes.length === 0) {
      summary.skipped += 1;
      continue;
    }

    const subscriptions = await readEnabledPushSubscriptions(uid);
    if (subscriptions.length === 0) {
      summary.skipped += dueTypes.length;
      continue;
    }

    const { localDate, timezone } = getLocalTimeContext(preferences.timezone, now);
    const locale = preferences.locale === "ru" ? "ru" : "en";

    for (const reminderType of dueTypes) {
      if (reminderType === "universeRequest") {
        const hasActiveRequest = await shouldSendUniverseRequestReminder(uid);
        if (!hasActiveRequest) {
          summary.skipped += 1;
          continue;
        }
      }

      const deliveryDocId = buildNotificationDeliveryDocId(localDate, reminderType);
      const alreadySent = await hasNotificationDelivery(uid, deliveryDocId);
      if (alreadySent) {
        summary.skipped += 1;
        continue;
      }

      if (dryRun) {
        summary.sent += 1;
        continue;
      }

      const payload = buildReminderNotificationPayload({
        locale,
        reminderType,
        localDate,
      });

      try {
        const result = await sendWebPushToUser({ uid, payload });
        summary.expiredRemoved += result.removed;

        if (result.sent > 0) {
          await writeNotificationDelivery({
            uid,
            deliveryDocId,
            reminderType,
            localDate,
            timezone,
          });
          summary.sent += 1;
        } else {
          summary.failed += 1;
        }
      } catch {
        summary.failed += 1;
      }
    }
  }

  return summary;
}

export function countDueRemindersForUser(input: {
  preferences: Parameters<typeof getDueReminderTypes>[0];
  now?: Date;
  typeFilter?: string | null;
}): SchedulableReminderType[] {
  return getDueReminderTypes(input.preferences, input.now, input.typeFilter);
}
