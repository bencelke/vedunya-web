import { useTranslations } from "next-intl";

type MoonErrorStateProps = {
  compact?: boolean;
};

export function MoonErrorState({ compact = false }: MoonErrorStateProps) {
  const t = useTranslations("moon");

  return (
    <div
      className={`mystic-cosmic-card text-center ${compact ? "p-4" : "p-6"}`}
    >
      <p className="text-sm leading-relaxed text-text-muted">{t("loadError")}</p>
    </div>
  );
}
