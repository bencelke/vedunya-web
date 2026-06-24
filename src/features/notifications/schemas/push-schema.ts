import { z } from "zod";

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export const pushSubscriptionKeysSchema = z.object({
  p256dh: z.string().min(1),
  auth: z.string().min(1),
});

export const pushSubscribeRequestSchema = z.object({
  endpoint: z.string().url(),
  keys: pushSubscriptionKeysSchema,
  userAgent: z.string().max(512).optional(),
  platform: z.enum(["ios", "android", "desktop", "unknown"]).default("unknown"),
  locale: z.enum(["en", "ru"]),
  timezone: z.string().min(1).max(64),
});

export const pushUnsubscribeRequestSchema = z.object({
  endpoint: z.string().url(),
});

export const reminderSlotSchema = z.object({
  enabled: z.boolean(),
  time: z.string().regex(timePattern),
});

export const notificationPreferencesSchema = z.object({
  enabled: z.boolean(),
  morning: reminderSlotSchema,
  midday: reminderSlotSchema,
  evening: reminderSlotSchema,
  universeRequest: reminderSlotSchema,
  timezone: z.string().min(1).max(64),
  locale: z.enum(["en", "ru"]),
});

export type PushSubscribeRequest = z.infer<typeof pushSubscribeRequestSchema>;
export type PushUnsubscribeRequest = z.infer<typeof pushUnsubscribeRequestSchema>;
export const pushTestRequestSchema = pushUnsubscribeRequestSchema.extend({
  locale: z.enum(["en", "ru"]).optional(),
});

export type NotificationPreferencesInput = z.infer<
  typeof notificationPreferencesSchema
>;
export type PushTestRequest = z.infer<typeof pushTestRequestSchema>;
