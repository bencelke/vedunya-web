import { isPwaEnabled } from "@/config/pwa";

export const PENDING_SW_UPDATE_RELOAD_KEY = "mystic:pwa-pending-update-reload";
export const DEV_SW_CLEANUP_KEY = "mystic:dev-sw-cleaned";

const MYSTIC_CACHE_PREFIX = "mystic-";

export type DevelopmentServiceWorkerCleanupResult = {
  unregistered: number;
  cachesCleared: number;
};

export function isServiceWorkerSupported(): boolean {
  return typeof navigator !== "undefined" && "serviceWorker" in navigator;
}

export function shouldRegisterServiceWorker(): boolean {
  return isPwaEnabled;
}

export async function unregisterAllServiceWorkers(): Promise<number> {
  if (!isServiceWorkerSupported()) {
    return 0;
  }

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));
  return registrations.length;
}

export async function clearMysticServiceWorkerCaches(): Promise<number> {
  if (typeof caches === "undefined") {
    return 0;
  }

  const keys = await caches.keys();
  const mysticKeys = keys.filter((key) => key.startsWith(MYSTIC_CACHE_PREFIX));
  await Promise.all(mysticKeys.map((key) => caches.delete(key)));
  return mysticKeys.length;
}

export async function cleanupDevelopmentServiceWorkers(): Promise<DevelopmentServiceWorkerCleanupResult> {
  const unregistered = await unregisterAllServiceWorkers();
  const cachesCleared = await clearMysticServiceWorkerCaches();
  return { unregistered, cachesCleared };
}

export function markPendingServiceWorkerUpdateReload(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(PENDING_SW_UPDATE_RELOAD_KEY, "1");
  } catch {
    // Ignore storage failures; reload guard will simply not run.
  }
}

export function consumePendingServiceWorkerUpdateReload(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    if (window.sessionStorage.getItem(PENDING_SW_UPDATE_RELOAD_KEY) !== "1") {
      return false;
    }

    window.sessionStorage.removeItem(PENDING_SW_UPDATE_RELOAD_KEY);
    return true;
  } catch {
    return false;
  }
}

export function hasCompletedDevelopmentServiceWorkerCleanup(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.sessionStorage.getItem(DEV_SW_CLEANUP_KEY) === "1";
  } catch {
    return false;
  }
}

export function markDevelopmentServiceWorkerCleanupComplete(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(DEV_SW_CLEANUP_KEY, "1");
  } catch {
    // Ignore storage failures.
  }
}
