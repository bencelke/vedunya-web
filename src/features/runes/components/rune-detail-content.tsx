import { useTranslations } from "next-intl";

import { RuneFieldCard } from "@/features/runes/components/rune-field-card";
import { RuneMeaningCard } from "@/features/runes/components/rune-meaning-card";
import { RunePremiumLockCard } from "@/features/runes/components/rune-premium-lock-card";
import type { RuneDetailResult } from "@/features/runes/types/rune";

type RuneDetailContentProps = {
  detail: RuneDetailResult;
};

export function RuneDetailContent({ detail }: RuneDetailContentProps) {
  const t = useTranslations("runes");
  const { content, access, showPremiumLock } = detail;

  return (
    <div className="space-y-5">
      <RuneMeaningCard label={t("meaningLabel")} body={content.short} />

      {access.premiumActive && content.deep.trim() ? (
        <RuneFieldCard label={t("deepMeaningLabel")} body={content.deep} />
      ) : null}

      {access.premiumActive && content.action.trim() ? (
        <RuneFieldCard label={t("actionLabel")} body={content.action} />
      ) : null}

      {access.premiumActive && content.warning.trim() ? (
        <RuneFieldCard
          label={t("warningLabel")}
          body={content.warning}
          tone="muted"
        />
      ) : null}

      {access.premiumActive && content.affirmation.trim() ? (
        <RuneFieldCard label={t("affirmationLabel")} body={content.affirmation} />
      ) : null}

      {access.premiumActive && content.reflection.trim() ? (
        <RuneFieldCard
          label={t("reflectionLabel")}
          body={content.reflection}
          tone="muted"
        />
      ) : null}

      {showPremiumLock ? (
        <RunePremiumLockCard
          title={t("premiumLockTitle")}
          body={t("premiumLockBody")}
          ctaLabel={t("premiumLockCta")}
        />
      ) : null}
    </div>
  );
}
