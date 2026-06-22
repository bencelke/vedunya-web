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
      className="guidance-primary-surface relative overflow-hidden rounded-[calc(var(--radius-card)+0.25rem)] border border-accent-gold/25 bg-surface-elevated p-6 shadow-[0_24px_48px_-32px_rgba(0,0,0,0.85)]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(ellipse_80%_70%_at_50%_-20%,rgba(201,169,98,0.14),transparent_70%)]"
      />
      <div className="relative space-y-4">
        <p className="text-xs font-medium tracking-[0.12em] text-accent-gold">
          {primary.label}
        </p>
        <h2
          id="daily-guidance-primary-title"
          className="max-w-[28ch] text-xl font-medium leading-snug text-text-primary sm:text-2xl"
        >
          {primary.title}
        </h2>
        {primary.message ? (
          <p className="max-w-prose text-[0.9375rem] leading-7 text-text-muted">
            {primary.message}
          </p>
        ) : null}
        {primary.action ? (
          <div className="rounded-[calc(var(--radius-card)-0.15rem)] border border-accent-gold/15 bg-page-bg/40 p-4">
            <p className="text-xs font-medium tracking-[0.12em] text-accent-gold">
              {actionLabel}
            </p>
            <p className="mt-2 max-w-prose text-[0.9375rem] leading-7 text-text-primary">
              {primary.action}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
