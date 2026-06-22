export const appConfig = {
  name: "Mystic by Vedunya Maria",
  shortName: "Mystic",
  description:
    "Daily guidance for a calmer, clearer day — personalized spiritual support from Vedunya Maria.",
  defaultLocale: "en",
  supportedLocales: ["en", "ru"] as const,
  supportEmail: "support@vedunya.com",
  productionUrl: "https://app.vedunya.com",
} as const;

export type SupportedLocale = (typeof appConfig.supportedLocales)[number];
