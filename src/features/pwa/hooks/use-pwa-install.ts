"use client";

import { useCallback, useEffect, useState } from "react";

import {
  dismissPwaInstallPrompt,
  isIosSafari,
  isPwaDismissed,
  isStandaloneDisplayMode,
} from "@/features/pwa/utils/pwa-detection";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(() => isStandaloneDisplayMode());
  const [dismissed, setDismissed] = useState(() => isPwaDismissed());
  const [iosGuide] = useState(() => isIosSafari());

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }

    function handleAppInstalled() {
      setInstalled(true);
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) {
      return false;
    }

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);

    if (choice.outcome === "accepted") {
      setInstalled(true);
      return true;
    }

    return false;
  }, [deferredPrompt]);

  const dismiss = useCallback(() => {
    dismissPwaInstallPrompt();
    setDismissed(true);
  }, []);

  const showAndroidPrompt =
    !installed && !dismissed && deferredPrompt !== null;
  const showIosGuide = !installed && !dismissed && iosGuide && !deferredPrompt;
  const showInstalledHint = installed;

  return {
    installed,
    dismissed,
    showAndroidPrompt,
    showIosGuide,
    showInstalledHint,
    install,
    dismiss,
  };
}
