import { useTranslations } from "next-intl";

type RuneErrorStateProps = {
  compact?: boolean;
};

export function RuneErrorState({ compact = false }: RuneErrorStateProps) {
  const t = useTranslations("runes");

  if (compact) {
    return (
      <div className="rounded-[var(--radius-card)] border border-border-subtle bg-surface-elevated p-4">
        <p className="text-sm text-text-muted">{t("loadError")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-border-subtle bg-surface-elevated p-6 text-center">
      <p className="text-sm text-text-muted">{t("loadError")}</p>
    </div>
  );
}
