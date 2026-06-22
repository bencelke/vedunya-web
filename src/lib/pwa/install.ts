export function isBrowserEnvironment(): boolean {
  return typeof window !== "undefined";
}

export function isStandaloneDisplayMode(): boolean {
  if (!isBrowserEnvironment()) {
    return false;
  }

  const mediaQuery = window.matchMedia("(display-mode: standalone)");
  const navigatorWithStandalone = window.navigator as Navigator & {
    standalone?: boolean;
  };

  return mediaQuery.matches || navigatorWithStandalone.standalone === true;
}

export function isLikelyIOSPlatform(): boolean {
  if (!isBrowserEnvironment()) {
    return false;
  }

  const userAgent = window.navigator.userAgent;
  const isAppleMobile = /iPad|iPhone|iPod/.test(userAgent);
  const isMsStream = "MSStream" in window;

  return isAppleMobile && !isMsStream;
}

export type BeforeInstallPromptOutcome = "accepted" | "dismissed";

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: BeforeInstallPromptOutcome }>;
};

export function isBeforeInstallPromptEvent(
  event: Event,
): event is BeforeInstallPromptEvent {
  return (
    "prompt" in event &&
    typeof (event as BeforeInstallPromptEvent).prompt === "function"
  );
}
