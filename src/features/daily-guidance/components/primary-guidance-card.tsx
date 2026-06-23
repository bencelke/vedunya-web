import type { DailyGuidancePrimary } from "@/features/daily-guidance/types/daily-guidance-view-model";

type PrimaryGuidanceCardProps = {
  primary: DailyGuidancePrimary;
  actionLabel: string;
};

export function PrimaryGuidanceCard({
  primary,
  actionLabel,
}: PrimaryGuidanceCardProps) {
  return (
    <section
      aria-labelledby="daily-guidance-primary-title"
      className="guidance-primary-surface mystic-cosmic-card-elevated relative overflow-hidden p-6 sm:p-7"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[var(--glow-gold)]"
      />
      <div className="relative space-y-4 text-center sm:text-left">
        <p className="mystic-eyebrow">{primary.label}</p>
        <h2
          id="daily-guidance-primary-title"
          className="mx-auto max-w-[22rem] text-[clamp(1.375rem,4.5vw,1.75rem)] font-normal leading-[1.2] tracking-[-0.02em] text-text-primary sm:mx-0"
        >
          {primary.title}
        </h2>
        {primary.message ? (
          <p className="mx-auto max-w-[24rem] text-[0.9375rem] leading-[1.72] text-text-muted sm:mx-0">
            {primary.message}
          </p>
        ) : null}
        {primary.action ? (
          <div className="mx-auto max-w-[24rem] rounded-[var(--radius-md)] border border-accent-gold/20 bg-page-bg/40 p-4 text-left sm:mx-0">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent-gold">
              {actionLabel}
            </p>
            <p className="mt-2 text-[0.9375rem] leading-[1.72] text-text-primary">
              {primary.action}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
