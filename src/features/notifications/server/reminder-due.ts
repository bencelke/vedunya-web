import type {
  NotificationPreferencesRecord,
  ReminderType,
} from "@/features/notifications/types/push";

export const SCHEDULE_WINDOW_MINUTES = 15;

export const SCHEDULABLE_REMINDER_TYPES = [
  "morning",
  "midday",
  "evening",
  "universeRequest",
] as const satisfies readonly Exclude<ReminderType, "test">[];

export type SchedulableReminderType = (typeof SCHEDULABLE_REMINDER_TYPES)[number];

export type LocalTimeContext = {
  localDate: string;
  minutesSinceMidnight: number;
  timezone: string;
  timezoneValid: boolean;
};

function readPart(parts: Intl.DateTimeFormatPart[], type: string): string {
  return parts.find((part) => part.type === type)?.value ?? "";
}

export function isTimezoneValid(timezone: string): boolean {
  if (!timezone.trim()) {
    return false;
  }

  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

export function getLocalTimeContext(
  timezone: string,
  now: Date = new Date(),
): LocalTimeContext {
  const timezoneValid = isTimezoneValid(timezone);
  const resolvedTimezone = timezoneValid ? timezone.trim() : "UTC";

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: resolvedTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const year = readPart(parts, "year");
  const month = readPart(parts, "month");
  const day = readPart(parts, "day");
  const hour = Number.parseInt(readPart(parts, "hour"), 10);
  const minute = Number.parseInt(readPart(parts, "minute"), 10);

  return {
    localDate: `${year}-${month}-${day}`,
    minutesSinceMidnight: hour * 60 + minute,
    timezone: resolvedTimezone,
    timezoneValid,
  };
}

export function parseTimeToMinutes(time: string): number | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);
  if (!match) {
    return null;
  }

  return Number.parseInt(match[1] ?? "0", 10) * 60 + Number.parseInt(match[2] ?? "0", 10);
}

export function isReminderTimeDue(
  scheduledTime: string,
  minutesSinceMidnight: number,
  windowMinutes = SCHEDULE_WINDOW_MINUTES,
): boolean {
  const scheduledMinutes = parseTimeToMinutes(scheduledTime);
  if (scheduledMinutes === null) {
    return false;
  }

  return (
    minutesSinceMidnight >= scheduledMinutes &&
    minutesSinceMidnight < scheduledMinutes + windowMinutes
  );
}

export function isSchedulableReminderType(
  value: string | null | undefined,
): value is SchedulableReminderType {
  return (
    value === "morning" ||
    value === "midday" ||
    value === "evening" ||
    value === "universeRequest"
  );
}

export function getDueReminderTypes(
  preferences: NotificationPreferencesRecord,
  now: Date = new Date(),
  typeFilter?: string | null,
): SchedulableReminderType[] {
  if (preferences.enabled !== true) {
    return [];
  }

  const { minutesSinceMidnight } = getLocalTimeContext(preferences.timezone, now);

  const slots: Array<{
    key: SchedulableReminderType;
    slot: NotificationPreferencesRecord[SchedulableReminderType];
  }> = [
    { key: "morning", slot: preferences.morning },
    { key: "midday", slot: preferences.midday },
    { key: "evening", slot: preferences.evening },
    { key: "universeRequest", slot: preferences.universeRequest },
  ];

  return slots
    .filter(({ key, slot }) => {
      if (typeFilter && typeFilter !== key) {
        return false;
      }
      if (slot.enabled !== true) {
        return false;
      }
      return isReminderTimeDue(slot.time, minutesSinceMidnight);
    })
    .map(({ key }) => key);
}
