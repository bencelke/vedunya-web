type CourseErrorStateProps = {
  message: string;
  compact?: boolean;
};

export function CourseErrorState({
  message,
  compact = false,
}: CourseErrorStateProps) {
  return (
    <div
      aria-live="polite"
      className={`min-w-0 overflow-hidden rounded-[var(--radius-card)] border border-border-subtle bg-surface-elevated ${
        compact ? "p-4" : "p-6 text-center"
      }`}
    >
      <p className="text-sm leading-relaxed text-text-muted">{message}</p>
    </div>
  );
}
