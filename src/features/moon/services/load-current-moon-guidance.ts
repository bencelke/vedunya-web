import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";

import { calculateMoonContext } from "@/features/moon/engine/calculate-moon-context";
import {
  buildMoonCalculationInput,
  parseCalculationInstant,
  resolveMoonDateKey,
  resolveMoonTimezone,
} from "@/features/moon/engine/date-time";
import {
  getCachedLunarDayContent,
  getCachedMoonPhaseContent,
} from "@/features/moon/repositories/moon-content-repository";
import {
  localizeLunarDayContent,
  localizeMoonPhaseContent,
  resolveLocaleWithFallback,
} from "@/features/moon/services/moon-content-service";
import { hasMoonPremiumContent } from "@/features/moon/utils/moon-premium-content";
import { getProfileSnapshot } from "@/features/profile/services/profile-repository";
import { resolvePremiumAccess } from "@/features/profile/utils/premium-access";
import { TIMEZONE_COOKIE } from "@/features/numerology/constants";
import { getCurrentUser } from "@/lib/auth/current-user";
import type {
  MoonGuidanceLoadResult,
  MoonGuidanceResult,
  SupportedMoonLocale,
} from "@/features/moon/types/moon";

async function loadMoonGuidanceInternal(input: {
  locale: SupportedMoonLocale;
  instant?: Date;
  timezone?: string;
}): Promise<MoonGuidanceLoadResult> {
  const locale = resolveLocaleWithFallback(input.locale);
  const cookieStore = await cookies();
  const timezone = input.timezone
    ?? resolveMoonTimezone(cookieStore.get(TIMEZONE_COOKIE)?.value);

  let calculationInstant = input.instant ?? new Date();
  if (input.instant) {
    try {
      calculationInstant = input.instant;
    } catch {
      return { status: "error", reason: "invalid-instant" };
    }
  }

  try {
    const calculationInput = buildMoonCalculationInput({
      instant: calculationInstant,
      timezone,
    });
    const calculation = calculateMoonContext(calculationInput);
    const sessionUser = await getCurrentUser();
    const profile = sessionUser
      ? await getProfileSnapshot(sessionUser.uid)
      : null;
    const premiumActive = resolvePremiumAccess(profile);

    const phaseLoad = await getCachedMoonPhaseContent(calculation.phaseId);
    const lunarLoad = await getCachedLunarDayContent(calculation.lunarDay);

    const phaseFull = localizeMoonPhaseContent(phaseLoad.record, locale, true);
    const lunarFull = lunarLoad.record
      ? localizeLunarDayContent(lunarLoad.record, locale, true)
      : null;

    const phase = premiumActive
      ? phaseFull
      : localizeMoonPhaseContent(phaseLoad.record, locale, false);
    const lunarDayContent = lunarLoad.record
      ? premiumActive
        ? lunarFull
        : localizeLunarDayContent(lunarLoad.record, locale, false)
      : null;

    const guidance: MoonGuidanceResult = {
      dateKey: resolveMoonDateKey(timezone, calculationInstant),
      timezone,
      calculation,
      phase,
      lunarDayContent,
      premiumActive,
      showPremiumLock:
        !premiumActive &&
        hasMoonPremiumContent({
          phase: phaseFull,
          lunarDayContent: lunarFull,
        }),
      source: {
        phase: phaseLoad.source,
        lunarDay: lunarLoad.source,
      },
    };

    return { status: "ready", guidance };
  } catch {
    return { status: "error", reason: "calculation-failed" };
  }
}

export const loadCurrentMoonGuidance = cache(
  async (locale: SupportedMoonLocale): Promise<MoonGuidanceLoadResult> =>
    loadMoonGuidanceInternal({ locale }),
);

export async function loadMoonGuidanceForInstant(input: {
  locale: SupportedMoonLocale;
  calculationDateTime: string;
  timezone: string;
}): Promise<MoonGuidanceLoadResult> {
  try {
    const instant = parseCalculationInstant(input.calculationDateTime);
    return loadMoonGuidanceInternal({
      locale: input.locale,
      instant,
      timezone: resolveMoonTimezone(input.timezone),
    });
  } catch {
    return { status: "error", reason: "invalid-datetime" };
  }
}

export async function loadMoonSummary(
  locale: SupportedMoonLocale,
): Promise<MoonGuidanceLoadResult> {
  return loadCurrentMoonGuidance(locale);
}
