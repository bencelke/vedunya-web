import {
  isIosDevice,
  isIosSafari,
  isStandaloneDisplayMode,
} from "@/features/pwa/utils/pwa-detection";
import { isPwaEnabled } from "@/config/pwa";
import type { PushPlatform } from "@/features/notifications/types/push";

export function isNotificationApiSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function isServiceWorkerSupported(): boolean {
  return typeof navigator !== "undefined" && "serviceWorker" in navigator;
}

export function isPushManagerSupported(): boolean {
  return isServiceWorkerSupported() && "PushManager" in window;
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!isNotificationApiSupported()) {
    return "unsupported";
  }

  return Notification.permission;
}

export function requiresInstalledPwaForPush(): boolean {
  return isIosSafari();
}

export function isPushEnvironmentReady(): boolean {
  if (!isPwaEnabled) {
    return false;
  }

  if (!isPushManagerSupported() || !isNotificationApiSupported()) {
    return false;
  }

  if (requiresInstalledPwaForPush()) {
    return false;
  }

  return true;
}

export function detectPushPlatform(): PushPlatform {
  if (typeof navigator === "undefined") {
    return "unknown";
  }

  if (isIosDevice()) {
    return "ios";
  }

  if (/android/i.test(navigator.userAgent)) {
    return "android";
  }

  return "desktop";
}

export function isInstalledPwaContext(): boolean {
  return isStandaloneDisplayMode();
}

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}

export function resolveClientTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}
