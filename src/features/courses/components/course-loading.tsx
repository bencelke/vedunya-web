export function CourseCatalogLoadingSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      role="status"
      className="animate-pulse space-y-5 motion-reduce:animate-none"
    >
      <div className="h-44 rounded-[var(--radius-card)] border border-border-subtle bg-surface-elevated/80" />
      <div className="h-44 rounded-[var(--radius-card)] border border-border-subtle bg-surface-elevated/70" />
    </div>
  );
}

export function CourseDetailLoadingSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      role="status"
      className="animate-pulse space-y-6 motion-reduce:animate-none"
    >
      <div className="h-52 rounded-[var(--radius-card)] border border-border-subtle bg-surface-elevated" />
      <div className="space-y-3">
        <div className="h-16 rounded-[var(--radius-card)] bg-surface-primary/70" />
        <div className="h-16 rounded-[var(--radius-card)] bg-surface-primary/70" />
        <div className="h-16 rounded-[var(--radius-card)] bg-surface-primary/70" />
      </div>
    </div>
  );
}

export function LessonReaderLoadingSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      role="status"
      className="animate-pulse space-y-4 motion-reduce:animate-none"
    >
      <div className="h-8 w-2/3 max-w-full rounded bg-surface-elevated" />
      <div className="h-4 w-full rounded bg-surface-primary/70" />
      <div className="h-4 w-11/12 max-w-full rounded bg-surface-primary/70" />
      <div className="h-28 rounded-[var(--radius-card)] bg-surface-primary/60" />
    </div>
  );
}
