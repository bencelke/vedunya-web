"use client";

import { useEffect, useRef } from "react";

import { TIMEZONE_COOKIE } from "@/features/numerology/constants";
import {
  formatTimezoneCookieAssignment,
  getCookieValue,
  shouldWriteTimezoneCookie,
} from "@/features/numerology/utils/timezone-cookie";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
const TIMEZONE_SYNC_STORAGE_KEY = "vedunya_tz_synced";

function rememberTimezoneSync(timeZone: string): void {
  try {
    sessionStorage.setItem(TIMEZONE_SYNC_STORAGE_KEY, timeZone);
  } catch {
    // Ignore storage failures.
  }
}

export function TimezoneCookieSync() {
  const wroteCookieRef = useRef(false);

  useEffect(() => {
    if (wroteCookieRef.current) {
      return;
    }

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone?.trim();
    if (!timeZone) {
      return;
    }

    const existingTimeZone = getCookieValue(TIMEZONE_COOKIE, document.cookie);

    if (!shouldWriteTimezoneCookie(timeZone, existingTimeZone)) {
      wroteCookieRef.current = true;
      rememberTimezoneSync(timeZone);
      return;
    }

    try {
      if (sessionStorage.getItem(TIMEZONE_SYNC_STORAGE_KEY) === timeZone) {
        wroteCookieRef.current = true;
        return;
      }
    } catch {
      // Ignore storage failures and fall back to cookie comparison only.
    }

    document.cookie = formatTimezoneCookieAssignment(
      TIMEZONE_COOKIE,
      timeZone,
      COOKIE_MAX_AGE_SECONDS,
    );
    wroteCookieRef.current = true;
    rememberTimezoneSync(timeZone);
  }, []);

  return null;
}
