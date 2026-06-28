import "server-only";

import {
  getNotificationSchedulerMode,
  isNotificationSchedulerCoverageAdequate,
  type NotificationSchedulerMode,
} from "@/features/notifications/constants/scheduler-mode";
import { isScheduledRemindersAuthConfigured } from "@/features/notifications/server/cron-auth";

export type { NotificationSchedulerMode };
export {
  getNotificationSchedulerMode,
  isNotificationSchedulerCoverageAdequate,
  isNotificationSchedulerDeliveryLimited,
} from "@/features/notifications/constants/scheduler-mode";

export function isNotificationSchedulerConfigured(): boolean {
  return isScheduledRemindersAuthConfigured();
}

export function getNotificationSchedulerStatus(): {
  schedulerConfigured: boolean;
  schedulerMode: NotificationSchedulerMode;
  schedulerCoverageAdequate: boolean;
} {
  const schedulerMode = getNotificationSchedulerMode();
  return {
    schedulerConfigured: isNotificationSchedulerConfigured(),
    schedulerMode,
    schedulerCoverageAdequate: isNotificationSchedulerCoverageAdequate(schedulerMode),
  };
}
