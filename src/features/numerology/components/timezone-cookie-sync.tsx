"use client";

import { useEffect } from "react";

import { TIMEZONE_COOKIE } from "@/features/numerology/constants";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function TimezoneCookieSync() {
  useEffect(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!timeZone) {
      return;
    }

    document.cookie = `${TIMEZONE_COOKIE}=${encodeURIComponent(timeZone)}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
  }, []);

  return null;
}
