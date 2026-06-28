import type { SchedulableReminderType } from "@/features/notifications/server/reminder-due";

/**
 * Profile UI preference keys map to Firestore scheduler reminder types.
 */
export const PROFILE_REMINDER_PREFERENCE_MAP = {
  morningGuidance: "morning",
  eveningReflection: "evening",
  courseReminder: "course",
  universeRequestReminder: "universeRequest",
} as const satisfies Record<string, SchedulableReminderType>;

export const DEFAULT_REMINDER_TIMES: Record<SchedulableReminderType, string> = {
  morning: "09:00",
  evening: "20:00",
  course: "18:00",
  universeRequest: "10:00",
};
