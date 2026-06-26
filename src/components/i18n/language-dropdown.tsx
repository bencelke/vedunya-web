"use client";

import { ChevronDown, Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { localeLabels } from "@/config/locale-labels";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type LanguageDropdownProps = {
  tone?: "auth" | "app";
  className?: string;
};

export function LanguageDropdown({
  tone = "app",
  className,
}: LanguageDropdownProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const tA11y = useTranslations("a11y");

  const isAuth = tone === "auth";

  function handleChange(nextLocale: string) {
    if (nextLocale === locale) {
      return;
    }

    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <div
      className={cn(
        "mystic-language-dropdown relative inline-flex items-center",
        className,
      )}
    >
      <Globe
        className={cn(
          "pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2",
          isAuth ? "text-auth-text-muted" : "text-text-subtle",
        )}
        aria-hidden="true"
      />
      <ChevronDown
        className={cn(
          "pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 opacity-60",
          isAuth ? "text-auth-text-muted" : "text-text-subtle",
        )}
        aria-hidden="true"
      />
      <select
        value={locale}
        onChange={(event) => handleChange(event.target.value)}
        aria-label={tA11y("languageSwitcher")}
        className={cn(
          "mystic-language-select min-h-9 min-w-[7.5rem] cursor-pointer appearance-none rounded-full border py-1.5 pl-8 pr-7 text-xs font-medium tracking-wide transition-colors",
          isAuth
            ? "border-auth-border bg-auth-surface text-auth-text-primary hover:border-auth-accent-gold/40"
            : "border-border-subtle/80 bg-surface-primary/70 text-text-primary hover:border-accent-gold/30",
        )}
      >
        {routing.locales.map((item) => (
          <option key={item} value={item}>
            {localeLabels[item]}
          </option>
        ))}
      </select>
    </div>
  );
}
