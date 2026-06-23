import { getTranslations } from "next-intl/server";

type DailyGuidanceHeaderProps = {
  formattedDate: string;
  greetingName: string | null;
};

export async function DailyGuidanceHeader({
  formattedDate,
  greetingName,
}: DailyGuidanceHeaderProps) {
  const t = await getTranslations("dailyGuidance");
  const tAuth = await getTranslations("auth.today");

  const greeting = greetingName
    ? tAuth("greetingNamed", { name: greetingName })
    : t("greeting");

  return (
    <header className="mb-10 space-y-4 text-center sm:text-left">
      <p className="mystic-auth-wordmark text-[1.125rem] tracking-[0.12em] text-accent-gold sm:text-left">
        {t("brandWordmark")}
      </p>
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-accent-gold">
          {formattedDate}
        </p>
        <h1 className="text-[clamp(1.75rem,5vw,2rem)] font-normal leading-[1.1] tracking-[-0.02em] text-text-primary">
          {greeting}
        </h1>
        <p className="mx-auto max-w-[22rem] text-sm leading-relaxed text-text-muted sm:mx-0">
          {t("pageSubtitle")}
        </p>
      </div>
    </header>
  );
}
