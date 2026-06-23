import type { MoonLocalizedContent } from "@/features/moon/types/moon";

type MoonPhaseCardProps = {
  phase: MoonLocalizedContent;
  meaningLabel: string;
  practiceLabel: string;
  reflectionLabel: string;
  premiumActive: boolean;
};

export function MoonPhaseCard({
  phase,
  meaningLabel,
  practiceLabel,
  reflectionLabel,
  premiumActive,
}: MoonPhaseCardProps) {
  const practice =
    premiumActive && phase.action?.trim() ? phase.action : null;

  return (
    <section className="mystic-cosmic-card space-y-4 p-5">
      <h2 className="mystic-eyebrow">{meaningLabel}</h2>
      <p className="text-sm leading-[1.72] text-text-muted">{phase.short}</p>
      {premiumActive && phase.guidance.trim() && phase.guidance !== phase.short ? (
        <p className="text-sm leading-[1.72] text-text-primary">
          {phase.guidance}
        </p>
      ) : null}
      {practice ? (
        <div className="space-y-2 border-t border-border-subtle/60 pt-4">
          <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-accent-gold">
            {practiceLabel}
          </h3>
          <p className="text-sm leading-[1.72] text-text-primary">{practice}</p>
        </div>
      ) : null}
      {premiumActive && phase.reflection?.trim() ? (
        <div className="space-y-2 border-t border-border-subtle/60 pt-4">
          <h3 className="text-xs font-medium uppercase tracking-[0.14em] text-text-subtle">
            {reflectionLabel}
          </h3>
          <p className="text-sm leading-[1.72] text-text-muted">
            {phase.reflection}
          </p>
        </div>
      ) : null}
    </section>
  );
}
