type DailyGuidanceLoadingSkeletonProps = {
  loadingLabel?: string;
};

export function DailyGuidanceLoadingSkeleton({
  loadingLabel = "Loading today’s guidance",
}: DailyGuidanceLoadingSkeletonProps) {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      role="status"
      className="animate-pulse motion-reduce:animate-none"
    >
      <span className="sr-only">{loadingLabel}</span>

      <div className="mb-8 space-y-3">
        <div className="h-4 w-20 rounded bg-surface-elevated" />
        <div className="h-7 w-44 max-w-full rounded bg-surface-elevated" />
        <div className="h-4 w-52 max-w-full rounded bg-surface-primary" />
      </div>

      <div className="mb-5 space-y-4 rounded-[calc(var(--radius-card)+0.25rem)] border border-border-subtle bg-surface-elevated p-6">
        <div className="h-3 w-28 rounded bg-surface-primary" />
        <div className="h-7 w-56 max-w-full rounded bg-surface-primary" />
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-surface-primary/80" />
          <div className="h-4 w-10/12 max-w-full rounded bg-surface-primary/80" />
        </div>
        <div className="rounded-[calc(var(--radius-card)-0.15rem)] border border-border-subtle bg-page-bg/30 p-4">
          <div className="h-3 w-24 rounded bg-surface-primary" />
          <div className="mt-3 h-4 w-full rounded bg-surface-primary/80" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="h-24 rounded-[var(--radius-card)] border border-border-subtle bg-surface-primary/60" />
        <div className="h-36 rounded-[var(--radius-card)] border border-border-subtle bg-surface-primary/70" />
        <div className="h-36 rounded-[var(--radius-card)] border border-border-subtle bg-surface-primary/70" />
      </div>
    </div>
  );
}
