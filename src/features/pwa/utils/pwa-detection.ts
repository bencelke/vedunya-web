export function isStandaloneDisplayMode(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const standaloneQuery = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone =
    "standalone" in window.navigator &&
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);

  return standaloneQuery || iosStandalone;
}

export function isIosDevice(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function isIosSafari(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  const ua = navigator.userAgent;
  const isIos = isIosDevice();
  const isSafari =
    /safari/i.test(ua) &&
    !/crios|fxios|edgios|chrome|chromium/i.test(ua);

  return isIos && isSafari && !isStandaloneDisplayMode();
}

export function isAndroidChromium(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  return /android/i.test(navigator.userAgent) && /chrome|chromium/i.test(navigator.userAgent);
}

export function canUseBeforeInstallPrompt(): boolean {
  return typeof window !== "undefined" && "BeforeInstallPromptEvent" in window;
}

export function isPwaDismissed(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem("mystic:pwa-install-dismissed") === "1";
}

export function dismissPwaInstallPrompt(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem("mystic:pwa-install-dismissed", "1");
}
