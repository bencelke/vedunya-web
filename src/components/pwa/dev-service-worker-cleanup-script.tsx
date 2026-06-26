import Script from "next/script";

import { isPwaEnabled } from "@/config/pwa";
import { DEV_SW_CLEANUP_KEY } from "@/features/pwa/utils/service-worker-lifecycle";

const DEV_SW_CLEANUP = `
(function () {
  try {
    if (window.sessionStorage.getItem("${DEV_SW_CLEANUP_KEY}") === "1") return;
  } catch (e) {
    return;
  }
  function markComplete() {
    try {
      window.sessionStorage.setItem("${DEV_SW_CLEANUP_KEY}", "1");
    } catch (e) {}
  }
  if (!("serviceWorker" in navigator)) {
    markComplete();
    return;
  }
  navigator.serviceWorker.getRegistrations().then(function (registrations) {
    var unregisterPromise = registrations.length
      ? Promise.all(
          registrations.map(function (registration) {
            return registration.unregister();
          }),
        )
      : Promise.resolve();
    return unregisterPromise.then(function () {
      if (!("caches" in window)) {
        return;
      }
      return caches.keys().then(function (keys) {
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
    }).then(markComplete);
  });
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
