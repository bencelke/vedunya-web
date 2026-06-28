"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getNotificationPermission,
  isPushEnvironmentReady,
} from "@/features/notifications/utils/push-support";
import {
  isAndroidChromium,
  isIosDevice,
  isStandaloneDisplayMode,
} from "@/features/pwa/utils/pwa-detection";

export type PwaPlatform = "ios" | "android" | "desktop" | "unknown";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function resolvePlatform(): PwaPlatform {
  if (typeof navigator === "undefined") {
    return "unknown";
  }

  if (isIosDevice()) {
    return "ios";
  }

  if (isAndroidChromium()) {
    return "android";
  }

  if (typeof window !== "undefined") {
    return "desktop";
  }

  return "unknown";
}

export function usePwaInstallState() {
  const [isStandalone, setIsStandalone] = useState(() => isStandaloneDisplayMode());
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >(() => getNotificationPermission());
  const [platform] = useState<PwaPlatform>(() => resolvePlatform());

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }

    function handleAppInstalled() {
      setIsStandalone(true);
      setDeferredPrompt(null);
    }

    function handleVisibilityChange() {
      setIsStandalone(isStandaloneDisplayMode());
      setPermission(getNotificationPermission());
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const canPromptInstall = deferredPrompt !== null;
  const supportsNotifications = isPushEnvironmentReady();

  const showIosInstructions = useMemo(
    () => platform === "ios" && !isStandalone,
    [isStandalone, platform],
  );

  const showAndroidInstall = useMemo(
    () => !isStandalone && canPromptInstall,
    [canPromptInstall, isStandalone],
  );

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) {
      return false;
    }

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);

    if (choice.outcome === "accepted") {
      setIsStandalone(true);
      return true;
    }

    return false;
  }, [deferredPrompt]);

  return {
    isStandalone,
    canPromptInstall,
    platform,
    supportsNotifications,
    permission,
    showIosInstructions,
    showAndroidInstall,
    promptInstall,
    refreshPermission: () => setPermission(getNotificationPermission()),
  };
}
