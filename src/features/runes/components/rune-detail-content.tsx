import { useTranslations } from "next-intl";

import type { RuneDetailResult } from "@/features/runes/types/rune";
import { RunePremiumSection } from "@/features/runes/components/rune-premium-section";

type RuneDetailContentProps = {
  detail: RuneDetailResult;
};

export function RuneDetailContent({ detail }: RuneDetailContentProps) {
  const t = useTranslations("runes");
  const { content, access } = detail;

  return (
    <div className="space-y-6">
      <section className="rounded-[var(--radius-card)] border border-border-subtle bg-surface-elevated p-5">
        <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-accent-gold">
          {t("shortMeaningLabel")}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-text-muted">
          {content.short}
        </p>
      </section>

      <RunePremiumSection
        label={t("deepMeaningLabel")}
        visible={access.premiumActive || Boolean(content.deep)}
        locked={!access.premiumActive}
        body={content.deep}
      />

      <RunePremiumSection
        label={t("actionLabel")}
        visible={access.premiumActive || Boolean(content.action)}
        locked={!access.premiumActive}
        body={content.action}
      />

      <RunePremiumSection
        label={t("warningLabel")}
        visible={access.premiumActive || Boolean(content.warning)}
        locked={!access.premiumActive}
        body={content.warning}
      />

      <RunePremiumSection
        label={t("affirmationLabel")}
        visible={access.premiumActive || Boolean(content.affirmation)}
        locked={!access.premiumActive}
        body={content.affirmation}
      />

      <RunePremiumSection
        label={t("reflectionLabel")}
        visible={access.premiumActive || Boolean(content.reflection)}
        locked={!access.premiumActive}
        body={content.reflection}
      />
    </div>
  );
}
