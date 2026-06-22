type CourseProgressBarProps = {
  percent: number;
  label: string;
};

export function CourseProgressBar({ percent, label }: CourseProgressBarProps) {
  const clampedPercent = Math.min(100, Math.max(0, percent));

  return (
    <div className="min-w-0 overflow-hidden">
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-xs font-medium tracking-[0.08em] text-text-muted">
          {label}
        </p>
        <span className="shrink-0 text-xs tabular-nums text-accent-gold">
          {clampedPercent}%
        </span>
      </div>
      <div
        aria-hidden
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-primary"
      >
        <div
          className="h-full rounded-full bg-accent-gold transition-[width] duration-300"
          style={{ width: `${clampedPercent}%` }}
        />
      </div>
    </div>
  );
}
