import "server-only";

import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";

import { calculatePersonalDay } from "@/features/numerology/engine/calculate-personal-day";
import {
  getTodayDateKeyInTimeZone,
  parseIsoDateOnly,
  resolveTimeZone,
} from "@/features/numerology/engine/date-only";
import { TIMEZONE_COOKIE } from "@/features/numerology/constants";
import { buildPersonalDayResult } from "@/features/numerology/services/personal-day-service";
import { formatDisplayDate } from "@/features/numerology/services/load-current-personal-day";
import { loadCurrentMoonGuidance } from "@/features/moon/services/load-current-moon-guidance";
import { parseDateKey } from "@/features/runes/engine/date-key";
import { buildDailyRuneResult } from "@/features/runes/services/daily-rune-service";
import { formatDateOfBirth } from "@/features/profile/schemas/onboarding-schema";
import { getProfileSnapshot } from "@/features/profile/services/profile-repository";
import { isProfileComplete } from "@/features/profile/utils/profile-complete";
import { resolvePremiumAccess } from "@/features/profile/utils/premium-access";
import { loadUniverseRequestViewModel } from "@/features/universe-request/server/load-universe-request";
import { getCachedRuneDeepContent } from "@/features/runes/repositories/rune-content-repository";
import {
  composeAuthenticatedGuidance,
  composeMoonSection,
} from "@/features/daily-guidance/services/compose-daily-guidance";
import type {
  DailyGuidancePageModel,
  DailyGuidancePreviewModel,
} from "@/features/daily-guidance/types/daily-guidance-view-model";
import { getMockDailyGuidance } from "@/lib/mock/daily-guidance";
import { getCurrentUser } from "@/lib/auth/current-user";
import type { SupportedLocale } from "@/config/app-config";
import { resolveSpiritualContentLocale } from "@/i18n/resolve-spiritual-content-locale";
import type { SpiritualContentLocale } from "@/i18n/resolve-spiritual-content-locale";
import type { PersonalDayResult } from "@/features/numerology/types/numerology";
import type { DailyRuneResult } from "@/features/runes/types/rune";
import type { MoonGuidanceResult } from "@/features/moon/types/moon";

type SharedContext = {
  dateKey: string;
  formattedDate: string;
  timezone: string;
  contentLocale: SpiritualContentLocale;
};

async function resolveSharedContext(
  locale: SupportedLocale,
): Promise<SharedContext> {
  const cookieStore = await cookies();
  const timezone = resolveTimeZone(cookieStore.get(TIMEZONE_COOKIE)?.value);
  const dateKey = getTodayDateKeyInTimeZone(timezone);

  try {
    parseIsoDateOnly(dateKey);
  } catch {
    const fallbackKey = getTodayDateKeyInTimeZone("UTC");
    return {
      dateKey: fallbackKey,
      formattedDate: formatDisplayDate(fallbackKey, locale),
      timezone,
      contentLocale: resolveSpiritualContentLocale(locale),
    };
  }

  return {
    dateKey,
    formattedDate: formatDisplayDate(dateKey, locale),
    timezone,
    contentLocale: resolveSpiritualContentLocale(locale),
  };
}

function loadPersonalDayForProfile(input: {
  birthDate: string;
  dateKey: string;
  locale: SpiritualContentLocale;
  userSeed: string;
}): PersonalDayResult | null {
  return buildPersonalDayResult({
    birthDate: input.birthDate,
    calculationDate: input.dateKey,
    locale: input.locale,
    userSeed: input.userSeed,
  });
}

function loadRuneForProfile(input: {
  birthDate: string;
  dateKey: string;
  locale: SpiritualContentLocale;
}): DailyRuneResult | null {
  try {
    const personalDay = calculatePersonalDay({
      birthDate: input.birthDate,
      calculationDate: input.dateKey,
      locale: input.locale,
    });
    const forDate = parseDateKey(input.dateKey);

    return buildDailyRuneResult({
      personalDayNumber: personalDay.personalDayNumber,
      forDate,
      locale: input.locale,
    });
  } catch {
    return null;
  }
}

async function loadMoonSection(
  locale: SupportedLocale,
): Promise<MoonGuidanceResult | null> {
  const contentLocale = resolveSpiritualContentLocale(locale);
  const loaded = await loadCurrentMoonGuidance(contentLocale);
  return loaded.status === "ready" ? loaded.guidance : null;
}

async function buildPreviewModel(
  locale: SupportedLocale,
  context: SharedContext,
  labels: {
    previewLabel: string;
    primaryLabel: string;
    moonUnavailable: string;
    personalizeMessage: string;
  },
): Promise<DailyGuidancePreviewModel> {
  const mock = getMockDailyGuidance(locale);
  const moon = composeMoonSection(
    await loadMoonSection(locale),
    labels.moonUnavailable,
    false,
  );

  return {
    formattedDate: context.formattedDate,
    previewLabel: labels.previewLabel,
    primary: {
      label: labels.primaryLabel,
      title: mock.title,
      message: mock.guidance,
      action: mock.action,
    },
    moon,
    runePreview: {
      title: locale === "ru" ? "Феху" : "Fehu",
      summary:
        locale === "ru"
          ? "Пример символического ориентира — не персональный расчёт."
          : "An example symbolic focus — not a personal calculation.",
      assetPath: "/assets/runes/symbols/fehu.svg",
    },
    personalizeMessage: labels.personalizeMessage,
  };
}

export async function loadDailyGuidance(
  locale: SupportedLocale,
): Promise<DailyGuidancePageModel> {
  const t = await getTranslations({ locale, namespace: "dailyGuidance" });
  const context = await resolveSharedContext(locale);
  const labels = {
    primaryLabel: t("heroEyebrow"),
    numerologyUnavailable: t("numerologyUnavailable"),
    moonUnavailable: t("moonUnavailable"),
    runeUnavailable: t("runeUnavailable"),
    previewLabel: t("previewLabel"),
    personalizeMessage: t("personalizeMessage"),
    formatPersonalDayExplanation: (number: number, title: string) =>
      t("personalDayExplanation", { number, title }),
  };

  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    return {
      kind: "anonymous",
      preview: await buildPreviewModel(locale, context, labels),
    };
  }

  const profile = await getProfileSnapshot(sessionUser.uid);

  if (!isProfileComplete(profile)) {
    const setupMessage = profile?.dateOfBirth
      ? t("completeProfile")
      : t("missingBirthDate");

    return {
      kind: "incomplete",
      incomplete: {
        formattedDate: context.formattedDate,
        greetingName: profile?.displayName ?? null,
        setupMessage,
        setupHref: "/onboarding",
      },
    };
  }

  if (!profile?.dateOfBirth) {
    return {
      kind: "incomplete",
      incomplete: {
        formattedDate: context.formattedDate,
        greetingName: profile?.displayName ?? null,
        setupMessage: t("missingBirthDate"),
        setupHref: "/onboarding",
      },
    };
  }

  const contentLocale = resolveSpiritualContentLocale(locale);

  const premiumActive = resolvePremiumAccess(profile);
  const birthDate = formatDateOfBirth(profile.dateOfBirth);

  const [numerology, moonLoaded, rune, universeRequest] = await Promise.all([
    Promise.resolve(
      loadPersonalDayForProfile({
        birthDate,
        dateKey: context.dateKey,
        locale: contentLocale,
        userSeed: sessionUser.uid,
      }),
    ),
    loadMoonSection(contentLocale),
    Promise.resolve(
      loadRuneForProfile({
        birthDate,
        dateKey: context.dateKey,
        locale: contentLocale,
      }),
    ),
    loadUniverseRequestViewModel({
      uid: sessionUser.uid,
      locale: contentLocale,
      dateKey: context.dateKey,
    }),
  ]);

  let runeDeep: string | null = null;
  if (premiumActive && rune) {
    const deepContent = await getCachedRuneDeepContent(
      rune.selection.runeId,
      contentLocale,
    );
    runeDeep = deepContent?.content.deep?.trim() || null;
  }

  const guidance = composeAuthenticatedGuidance({
    formattedDate: context.formattedDate,
    greetingName: profile.displayName ?? null,
    premiumActive,
    runeDeep,
    labels,
    numerology,
    moon: moonLoaded,
    rune,
  });

  if (!guidance) {
    return { kind: "session-error" };
  }

  return {
    kind: "authenticated",
    guidance: { ...guidance, universeRequest },
  };
}

export { sanitizeGuidanceForDiagnostics } from "@/features/daily-guidance/services/sanitize-guidance-diagnostics";
