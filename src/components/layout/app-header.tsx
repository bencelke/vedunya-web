"use client";

import { useTranslations } from "next-intl";

import { BrandMark } from "@/components/brand/brand-mark";
import { LanguageDropdown } from "@/components/i18n/language-dropdown";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

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
          <LanguageDropdown />

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
