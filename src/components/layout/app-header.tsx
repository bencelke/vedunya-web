"use client";

import { useLocale, useTranslations } from "next-intl";

import { BrandMark } from "@/components/brand/brand-mark";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { routing } from "@/i18n/routing";

type AppHeaderProps = {
  showLogin?: boolean;
  showProfile?: boolean;
  className?: string;
};

export function AppHeader({
  showLogin = true,
  showProfile = false,
  className,
}: AppHeaderProps) {
  const t = useTranslations("common");
  const tDaily = useTranslations("dailyGuidance");
  const tA11y = useTranslations("a11y");
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <header
      className={cn(
        "mystic-chrome-header sticky top-0 z-40",
        className,
      )}
    >
      <div className="mystic-shell flex h-[var(--header-height)] items-center justify-between px-[var(--spacing-page)]">
        <Link
          href="/today"
          className="inline-flex min-h-11 min-w-11 items-center"
        >
          <BrandMark compact showLogo />
        </Link>

        <div className="flex items-center gap-2">
          <nav aria-label={tA11y("languageSwitcher")}>
            <ul className="flex items-center rounded-full border border-border-subtle bg-surface-primary/80 p-1">
              {routing.locales.map((item) => {
                const isActive = locale === item;

                return (
                  <li key={item}>
                    <Link
                      href={pathname}
                      locale={item}
                      className={cn(
                        "inline-flex min-h-9 min-w-9 items-center justify-center rounded-full px-3 text-xs font-semibold uppercase tracking-wide transition-colors",
                        isActive
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

          {showProfile ? (
            <Link
              href="/profile"
              className="inline-flex min-h-11 items-center rounded-full border border-border-subtle px-3 text-sm text-text-muted transition-colors hover:border-accent-gold/40 hover:text-text-primary"
            >
              {tDaily("profileLink")}
            </Link>
          ) : null}

          {showLogin ? (
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center rounded-full px-3 text-sm text-text-muted transition-colors hover:text-text-primary"
            >
              {t("login")}
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
