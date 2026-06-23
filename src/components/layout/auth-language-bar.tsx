"use client";

import { useLocale, useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type AuthLanguageBarProps = {
  backHref?: string;
  backLabel?: string;
  tone?: "auth" | "app";
};

export function AuthLanguageBar({
  backHref,
  backLabel,
  tone = "auth",
}: AuthLanguageBarProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const tA11y = useTranslations("a11y");

  const isAuth = tone === "auth";

  return (
    <div className="flex items-center justify-between gap-3">
      {backHref && backLabel ? (
        <Link
          href={backHref}
          className={cn(
            "inline-flex min-h-10 items-center text-sm underline-offset-4 hover:underline",
            isAuth ? "text-auth-text-muted" : "text-text-muted",
          )}
        >
          {backLabel}
        </Link>
      ) : (
        <span aria-hidden="true" />
      )}

      <nav aria-label={tA11y("languageSwitcher")}>
        <ul
          className={cn(
            "flex items-center p-0.5",
            isAuth
              ? "mystic-auth-lang-toggle"
              : "rounded-full border border-border-subtle bg-surface-primary",
          )}
        >
          {routing.locales.map((item) => {
            const isActive = locale === item;

            return (
              <li key={item}>
                <Link
                  href={pathname}
                  locale={item}
                  className={cn(
                    "inline-flex min-h-9 min-w-9 items-center justify-center rounded-full px-3 text-xs font-semibold uppercase tracking-wide transition-colors",
                    isAuth
                      ? isActive
                        ? "mystic-auth-lang-chip-active"
                        : "text-auth-text-primary hover:text-auth-text-muted"
                      : isActive
                        ? "bg-accent-gold-muted text-accent-gold"
                        : "text-text-muted hover:text-text-primary",
                  )}
                  aria-current={isActive ? "true" : undefined}
                >
                  {item}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
