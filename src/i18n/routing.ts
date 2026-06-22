import { defineRouting } from "next-intl/routing";

import { appConfig } from "@/config/app-config";

export const routing = defineRouting({
  locales: [...appConfig.supportedLocales],
  defaultLocale: appConfig.defaultLocale,
  localePrefix: "always",
});
