import { Link } from "@/i18n/navigation";
import { MysticRuneSigil } from "@/features/runes/components/mystic-rune-sigil";
import { SectionUnavailable } from "@/features/daily-guidance/components/section-unavailable";
import type { DailyGuidanceRuneSection } from "@/features/daily-guidance/types/daily-guidance-view-model";
import { isGuidanceReady } from "@/features/daily-guidance/types/daily-guidance-view-model";
import type { CanonicalRuneId } from "@/features/runes/types/rune";

type DailyRuneSummaryProps = {
  rune: DailyGuidanceRuneSection;
  label: string;
  actionLabel: string;
  viewDetailsLabel: string;
  symbolAlt: string;
};

export function DailyRuneSummary({
  rune,
  label,
  actionLabel,
  viewDetailsLabel,
  symbolAlt,
}: DailyRuneSummaryProps) {
  if (!isGuidanceReady(rune)) {
    return <SectionUnavailable label={label} message={rune.message} compact />;
  }

  const data = rune.data;

  return (
    <section className="overflow-hidden rounded-[var(--radius-card)] border border-border-subtle/80 bg-surface-primary/75 p-5 backdrop-blur-sm">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-text-subtle">
        {label}
      </p>
      <h3 className="mt-2 text-lg font-medium leading-snug text-text-primary">
        {data.title}
      </h3>
      <div className="mt-4 flex items-start gap-4">
        <MysticRuneSigil
          runeId={data.runeId as CanonicalRuneId}
          alt={symbolAlt}
          size={72}
        />
        <p className="min-w-0 flex-1 text-sm leading-relaxed text-text-muted">
          {data.summary}
        </p>
      </div>
      {data.action ? (
        <div className="mt-4 border-t border-border-subtle/80 pt-4">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-accent-gold">
            {actionLabel}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-text-primary">
            {data.action}
          </p>
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
