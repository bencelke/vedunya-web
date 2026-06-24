"use client";

import { useEffect } from "react";

import { TIMEZONE_COOKIE } from "@/features/numerology/constants";
import {
  formatTimezoneCookieAssignment,
  getCookieValue,
  shouldWriteTimezoneCookie,
} from "@/features/numerology/utils/timezone-cookie";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function TimezoneCookieSync() {
  useEffect(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const existingTimeZone = getCookieValue(TIMEZONE_COOKIE, document.cookie);

    if (!shouldWriteTimezoneCookie(timeZone, existingTimeZone)) {
      return;
    }

    document.cookie = formatTimezoneCookieAssignment(
      TIMEZONE_COOKIE,
      timeZone,
      COOKIE_MAX_AGE_SECONDS,
    );
  }, []);

  return null;
}
