type SectionUnavailableProps = {
  label: string;
  message: string;
  compact?: boolean;
};

export function SectionUnavailable({
  label,
  message,
  compact = false,
}: SectionUnavailableProps) {
  return (
    <section
      aria-live="polite"
      className={`rounded-[var(--radius-card)] border border-border-subtle bg-surface-primary/50 ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <p className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-text-subtle">
        {label}
      </p>
      <p className={`text-sm leading-relaxed text-text-muted ${compact ? "mt-2" : "mt-3"}`}>
        {message}
      </p>
    </section>
  );
}
