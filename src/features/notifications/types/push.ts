import type { SupportedLocale } from "@/config/app-config";

export type PushPlatform = "ios" | "android" | "desktop" | "unknown";

export type ReminderType =
  | "morning"
  | "midday"
  | "evening"
  | "universeRequest"
  | "test";

export type PushSubscriptionKeys = {
  p256dh: string;
  auth: string;
};

export type PushSubscriptionRecord = {
  endpoint: string;
  keys: PushSubscriptionKeys;
  userAgent?: string;
  platform: PushPlatform;
  locale: SupportedLocale;
  timezone: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  lastSeenAt: string;
  lastSuccessAt?: string;
  lastFailureAt?: string;
  failureCount?: number;
};

export type ReminderSlotPreference = {
  enabled: boolean;
  time: string;
};

export type NotificationPreferencesRecord = {
  enabled: boolean;
  morning: ReminderSlotPreference;
  midday: ReminderSlotPreference;
  evening: ReminderSlotPreference;
  universeRequest: ReminderSlotPreference;
  timezone: string;
  locale: SupportedLocale;
  updatedAt: string;
};

export type PushNotificationPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  lang?: SupportedLocale;
  reminderType?: ReminderType;
};

export type PushStatusResponse = {
  configured: boolean;
  subscribed: boolean;
  permission: NotificationPermission | "unsupported";
  preferences: NotificationPreferencesRecord;
  requiresInstalledPwa: boolean;
  pushSupported: boolean;
};

export type PushStatusSummary = {
  configured: boolean;
  publicKey: string | null;
  subscribed: boolean;
  subscriptionCount: number;
  preferences: NotificationPreferencesRecord;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
};
