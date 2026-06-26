import Script from "next/script";

import { isPwaEnabled } from "@/config/pwa";
import { DEV_SW_CLEANUP_KEY, DEV_SW_RELOAD_KEY } from "@/features/pwa/utils/service-worker-lifecycle";

const DEV_SW_CLEANUP = `
(function () {
  try {
    if (window.sessionStorage.getItem("${DEV_SW_CLEANUP_KEY}") === "1") return;
  } catch (e) {
    return;
  }
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.getRegistrations().then(function (registrations) {
    if (!registrations.length) {
      try {
        window.sessionStorage.setItem("${DEV_SW_CLEANUP_KEY}", "1");
      } catch (e) {}
      return;
    }
    return Promise.all(
      registrations.map(function (registration) {
        return registration.unregister();
      }),
    ).then(function () {
      try {
        window.sessionStorage.setItem("${DEV_SW_CLEANUP_KEY}", "1");
        if (window.sessionStorage.getItem("${DEV_SW_RELOAD_KEY}") === "1") {
          return;
        }
        window.sessionStorage.setItem("${DEV_SW_RELOAD_KEY}", "1");
      } catch (e) {}
      window.location.reload();
    });
  });
  if ("caches" in window) {
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) {
            return key.indexOf("mystic-") === 0;
          })
          .map(function (key) {
            return caches.delete(key);
          }),
      );
    });
  }
})();
`;

export function DevServiceWorkerCleanupScript() {
  if (isPwaEnabled) {
    return null;
  }

  return (
    <Script id="mystic-dev-sw-cleanup" strategy="beforeInteractive">
      {DEV_SW_CLEANUP}
    </Script>
  );
}
