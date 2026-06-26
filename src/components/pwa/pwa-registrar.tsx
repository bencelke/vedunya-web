"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { isPwaEnabled, pwaConfig } from "@/config/pwa";
import {
  consumePendingServiceWorkerUpdateReload,
  markPendingServiceWorkerUpdateReload,
} from "@/features/pwa/utils/service-worker-lifecycle";

function isServiceWorkerSupported(): boolean {
  return typeof navigator !== "undefined" && "serviceWorker" in navigator;
}

function PwaRegistrarProduction() {
  const [updateReady, setUpdateReady] = useState(false);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const t = useTranslations("pwa");

  useEffect(() => {
    if (!isServiceWorkerSupported()) {
      return;
    }

    let cancelled = false;

    async function register() {
      try {
        const reg = await navigator.serviceWorker.register(pwaConfig.serviceWorkerPath, {
          scope: pwaConfig.scope,
        });

        if (cancelled) {
          return;
        }

        setRegistration(reg);

        if (reg.waiting && navigator.serviceWorker.controller) {
          setUpdateReady(true);
        }

        reg.addEventListener("updatefound", () => {
          const worker = reg.installing;
          if (!worker) {
            return;
          }

          worker.addEventListener("statechange", () => {
            if (
              worker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              setUpdateReady(true);
            }
          });
        });
      } catch {
        // Service worker registration is best-effort.
      }
    }

    void register();

    const handleControllerChange = () => {
      if (!consumePendingServiceWorkerUpdateReload()) {
        return;
      }

      window.location.reload();
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange,
    );

    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange,
      );
    };
  }, []);

  function applyUpdate() {
    markPendingServiceWorkerUpdateReload();
    registration?.waiting?.postMessage({ type: "SKIP_WAITING" });
    setUpdateReady(false);
  }

  if (!updateReady) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-[calc(var(--bottom-nav-height,4.5rem)+0.75rem)] z-50 flex justify-center px-4">
      <div className="mystic-cosmic-card flex w-full max-w-md items-center justify-between gap-3 p-4 shadow-lg">
        <p className="text-sm text-text-muted">{t("updateAvailable")}</p>
        <button
          type="button"
          onClick={applyUpdate}
          className="shrink-0 rounded-[var(--radius-pill)] bg-accent-gold px-4 py-2 text-sm font-medium text-page-bg"
        >
          {t("updateAction")}
        </button>
      </div>
    </div>
  );
}

export function PwaRegistrar() {
  if (process.env.NODE_ENV === "development" || !isPwaEnabled) {
    return null;
  }

  return <PwaRegistrarProduction />;
}
