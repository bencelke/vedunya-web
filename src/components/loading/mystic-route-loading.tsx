type MysticRouteLoadingSkeletonProps = {
  loadingLabel?: string;
  variant?: "profile" | "plus" | "default";
};

export function MysticRouteLoadingSkeleton({
  loadingLabel = "Loading",
  variant = "default",
}: MysticRouteLoadingSkeletonProps) {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      role="status"
      className="mystic-route-loading animate-pulse motion-reduce:animate-none"
    >
      <span className="sr-only">{loadingLabel}</span>

      {variant === "plus" ? (
        <div className="mystic-reading-column space-y-6 px-[var(--spacing-page)] py-6">
          <div className="space-y-3 text-center">
            <div className="mx-auto h-4 w-24 rounded bg-surface-elevated/80" />
            <div className="mx-auto h-8 w-56 max-w-full rounded bg-surface-elevated" />
            <div className="mx-auto h-4 w-64 max-w-full rounded bg-surface-primary/70" />
          </div>
          <div className="rounded-[var(--radius-xl)] border border-border-subtle bg-surface-elevated/60 p-6">
            <div className="mx-auto h-5 w-40 rounded bg-surface-primary/80" />
            <div className="mx-auto mt-4 h-10 w-32 rounded bg-accent-gold/20" />
            <div className="mt-6 space-y-3">
              <div className="h-4 w-full rounded bg-surface-primary/70" />
              <div className="h-4 w-11/12 max-w-full rounded bg-surface-primary/70" />
              <div className="h-4 w-10/12 max-w-full rounded bg-surface-primary/70" />
            </div>
          </div>
          <div className="h-12 w-full rounded-[var(--radius-pill)] bg-accent-gold/15" />
        </div>
      ) : variant === "profile" ? (
        <div className="mystic-reading-column space-y-6 px-[var(--spacing-page)] py-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-surface-elevated" />
            <div className="space-y-2">
              <div className="h-5 w-36 rounded bg-surface-elevated" />
              <div className="h-4 w-28 rounded bg-surface-primary/70" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-28 rounded-[var(--radius-card)] border border-border-subtle bg-surface-primary/60" />
            <div className="h-24 rounded-[var(--radius-card)] border border-border-subtle bg-surface-primary/60" />
            <div className="h-32 rounded-[var(--radius-card)] border border-border-subtle bg-surface-primary/60" />
            <div className="h-20 rounded-[var(--radius-card)] border border-border-subtle bg-surface-primary/60" />
          </div>
        </div>
      ) : (
        <div className="space-y-4 px-[var(--spacing-page)] py-6">
          <div className="h-7 w-44 rounded bg-surface-elevated" />
          <div className="h-36 rounded-[var(--radius-card)] border border-border-subtle bg-surface-primary/60" />
        </div>
      )}
    </div>
  );
}
