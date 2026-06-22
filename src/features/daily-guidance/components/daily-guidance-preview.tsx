import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { RuneSymbol } from "@/features/runes/components/rune-symbol";
import { MoonRhythmSummary } from "@/features/daily-guidance/components/moon-rhythm-summary";
import { PrimaryGuidanceCard } from "@/features/daily-guidance/components/primary-guidance-card";
import type { DailyGuidancePreviewModel } from "@/features/daily-guidance/types/daily-guidance-view-model";

type DailyGuidancePreviewProps = {
  preview: DailyGuidancePreviewModel;
};

export async function DailyGuidancePreview({
  preview,
}: DailyGuidancePreviewProps) {
  const t = await getTranslations("dailyGuidance");
  const tCommon = await getTranslations("common");
  const tMoon = await getTranslations("moon");
  const tRunes = await getTranslations("runes");

  const moonPhaseTitle =
    preview.moon.status === "ready" ? preview.moon.data.phaseTitle : "";

  return (
    <div className="space-y-5">
      <p className="rounded-[var(--radius-card)] border border-border-subtle bg-surface-primary/80 px-4 py-3 text-sm leading-relaxed text-text-muted">
        {preview.previewLabel}
      </p>

      <PrimaryGuidanceCard
        primary={preview.primary}
        actionLabel={t("actionLabel")}
      />

      {preview.moon.status === "ready" ? (
        <MoonRhythmSummary
          moon={preview.moon}
          label={t("moonRhythmLabel")}
          lunarDayLabel={tMoon("lunarDayLabel", {
            day: preview.moon.data.lunarDay,
          })}
          viewDetailsLabel={t("viewMoonDetails")}
          phaseVisualAlt={tMoon("phaseVisualA11y", { phase: moonPhaseTitle })}
        />
      ) : null}

      <section className="rounded-[var(--radius-card)] border border-border-subtle bg-surface-primary/70 p-5">
        <p className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-text-subtle">
          {t("runeFocusLabel")}
        </p>
        <h3 className="mt-2 text-base font-medium leading-snug text-text-primary">
          {preview.runePreview.title}
        </h3>
        <div className="mt-3 flex items-start gap-4">
          <RuneSymbol
            runeId="fehu"
            alt={tRunes("symbolA11y", { rune: preview.runePreview.title })}
            size={56}
          />
          <p className="min-w-0 flex-1 text-sm leading-relaxed text-text-muted">
            {preview.runePreview.summary}
          </p>
        </div>
      </section>

      <div className="space-y-3 rounded-[var(--radius-card)] border border-accent-gold/20 bg-surface-elevated p-5">
        <p className="text-sm leading-relaxed text-text-muted">
          {preview.personalizeMessage}
        </p>
        <Link
          href="/login"
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-accent-gold px-6 text-sm font-medium text-page-bg transition-opacity hover:opacity-95"
        >
          {tCommon("login")}
        </Link>
      </div>
    </div>
  );
}
