import type { MoonLocalizedContent } from "@/features/moon/types/moon";

type MoonLunarDayCardProps = {
  lunarDayLabel: string;
  sectionLabel: string;
  missingLabel: string;
  actionLabel: string;
  reflectionLabel: string;
  content: MoonLocalizedContent | null;
  premiumActive: boolean;
};

export function MoonLunarDayCard({
  lunarDayLabel,
  sectionLabel,
  missingLabel,
  actionLabel,
  reflectionLabel,
  content,
  premiumActive,
}: MoonLunarDayCardProps) {
  if (!content) {
    return (
      <section className="mystic-cosmic-card space-y-3 p-5">
        <h2 className="mystic-eyebrow">{sectionLabel}</h2>
        <p className="text-sm text-text-muted">
          {lunarDayLabel} · {missingLabel}
        </p>
      </section>
    );
  }

  return (
    <section className="mystic-cosmic-card space-y-4 p-5">
      <h2 className="mystic-eyebrow">{sectionLabel}</h2>
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent-gold">
        {lunarDayLabel}
      </p>
      {content.title ? (
        <h3 className="text-lg font-medium text-text-primary">{content.title}</h3>
      ) : null}
      <p className="text-sm leading-[1.72] text-text-muted">{content.short}</p>
      {premiumActive && content.guidance.trim() && content.guidance !== content.short ? (
        <p className="text-sm leading-[1.72] text-text-primary">
          {content.guidance}
        </p>
      ) : null}
      {premiumActive && content.action?.trim() ? (
        <div className="space-y-2 border-t border-border-subtle/60 pt-4">
          <h4 className="text-xs font-medium uppercase tracking-[0.14em] text-accent-gold">
            {actionLabel}
          </h4>
          <p className="text-sm leading-[1.72] text-text-primary">
            {content.action}
          </p>
        </div>
      ) : null}
      {premiumActive && content.reflection?.trim() ? (
        <div className="space-y-2 border-t border-border-subtle/60 pt-4">
          <h4 className="text-xs font-medium uppercase tracking-[0.14em] text-text-subtle">
            {reflectionLabel}
          </h4>
          <p className="text-sm leading-[1.72] text-text-muted">
            {content.reflection}
          </p>
        </div>
      ) : null}
    </section>
  );
}
