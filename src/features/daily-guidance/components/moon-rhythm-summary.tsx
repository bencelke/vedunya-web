import { Link } from "@/i18n/navigation";

import { MoonPhaseVisual } from "@/features/moon/components/moon-phase-visual";
import { SectionUnavailable } from "@/features/daily-guidance/components/section-unavailable";
import type { DailyGuidanceMoonSection } from "@/features/daily-guidance/types/daily-guidance-view-model";
import { isGuidanceReady } from "@/features/daily-guidance/types/daily-guidance-view-model";
import type { MoonPhase4Id } from "@/features/moon/types/moon";

type MoonRhythmSummaryProps = {
  moon: DailyGuidanceMoonSection;
  label: string;
  lunarDayLabel: string;
  viewDetailsLabel: string;
  phaseVisualAlt: string;
  deepLabel?: string;
  actionLabel?: string;
};

export function MoonRhythmSummary({
  moon,
  label,
  lunarDayLabel,
  viewDetailsLabel,
  phaseVisualAlt,
  deepLabel,
  actionLabel,
}: MoonRhythmSummaryProps) {
  if (!isGuidanceReady(moon)) {
    return <SectionUnavailable label={label} message={moon.message} />;
  }

  const data = moon.data;

  return (
    <section className="mystic-cosmic-card p-5">
      <p className="mystic-eyebrow">{label}</p>
      <h3 className="mt-2 text-base font-medium leading-snug text-text-primary">
        {data.phaseTitle}
      </h3>
      <div className="mt-4 flex items-start gap-4">
        <MoonPhaseVisual
          phase4Id={data.phaseId as MoonPhase4Id}
          alt={phaseVisualAlt}
          size={72}
        />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-xs text-text-subtle">{lunarDayLabel}</p>
          <p className="text-sm leading-[1.72] text-text-muted">{data.summary}</p>
        </div>
      </div>
      {data.deep ? (
        <div className="mt-4 border-t border-border-subtle/70 pt-4">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-text-subtle">
            {deepLabel}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">{data.deep}</p>
        </div>
      ) : null}
      {data.action ? (
        <div className="mt-4 border-t border-border-subtle/70 pt-4">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent-gold">
            {actionLabel}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-text-primary">{data.action}</p>
        </div>
      ) : null}
      <Link
        href={data.href}
        className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-accent-gold underline-offset-4 hover:underline"
      >
        {viewDetailsLabel}
      </Link>
    </section>
  );
}
