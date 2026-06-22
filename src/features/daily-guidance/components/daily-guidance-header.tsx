import { getTranslations } from "next-intl/server";

import { BrandMark } from "@/components/brand/brand-mark";
import { Link } from "@/i18n/navigation";

type DailyGuidanceHeaderProps = {
  formattedDate: string;
  greetingName: string | null;
  showProfile?: boolean;
};

export async function DailyGuidanceHeader({
  formattedDate,
  greetingName,
  showProfile = false,
}: DailyGuidanceHeaderProps) {
  const t = await getTranslations("dailyGuidance");
  const tAuth = await getTranslations("auth.today");

  const greeting = greetingName
    ? tAuth("greetingNamed", { name: greetingName })
    : t("greeting");

  return (
    <header className="mb-8 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <BrandMark compact showLogo />
        {showProfile ? (
          <Link
            href="/profile"
            className="inline-flex min-h-11 items-center rounded-full border border-border-subtle px-4 text-sm text-text-muted transition-colors hover:border-accent-gold/40 hover:text-text-primary"
          >
            {t("profileLink")}
          </Link>
        ) : null}
      </div>
      <div className="space-y-1">
        <p className="text-sm text-text-subtle">{formattedDate}</p>
        <h1 className="text-[1.625rem] font-medium leading-tight tracking-tight text-text-primary">
          {greeting}
        </h1>
        <p className="text-sm text-text-muted">{t("pageSubtitle")}</p>
      </div>
    </header>
  );
}
