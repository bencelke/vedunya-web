"use client";

import { useEffect } from "react";

import { isPwaEnabled } from "@/config/pwa";
import {
  cleanupDevelopmentServiceWorkers,
  hasCompletedDevelopmentServiceWorkerCleanup,
  markDevelopmentServiceWorkerCleanupComplete,
} from "@/features/pwa/utils/service-worker-lifecycle";

export function DevServiceWorkerCleanup() {
  useEffect(() => {
    if (isPwaEnabled) {
      return;
    }

    if (hasCompletedDevelopmentServiceWorkerCleanup()) {
      return;
    }

    void cleanupDevelopmentServiceWorkers().then((result) => {
      markDevelopmentServiceWorkerCleanupComplete();

      if (result.unregistered > 0 || result.cachesCleared > 0) {
        console.debug("[PWA disabled in dev] cleared service worker state", result);
      } else {
        console.debug("[PWA disabled in dev]");
      }
    });
  }, []);

  return null;
}
