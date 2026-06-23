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
      className={`mystic-cosmic-card min-w-0 overflow-hidden ${
        compact ? "p-4" : "p-6 text-center"
      }`}
    >
      <p className="text-sm leading-relaxed text-text-muted">{message}</p>
    </div>
  );
}
