import "server-only";

import type { SupportedLocale } from "@/config/app-config";
import { getNotificationCopy } from "@/features/notifications/content/notification-copy";
import type { PushNotificationPayload } from "@/features/notifications/types/push";
import type { SchedulableReminderType } from "@/features/notifications/server/reminder-due";

type BuildReminderPayloadInput = {
  locale: SupportedLocale;
  reminderType: SchedulableReminderType;
  localDate: string;
};

export function buildReminderNotificationUrl(
  locale: SupportedLocale,
  reminderType: SchedulableReminderType,
): string {
  if (reminderType === "course") {
    return `/${locale}/courses`;
  }

  if (reminderType === "universeRequest") {
    return `/${locale}/today`;
  }

  return `/${locale}/today`;
}

export function buildReminderNotificationPayload(
  input: BuildReminderPayloadInput,
): PushNotificationPayload {
  const copy = getNotificationCopy(input.locale, input.reminderType);

  return {
    title: copy.title,
    body: copy.body,
    url: buildReminderNotificationUrl(input.locale, input.reminderType),
    tag: `mystic-${input.reminderType}-${input.localDate.replace(/-/g, "")}`,
    lang: input.locale,
    reminderType: input.reminderType,
  };
}
