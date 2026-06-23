type TodayActionCardProps = {
  label: string;
  body: string;
  deepLabel?: string;
  deepBody?: string | null;
};

export function TodayActionCard({
  label,
  body,
  deepLabel,
  deepBody,
}: TodayActionCardProps) {
  if (!body.trim()) {
    return null;
  }

  return (
    <section className="mystic-cosmic-card space-y-4 p-5">
      <p className="mystic-eyebrow">{label}</p>
      <p className="text-sm leading-[1.72] text-text-primary">{body}</p>
      {deepBody?.trim() && deepLabel ? (
        <div className="border-t border-border-subtle/70 pt-4">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-text-subtle">
            {deepLabel}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">{deepBody}</p>
        </div>
      ) : null}
    </section>
  );
}
