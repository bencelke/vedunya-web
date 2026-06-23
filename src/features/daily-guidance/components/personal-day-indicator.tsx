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
    <section className="mystic-cosmic-card px-5 py-4">
      <p className="mystic-eyebrow">{label}</p>
      <div className="mt-4 flex items-start gap-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-accent-gold/20 bg-accent-gold-muted/40 text-2xl font-light tabular-nums text-accent-gold"
          aria-hidden="true"
        >
          {number}
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-medium leading-snug text-text-primary">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-[1.72] text-text-muted">
            {explanation}
          </p>
        </div>
      </div>
    </section>
  );
}
