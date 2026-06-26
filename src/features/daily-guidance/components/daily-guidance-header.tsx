import { MysticBrandHeader } from "@/components/brand/mystic-brand-header";
import { getTranslations } from "next-intl/server";

type DailyGuidanceHeaderProps = {
  formattedDate: string;
  greetingName: string | null;
  variant?: "default" | "oracle";
};

export async function DailyGuidanceHeader({
  formattedDate,
  greetingName,
  variant = "default",
}: DailyGuidanceHeaderProps) {
  const t = await getTranslations("dailyGuidance");
  const tAuth = await getTranslations("auth");
  const tToday = await getTranslations("auth.today");

  const greeting = greetingName
    ? tToday("greetingNamed", { name: greetingName })
    : t("greeting");

  if (variant === "oracle") {
    return (
      <header className="mystic-today-greeting mb-8 space-y-2 text-center">
        <p className="mystic-today-date">{formattedDate}</p>
        <h1 className="mystic-today-greeting-title">{greeting}</h1>
      </header>
    );
  }

  return (
    <header className="mb-10 space-y-4 text-center sm:text-left">
      <MysticBrandHeader
        wordmark={tAuth("brandWordmark")}
        size="md"
        showLogo={false}
        className="items-center sm:items-start"
      />
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
