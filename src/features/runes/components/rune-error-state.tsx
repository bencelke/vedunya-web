import { useTranslations } from "next-intl";

type RuneErrorStateProps = {
  compact?: boolean;
};

export function RuneErrorState({ compact = false }: RuneErrorStateProps) {
  const t = useTranslations("runes");

  return (
    <div
      className={`mystic-cosmic-card text-center ${compact ? "p-4" : "p-6"}`}
    >
      <p className="text-sm leading-relaxed text-text-muted">{t("loadError")}</p>
    </div>
  );
}
