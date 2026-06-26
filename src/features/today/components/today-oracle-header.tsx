import { User } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

export async function TodayOracleHeader() {
  const tA11y = await getTranslations("a11y");
  const tDaily = await getTranslations("dailyGuidance");

  return (
    <header className="mystic-today-oracle-header">
      <div className="relative flex min-h-[3.625rem] items-center justify-center px-[var(--spacing-page)]">
        <p className="mystic-today-brand" aria-label={tDaily("oracleBrandA11y")}>
          MYSTIC
        </p>
        <Link
          href="/profile"
          className="mystic-today-profile-btn absolute right-[var(--spacing-page)]"
          aria-label={tA11y("openProfile")}
        >
          <User className="h-[1.125rem] w-[1.125rem]" strokeWidth={1.75} aria-hidden="true" />
        </Link>
      </div>
      <div className="mystic-today-divider" aria-hidden="true" />
    </header>
  );
}
