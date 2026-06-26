import {
  isLikelyIOSPlatform,
  isStandaloneDisplayMode,
} from "@/lib/pwa/install";

export function shouldUseRedirectForGoogleAuth(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const userAgent = window.navigator.userAgent;
  const isMobile = /iphone|ipad|ipod|android/i.test(userAgent);
  const isSafari =
    /^((?!chrome|android).)*safari/i.test(userAgent) ||
    isLikelyIOSPlatform();

  return (
    isMobile ||
    isSafari ||
    isStandaloneDisplayMode() ||
    window.matchMedia("(max-width: 768px)").matches
  );
}
