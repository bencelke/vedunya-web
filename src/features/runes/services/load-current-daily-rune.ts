import "server-only";

import { cookies } from "next/headers";

import { calculatePersonalDay } from "@/features/numerology/engine/calculate-personal-day";
import { resolveTimeZone } from "@/features/numerology/engine/date-only";
import { TIMEZONE_COOKIE } from "@/features/numerology/constants";
import { formatDateOfBirth } from "@/features/profile/schemas/onboarding-schema";
import { getProfileSnapshot } from "@/features/profile/services/profile-repository";
import { isProfileComplete } from "@/features/profile/utils/profile-complete";
import { parseDateKey } from "@/features/runes/engine/date-key";
import { resolveMoonDateKey } from "@/features/moon/engine/date-time";
import { buildDailyRuneResult } from "@/features/runes/services/daily-rune-service";
import { getCachedRuneDeepContent } from "@/features/runes/repositories/rune-content-repository";
import {
  applyRuneContentAccess,
  hasRunePremiumContent,
} from "@/features/runes/services/apply-rune-content-access";
import { resolveRuneContentAccess } from "@/features/runes/services/rune-entitlement";
import { resolveRuneId } from "@/features/runes/constants/rune-aliases";
import { getCurrentUser } from "@/lib/auth/current-user";
import type {
  DailyRuneLoadResult,
  RuneDetailLoadResult,
  SupportedRuneLocale,
} from "@/features/runes/types/rune";

export async function loadCurrentDailyRune(
  locale: SupportedRuneLocale,
): Promise<DailyRuneLoadResult> {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    return { status: "error", reason: "invalid-session" };
  }

  const profile = await getProfileSnapshot(sessionUser.uid);
  if (!isProfileComplete(profile) || !profile?.dateOfBirth) {
    return { status: "missing-profile-data" };
  }

  const cookieStore = await cookies();
  const timezone = resolveTimeZone(cookieStore.get(TIMEZONE_COOKIE)?.value);
  const dateKey = resolveMoonDateKey(timezone);
  const forDate = parseDateKey(dateKey);
  const contentLocale = profile.language ?? locale;

  if (contentLocale !== "en" && contentLocale !== "ru") {
    return { status: "error", reason: "unsupported-locale" };
  }

  try {
    const personalDay = calculatePersonalDay({
      birthDate: formatDateOfBirth(profile.dateOfBirth),
      calculationDate: dateKey,
      locale: contentLocale,
    });

    const result = buildDailyRuneResult({
      personalDayNumber: personalDay.personalDayNumber,
      forDate,
      locale: contentLocale,
    });

    return { status: "ready", result };
  } catch {
    return { status: "error", reason: "selection-failed" };
  }
}

export async function loadRuneDetail(
  rawRuneId: string,
  locale: SupportedRuneLocale,
): Promise<RuneDetailLoadResult> {
  const runeId = resolveRuneId(rawRuneId);
  if (!runeId) {
    return { status: "not-found" };
  }

  const sessionUser = await getCurrentUser();
  const profile = sessionUser
    ? await getProfileSnapshot(sessionUser.uid)
    : null;
  const access = resolveRuneContentAccess(profile);

  const loaded = await getCachedRuneDeepContent(runeId, locale);
  if (!loaded) {
    return { status: "not-found" };
  }

  const rawContent = loaded.content;
  const showPremiumLock =
    !access.premiumActive && hasRunePremiumContent(rawContent);

  return {
    status: "ready",
    detail: {
      runeId,
      content: applyRuneContentAccess(rawContent, access),
      access,
      showPremiumLock,
      source: loaded.source,
    },
  };
}
