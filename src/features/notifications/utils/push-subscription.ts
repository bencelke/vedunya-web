import type { SupportedLocale } from "@/config/app-config";
import { isPwaEnabled } from "@/config/pwa";
import type { PushPlatform } from "@/features/notifications/types/push";
import type { PushSubscribeRequest } from "@/features/notifications/schemas/push-schema";
import {
  detectPushPlatform,
  urlBase64ToUint8Array,
} from "@/features/notifications/utils/push-support";

export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) {
    return null;
  }

  try {
    return await navigator.serviceWorker.ready;
  } catch {
    return null;
  }
}

export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  const registration = await getServiceWorkerRegistration();
  if (!registration) {
    return null;
  }

  return registration.pushManager.getSubscription();
}

export function serializePushSubscription(input: {
  subscription: PushSubscription;
  locale: SupportedLocale;
  timezone: string;
  platform?: PushPlatform;
}): PushSubscribeRequest {
  const json = input.subscription.toJSON();
  const endpoint = json.endpoint ?? input.subscription.endpoint;

  if (!endpoint || !json.keys?.p256dh || !json.keys.auth) {
    throw new Error("invalid_push_subscription");
  }

  return {
    endpoint,
    keys: {
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    },
    userAgent: navigator.userAgent.slice(0, 512),
    platform: input.platform ?? detectPushPlatform(),
    locale: input.locale,
    timezone: input.timezone,
  };
}

export async function subscribeToPush(input: {
  publicKey: string;
  locale: SupportedLocale;
  timezone: string;
}): Promise<PushSubscription> {
  if (!isPwaEnabled) {
    throw new Error("push_unavailable_in_dev");
  }

  const registration = await getServiceWorkerRegistration();
  if (!registration) {
    throw new Error("no_service_worker");
  }

  const existing = await registration.pushManager.getSubscription();
  if (existing) {
    return existing;
  }

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(input.publicKey) as BufferSource,
  });
}

export async function requestNotificationPermissionFromUserAction(): Promise<
  NotificationPermission | "unsupported"
> {
  if (!("Notification" in window)) {
    return "unsupported";
  }

  return Notification.requestPermission();
}

export async function postPushSubscribe(
  payload: PushSubscribeRequest,
): Promise<Response> {
  return fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function postPushUnsubscribe(endpoint: string): Promise<Response> {
  return fetch("/api/push/unsubscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint }),
  });
}

export async function unsubscribeCurrentDevice(): Promise<string | null> {
  const subscription = await getCurrentPushSubscription();
  if (!subscription) {
    return null;
  }

  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  return endpoint;
}

export async function disablePushOnDevice(): Promise<void> {
  const endpoint = await unsubscribeCurrentDevice();
  if (!endpoint) {
    return;
  }

  await postPushUnsubscribe(endpoint);
}

export async function disablePushOnLogout(): Promise<void> {
  try {
    await disablePushOnDevice();
  } catch {
    // Best-effort cleanup before logout.
  }
}
