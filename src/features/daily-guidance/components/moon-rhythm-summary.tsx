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
};

export function MoonRhythmSummary({
  moon,
  label,
  lunarDayLabel,
  viewDetailsLabel,
  phaseVisualAlt,
}: MoonRhythmSummaryProps) {
  if (!isGuidanceReady(moon)) {
    return <SectionUnavailable label={label} message={moon.message} />;
  }

  const data = moon.data;

  return (
    <section className="rounded-[var(--radius-card)] border border-border-subtle bg-surface-primary/70 p-5">
      <p className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-text-subtle">
        {label}
      </p>
      <h3 className="mt-2 text-base font-medium leading-snug text-text-primary">
        {data.phaseTitle}
      </h3>
      <div className="mt-3 flex items-start gap-4">
        <MoonPhaseVisual
          phase4Id={data.phaseId as MoonPhase4Id}
          alt={phaseVisualAlt}
          size={64}
        />
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-xs text-text-subtle">{lunarDayLabel}</p>
          <p className="text-sm leading-relaxed text-text-muted">{data.summary}</p>
        </div>
      </div>
      <Link
        href={data.href}
        className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-accent-gold underline-offset-4 hover:underline"
      >
        {viewDetailsLabel}
      </Link>
    </section>
  );
}
