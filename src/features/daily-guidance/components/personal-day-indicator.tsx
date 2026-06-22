import type { DailyGuidanceNumerologySection } from "@/features/daily-guidance/types/daily-guidance-view-model";
import { isGuidanceReady } from "@/features/daily-guidance/types/daily-guidance-view-model";
import { SectionUnavailable } from "@/features/daily-guidance/components/section-unavailable";

type PersonalDayIndicatorProps = {
  numerology: DailyGuidanceNumerologySection;
  label: string;
};

export function PersonalDayIndicator({
  numerology,
  label,
}: PersonalDayIndicatorProps) {
  if (!isGuidanceReady(numerology)) {
    return (
      <SectionUnavailable
        label={label}
        message={numerology.message}
        compact
      />
    );
  }

  const { number, title, explanation } = numerology.data;

  return (
    <section className="rounded-[var(--radius-card)] border border-border-subtle/80 bg-surface-primary/60 px-5 py-4">
      <p className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-text-subtle">
        {label}
      </p>
      <div className="mt-3 flex items-start gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent-gold/20 bg-accent-gold-muted text-lg font-medium tabular-nums text-accent-gold"
          aria-hidden="true"
        >
          {number}
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-medium leading-snug text-text-primary">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            {explanation}
          </p>
        </div>
      </div>
    </section>
  );
}
