import "server-only";

import webpush from "web-push";

import {
  markPushSubscriptionResult,
  readEnabledPushSubscriptions,
  readPushSubscriptionByEndpoint,
} from "@/features/notifications/repositories/push-repository";
import { getWebPushConfig } from "@/features/notifications/server/web-push-config";
import type { PushNotificationPayload } from "@/features/notifications/types/push";

export type SendWebPushResult = {
  sent: number;
  failed: number;
  removed: number;
};

function configureWebPush(): boolean {
  const config = getWebPushConfig();
  if (!config) {
    return false;
  }

  webpush.setVapidDetails(config.subject, config.publicKey, config.privateKey);
  return true;
}

function isExpiredSubscriptionError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const statusCode = (error as { statusCode?: number }).statusCode;
  return statusCode === 404 || statusCode === 410;
}

export async function sendWebPushToEndpoint(input: {
  uid: string;
  endpoint: string;
  payload: PushNotificationPayload;
}): Promise<"sent" | "failed" | "removed"> {
  if (!configureWebPush()) {
    throw new Error("web_push_not_configured");
  }

  const subscription = await readPushSubscriptionByEndpoint({
    uid: input.uid,
    endpoint: input.endpoint,
  });

  if (!subscription || !subscription.enabled) {
    return "failed";
  }

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      JSON.stringify(input.payload),
    );
    await markPushSubscriptionResult({
      uid: input.uid,
      endpoint: input.endpoint,
      success: true,
    });
    return "sent";
  } catch (error) {
    if (isExpiredSubscriptionError(error)) {
      await markPushSubscriptionResult({
        uid: input.uid,
        endpoint: input.endpoint,
        success: false,
        remove: true,
      });
      return "removed";
    }

    await markPushSubscriptionResult({
      uid: input.uid,
      endpoint: input.endpoint,
      success: false,
    });
    return "failed";
  }
}

export async function sendWebPushToUser(input: {
  uid: string;
  payload: PushNotificationPayload;
}): Promise<SendWebPushResult> {
  if (!configureWebPush()) {
    throw new Error("web_push_not_configured");
  }

  const subscriptions = await readEnabledPushSubscriptions(input.uid);
  let sent = 0;
  let failed = 0;
  let removed = 0;

  for (const subscription of subscriptions) {
    const result = await sendWebPushToEndpoint({
      uid: input.uid,
      endpoint: subscription.endpoint,
      payload: input.payload,
    });

    if (result === "sent") sent += 1;
    if (result === "failed") failed += 1;
    if (result === "removed") removed += 1;
  }

  return { sent, failed, removed };
}
