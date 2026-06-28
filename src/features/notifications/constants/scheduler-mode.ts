export type NotificationSchedulerMode = "unknown" | "daily" | "hourly" | "external";

const SCHEDULER_MODES = new Set<NotificationSchedulerMode>([
  "unknown",
  "daily",
  "hourly",
  "external",
]);

export function getNotificationSchedulerMode(): NotificationSchedulerMode {
  const raw = process.env.NOTIFICATION_SCHEDULER_MODE?.trim().toLowerCase();
  if (raw && SCHEDULER_MODES.has(raw as NotificationSchedulerMode)) {
    return raw as NotificationSchedulerMode;
  }

  return "unknown";
}

/** Hourly or external cron can cover all local reminder windows. Daily/unknown cannot. */
export function isNotificationSchedulerCoverageAdequate(
  mode: NotificationSchedulerMode = getNotificationSchedulerMode(),
): boolean {
  return mode === "hourly" || mode === "external";
}

export function isNotificationSchedulerDeliveryLimited(
  mode: NotificationSchedulerMode = getNotificationSchedulerMode(),
): boolean {
  return !isNotificationSchedulerCoverageAdequate(mode);
}
