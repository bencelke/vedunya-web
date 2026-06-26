import type { SupportedLocale } from "@/config/app-config";

export type SpiritualContentLocale = "en" | "ru";

/**
 * Maps UI locale to spiritual content locale (numerology, runes, moon).
 * German UI uses English spiritual content until manual DE translations exist.
 */
export function resolveSpiritualContentLocale(
  locale: SupportedLocale,
): SpiritualContentLocale {
  return locale === "ru" ? "ru" : "en";
}
