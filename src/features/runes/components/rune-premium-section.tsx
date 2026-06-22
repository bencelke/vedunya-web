import { useTranslations } from "next-intl";

type RunePremiumSectionProps = {
  label: string;
  body: string;
  visible: boolean;
  locked: boolean;
};

export function RunePremiumSection({
  label,
  body,
  visible,
  locked,
}: RunePremiumSectionProps) {
  const t = useTranslations("runes");

  if (!visible) {
    return null;
  }

  if (locked) {
    return (
      <section className="rounded-[var(--radius-card)] border border-border-subtle bg-surface-primary p-5">
        <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-text-subtle">
          {label}
        </h2>
        <p className="mt-3 text-sm text-text-muted">{t("premiumSoon")}</p>
      </section>
    );
  }

  if (!body.trim()) {
    return null;
  }

  return (
    <section className="rounded-[var(--radius-card)] border border-border-subtle bg-surface-primary p-5">
      <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-accent-gold">
        {label}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-text-primary">{body}</p>
    </section>
  );
}
