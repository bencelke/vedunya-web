import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { mergeLocaleMessages } from "./merge-locale-messages";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const enMessages = (await import("../messages/en.json")).default;

  if (locale === routing.defaultLocale) {
    return {
      locale,
      messages: enMessages,
    };
  }

  const localeMessages = (await import(`../messages/${locale}.json`)).default;

  return {
    locale,
    messages: mergeLocaleMessages(enMessages, localeMessages),
  };
});
