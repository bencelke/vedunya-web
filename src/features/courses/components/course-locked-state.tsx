type CourseLockedStateProps = {
  title: string;
  message: string;
};

export function CourseLockedState({ title, message }: CourseLockedStateProps) {
  return (
    <div className="min-w-0 overflow-hidden rounded-[var(--radius-card)] border border-accent-gold/20 bg-surface-primary p-5">
      <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-accent-gold">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-text-muted">{message}</p>
    </div>
  );
}
