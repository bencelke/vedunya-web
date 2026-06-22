import "server-only";

import { cookies } from "next/headers";

import {
  getTodayDateKeyInTimeZone,
  parseIsoDateOnly,
  resolveTimeZone,
} from "@/features/numerology/engine/date-only";
import { buildPersonalDayResult } from "@/features/numerology/services/personal-day-service";
import type {
  PersonalDayLoadResult,
  SupportedNumerologyLocale,
} from "@/features/numerology/types/numerology";
import { formatDateOfBirth } from "@/features/profile/schemas/onboarding-schema";
import { getProfileSnapshot } from "@/features/profile/services/profile-repository";
import { getCurrentUser } from "@/lib/auth/current-user";
import { TIMEZONE_COOKIE } from "@/features/numerology/constants";
import { getFirebaseAdminFirestore } from "@/lib/firebase-admin/firestore";

export async function loadCurrentPersonalDay(
  locale: SupportedNumerologyLocale,
): Promise<PersonalDayLoadResult | null> {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    return null;
  }

  const db = getFirebaseAdminFirestore();
  if (!db) {
    return { status: "error", reason: "firestore-unavailable" };
  }

  const profile = await getProfileSnapshot(sessionUser.uid);
  if (!profile?.profileComplete) {
    return { status: "missing-profile-data" };
  }

  if (!profile.dateOfBirth) {
    return { status: "missing-profile-data" };
  }

  const cookieStore = await cookies();
  const timeZone = resolveTimeZone(cookieStore.get(TIMEZONE_COOKIE)?.value);
  const calculationDate = getTodayDateKeyInTimeZone(timeZone);

  try {
    parseIsoDateOnly(calculationDate);
  } catch {
    return { status: "error", reason: "calculation-failed" };
  }

  const contentLocale = profile.language ?? locale;
  if (contentLocale !== "en" && contentLocale !== "ru") {
    return { status: "error", reason: "unsupported-locale" };
  }

  const result = buildPersonalDayResult({
    birthDate: formatDateOfBirth(profile.dateOfBirth),
    calculationDate,
    locale: contentLocale,
    userSeed: sessionUser.uid,
  });

  if (!result) {
    return { status: "error", reason: "content-missing" };
  }

  return {
    status: "ready",
    result,
  };
}

export function formatDisplayDate(
  dateKey: string,
  locale: SupportedNumerologyLocale,
): string {
  const parts = parseIsoDateOnly(dateKey);
  const date = new Date(parts.year, parts.month - 1, parts.day);

  return new Intl.DateTimeFormat(locale === "ru" ? "ru-RU" : "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}
