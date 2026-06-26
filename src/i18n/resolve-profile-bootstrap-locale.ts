import type { SupportedLocale } from "@/config/app-config";
import type { SupportedProfileLocale } from "@/features/profile/constants";

/** Maps UI locale to profile language for bootstrap (profile stores en/ru only). */
export function resolveProfileBootstrapLocale(
  locale: SupportedLocale,
): SupportedProfileLocale {
  return locale === "ru" ? "ru" : "en";
}
