import Script from "next/script";

import { isPwaEnabled } from "@/config/pwa";

const DEV_SW_CLEANUP = `
(function () {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.getRegistrations().then(function (registrations) {
    if (!registrations.length) return;
    return Promise.all(
      registrations.map(function (registration) {
        return registration.unregister();
      }),
    );
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
